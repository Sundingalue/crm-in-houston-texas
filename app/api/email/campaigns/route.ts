import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { ensureFeatureEnabled, requireWorkspaceId } from "@/lib/db/workspace";
import { CampaignChannel, CampaignStatus } from "@prisma/client";
import { ensurePermission } from "@/lib/auth/permissions";

const campaignSchema = z.object({
  name: z.string(),
  subject: z.string(),
  channel: z.nativeEnum(CampaignChannel),
  status: z.nativeEnum(CampaignStatus).default(CampaignStatus.borrador),
  body: z.string().optional(),
  segment: z.string().optional(),
});

const campaignUpdateSchema = campaignSchema.extend({
  id: z.string(),
});

const campaignDeleteSchema = z.object({ id: z.string() });

export async function GET() {
  const workspaceId = await requireWorkspaceId();
  const enabled = await ensureFeatureEnabled(workspaceId, "campaigns");
  if (!enabled) return NextResponse.json({ message: "CAMPAIGNS_DISABLED" }, { status: 403 });
  await ensurePermission(workspaceId, "campaigns", "view");
  const campaigns = await prisma.campaign.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(campaigns);
}

export async function POST(request: Request) {
  const workspaceId = await requireWorkspaceId();
  const enabled = await ensureFeatureEnabled(workspaceId, "campaigns");
  if (!enabled) return NextResponse.json({ message: "CAMPAIGNS_DISABLED" }, { status: 403 });
  await ensurePermission(workspaceId, "campaigns", "create");
  const payload = campaignSchema.parse(await request.json());
  const campaign = await prisma.campaign.create({
    data: {
      name: payload.name,
      subject: payload.subject,
      channel: payload.channel,
      status: payload.status,
      workspaceId,
    },
  });
  return NextResponse.json({
    message: "Campaña programada",
    campaign,
  });
}

export async function PATCH(request: Request) {
  const workspaceId = await requireWorkspaceId();
  const enabled = await ensureFeatureEnabled(workspaceId, "campaigns");
  if (!enabled) return NextResponse.json({ message: "CAMPAIGNS_DISABLED" }, { status: 403 });
  await ensurePermission(workspaceId, "campaigns", "edit");
  const payload = campaignUpdateSchema.parse(await request.json());
  const campaign = await prisma.campaign.update({
    where: { id: payload.id, workspaceId },
    data: {
      name: payload.name,
      subject: payload.subject,
      channel: payload.channel,
      status: payload.status,
      body: payload.body,
      segment: payload.segment,
    },
  });
  return NextResponse.json({ message: "Campaña actualizada", campaign });
}

export async function DELETE(request: Request) {
  const workspaceId = await requireWorkspaceId();
  const enabled = await ensureFeatureEnabled(workspaceId, "campaigns");
  if (!enabled) return NextResponse.json({ message: "CAMPAIGNS_DISABLED" }, { status: 403 });
  await ensurePermission(workspaceId, "campaigns", "delete");
  const payload = campaignDeleteSchema.parse(await request.json());
  await prisma.campaign.delete({ where: { id: payload.id, workspaceId } });
  return NextResponse.json({ message: "Campaña eliminada" });
}
