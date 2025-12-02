import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { MessageChannel } from "@prisma/client";

const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN;
const DEMO_WORKSPACE_DOMAIN = process.env.DEMO_WORKSPACE_DOMAIN ?? "aurora.demo";

export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get("hub.mode");
  const token = request.nextUrl.searchParams.get("hub.verify_token");
  const challenge = request.nextUrl.searchParams.get("hub.challenge");
  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge ?? "", { status: 200 });
  }
  return NextResponse.json({ message: "FORBIDDEN" }, { status: 403 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const entries: Array<{ messaging?: Array<{ sender?: { id?: string }; message?: { text?: string } }> }> = body.entry ?? [];
    for (const entry of entries) {
      const msgs = entry.messaging ?? [];
      for (const msg of msgs) {
        const from = msg.sender?.id;
        const text = msg.message?.text ?? "";
        if (!from || !text) continue;
        // Resolve workspace by domain param or fallback to demo
        const domain = request.nextUrl.searchParams.get("domain") ?? DEMO_WORKSPACE_DOMAIN;
        const workspace = await prisma.workspace.findFirst({ where: { domain }, select: { id: true } });
        if (!workspace?.id) continue;
        await prisma.message.create({
          data: {
            channel: MessageChannel.social,
            body: text,
            workspaceId: workspace.id,
            metadata: { from, provider: "meta" },
          },
        });
      }
    }
    return NextResponse.json({ message: "SOCIAL_INBOUND_OK" });
  } catch (error) {
    return NextResponse.json({ message: "SOCIAL_INBOUND_ERROR", error: String(error) }, { status: 500 });
  }
}
