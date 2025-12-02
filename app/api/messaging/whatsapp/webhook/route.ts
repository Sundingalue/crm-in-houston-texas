import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { MessageChannel } from "@prisma/client";
import { ensureFeatureEnabled } from "@/lib/db/workspace";
import { logError } from "@/lib/utils/logger";

const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN;
const normalizePhone = (phone: string) =>
  phone
    .replace("whatsapp:", "")
    .replace(/[^\d+]/g, "")
    .replace(/^00/, "+");

function resolveWorkspaceIdFromRequest(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const workspaceId = params.get("workspaceId");
  const domain = params.get("domain") ?? process.env.DEMO_WORKSPACE_DOMAIN ?? "aurora.demo";
  return { workspaceId, domain };
}

export async function GET(request: NextRequest) {
  // Meta verification challenge
  const params = request.nextUrl.searchParams;
  const mode = params.get("hub.mode");
  const token = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");
  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge ?? "", { status: 200 });
  }
  return NextResponse.json({ message: "FORBIDDEN" }, { status: 403 });
}

async function resolveWorkspaceId(workspaceId?: string | null, domain?: string | null) {
  if (workspaceId) return workspaceId;
  const ws = await prisma.workspace.findFirst({ where: { domain: domain ?? process.env.DEMO_WORKSPACE_DOMAIN ?? "aurora.demo" } });
  return ws?.id;
}

type MetaEntry = { changes?: Array<{ value?: { messages?: Array<{ from?: string; text?: { body?: string } }> } }> };

async function handleMeta(body: Record<string, unknown>, request: NextRequest) {
  const entries: MetaEntry[] = (body as { entry?: MetaEntry[] }).entry ?? [];
  const { workspaceId: wsIdParam, domain } = resolveWorkspaceIdFromRequest(request);
  const resolvedWorkspaceId = await resolveWorkspaceId(wsIdParam, domain);
  if (!resolvedWorkspaceId) return;

  for (const entry of entries) {
    const changes = entry.changes ?? [];
    for (const change of changes) {
      const value = change.value ?? {};
      const messages = value.messages ?? [];
      for (const msg of messages) {
        const from = msg.from;
        const text = msg.text?.body ?? "";
        const normalized = from ? normalizePhone(from) : undefined;
        const matchedContact = normalized
          ? await prisma.contact.findFirst({
              where: {
                workspaceId: resolvedWorkspaceId,
                OR: [{ phone: normalized }, { phone: { contains: normalized.slice(-8) } }],
              },
              select: { id: true },
            })
          : null;

        await prisma.message.create({
          data: {
            channel: MessageChannel.whatsapp,
            body: text,
            workspaceId: resolvedWorkspaceId,
            contactId: matchedContact?.id,
            metadata: { from: normalized ?? from, provider: "meta" },
          },
        });

        const enabled = await ensureFeatureEnabled(resolvedWorkspaceId, "ai");
        if (enabled) {
          try {
            const aiRes = await fetch(`${process.env.NEXTAUTH_URL ?? ""}/api/ai/agent`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ prompt: `Genera una respuesta breve a: ${text}` }),
            });
            if (aiRes.ok) {
              const ai = await aiRes.json();
              await prisma.message.create({
                data: {
                  channel: MessageChannel.whatsapp,
                  body: ai.suggestion ?? "AI respuesta",
                  workspaceId: resolvedWorkspaceId,
                  contactId: matchedContact?.id,
                  metadata: { provider: "ai-responder", to: normalized ?? from },
                },
              });
            }
          } catch (error) {
            await logError("AI_WHATSAPP_AUTOREPLY_ERROR", { error: String(error) });
          }
        }
      }
    }
  }
}

async function handleTwilio(formData: FormData, request: NextRequest) {
  const from = formData.get("From")?.toString() ?? "";
  const body = formData.get("Body")?.toString() ?? "";
  const { workspaceId: wsIdParam, domain } = resolveWorkspaceIdFromRequest(request);
  const resolvedWorkspaceId = await resolveWorkspaceId(wsIdParam, domain);
  if (!resolvedWorkspaceId) return "<Response></Response>";
  const normalized = normalizePhone(from);
  const matchedContact = await prisma.contact.findFirst({
    where: {
      workspaceId: resolvedWorkspaceId,
      OR: [{ phone: normalized }, { phone: { contains: normalized.slice(-8) } }],
    },
    select: { id: true },
  });
  await prisma.message.create({
    data: {
      channel: MessageChannel.whatsapp,
      body,
      workspaceId: resolvedWorkspaceId,
      contactId: matchedContact?.id,
      metadata: { from: normalized ?? from, provider: "twilio" },
    },
  });
  return `<Response><Message>OK</Message></Response>`;
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") || "";
  try {
    if (contentType.includes("application/json")) {
      const body = await request.json();
      await handleMeta(body, request);
      return NextResponse.json({ message: "WHATSAPP_INBOUND_OK" });
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      const twiml = await handleTwilio(formData, request);
      return new NextResponse(twiml ?? "<Response></Response>", {
        status: 200,
        headers: { "Content-Type": "application/xml" },
      });
    }
    return NextResponse.json({ message: "UNSUPPORTED_FORMAT" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ message: "WHATSAPP_INBOUND_ERROR", error: String(error) }, { status: 500 });
  }
}
