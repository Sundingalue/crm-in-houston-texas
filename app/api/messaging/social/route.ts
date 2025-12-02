import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { MessageChannel } from "@prisma/client";
import { ensureFeatureEnabled, requireWorkspaceId } from "@/lib/db/workspace";
import { prisma } from "@/lib/db/client";
import { readMetaConfig, sendSocialDm } from "@/lib/social/meta";
import { enforceRateLimit } from "@/lib/utils/rate-limit";
import { ensurePermission } from "@/lib/auth/permissions";

const dmSchema = z.object({
  contactId: z.string().optional(),
  handle: z.string().min(2),
  platform: z.enum(["instagram", "facebook"]),
  message: z.string().min(2),
});

export async function GET(request: NextRequest) {
  const workspaceId = await requireWorkspaceId();
  const enabled = await ensureFeatureEnabled(workspaceId, "whatsapp");
  if (!enabled) return NextResponse.json({ message: "MESSAGING_DISABLED" }, { status: 403 });
  await ensurePermission(workspaceId, "messaging", "view");
  const contactId = request.nextUrl.searchParams.get("contactId") ?? undefined;

  const history = await prisma.message.findMany({
    where: {
      workspaceId,
      channel: MessageChannel.social,
      ...(contactId ? { contactId } : {}),
    },
    orderBy: { sentAt: "desc" },
    take: contactId ? 50 : 20,
  });

  return NextResponse.json(history);
}

export async function POST(request: Request) {
  const workspaceId = await requireWorkspaceId();
  const enabled = await ensureFeatureEnabled(workspaceId, "whatsapp");
  if (!enabled) return NextResponse.json({ message: "MESSAGING_DISABLED" }, { status: 403 });
  await ensurePermission(workspaceId, "messaging", "create");
  const payload = dmSchema.parse(await request.json());
  enforceRateLimit(`social:${payload.handle}`, 25, 60_000);

  const config = readMetaConfig();
  if (!config) {
    return NextResponse.json({ message: "SOCIAL_CONFIG_MISSING" }, { status: 501 });
  }

  let providerResponse;
  try {
    providerResponse = await sendSocialDm(config, {
      recipientId: payload.handle,
      message: payload.message,
      platform: payload.platform,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Meta send error";
    return NextResponse.json({ message: "SOCIAL_PROVIDER_ERROR", details: message }, { status: 502 });
  }

  const record = await prisma.message.create({
    data: {
      channel: MessageChannel.social,
      body: payload.message,
      contactId: payload.contactId,
      workspaceId,
      metadata: { handle: payload.handle, platform: payload.platform, providerResponse },
    },
  });

  return NextResponse.json({
    message: "SOCIAL_MESSAGE_SENT",
    providerResponse,
    record,
  });
}
