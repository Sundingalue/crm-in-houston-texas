import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { requireWorkspaceId } from "@/lib/db/workspace";
import { ensurePermission } from "@/lib/auth/permissions";
import { MessageChannel } from "@prisma/client";

const sendSchema = z.object({
  campaignId: z.string(),
  segmentId: z.string().optional(),
});

type SegmentFilter = {
  status?: string[];
  ownerId?: string;
};

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM ?? "no-reply@inhoustontexas.us";

async function resolveRecipients(workspaceId: string, segmentId?: string) {
  if (!segmentId) {
    const contacts = await prisma.contact.findMany({ where: { workspaceId, email: { not: "" } } });
    return contacts.map((c) => ({ email: c.email, name: c.name }));
  }
  const segment = await prisma.segment.findFirst({ where: { id: segmentId, workspaceId } });
  if (!segment) return [];
  const filter = (segment.filter as SegmentFilter) ?? {};
  const contacts = await prisma.contact.findMany({
    where: {
      workspaceId,
      ...(filter.ownerId ? { account: { contacts: { some: { id: filter.ownerId } } } } : {}),
    },
  });
  return contacts.map((c) => ({ email: c.email, name: c.name }));
}

async function sendViaSendGrid(recipient: { email: string; name: string }, subject: string, body: string) {
  if (!SENDGRID_API_KEY) return false;
  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: recipient.email, name: recipient.name }] }],
      from: { email: EMAIL_FROM },
      subject,
      content: [{ type: "text/plain", value: body }],
    }),
  });
  return response.ok;
}

export async function POST(request: NextRequest) {
  const workspaceId = await requireWorkspaceId();
  await ensurePermission(workspaceId, "campaigns", "create");
  const payload = sendSchema.parse(await request.json());

  const campaign = await prisma.campaign.findFirst({ where: { id: payload.campaignId, workspaceId } });
  if (!campaign) return NextResponse.json({ message: "CAMPAIGN_NOT_FOUND" }, { status: 404 });

  const recipients = await resolveRecipients(workspaceId, payload.segmentId);
  let sent = 0;

  for (const recipient of recipients) {
    const ok = await sendViaSendGrid(recipient, campaign.subject, campaign.name);
    if (ok) sent += 1;
    await prisma.message.create({
      data: {
        channel: MessageChannel.email,
        body: campaign.name,
        workspaceId,
        metadata: { recipient, campaignId: campaign.id, provider: SENDGRID_API_KEY ? "sendgrid" : "stub" },
      },
    });
  }

  return NextResponse.json({
    message: SENDGRID_API_KEY ? "CAMPAIGN_SENT" : "CAMPAIGN_STUB_SENT",
    recipients: recipients.length,
    delivered: sent,
  });
}
