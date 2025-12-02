import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { ensureFeatureEnabled, requireWorkspaceId } from "@/lib/db/workspace";
import { ensurePermission } from "@/lib/auth/permissions";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

const chatSchema = z.object({ agentId: z.string(), message: z.string() });

export async function POST(request: Request) {
  const workspaceId = await requireWorkspaceId();
  const enabled = await ensureFeatureEnabled(workspaceId, "ai");
  if (!enabled) return NextResponse.json({ message: "AI_DISABLED" }, { status: 403 });
  await ensurePermission(workspaceId, "ai", "create");
  const payload = chatSchema.parse(await request.json());

  const agent = await prisma.agent.findUnique({ where: { id: payload.agentId, workspaceId } });
  if (!agent) return NextResponse.json({ message: "AGENT_NOT_FOUND" }, { status: 404 });

  await prisma.agentMessage.create({ data: { agentId: payload.agentId, role: "user", content: payload.message } });

  if (!OPENAI_API_KEY) {
    return NextResponse.json({ reply: "AI placeholder response", message: "AI_CHAT_STUB" });
  }

  const previous = await prisma.agentMessage.findMany({ where: { agentId: payload.agentId }, orderBy: { createdAt: "asc" }, take: 10 });
  const messages = previous.map((m) => ({ role: m.role, content: m.content })).concat([{ role: "assistant", content: agent.instructions ?? "" }]);

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: OPENAI_MODEL, messages, temperature: 0.3 }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return NextResponse.json({ message: "AI_PROVIDER_ERROR", detail: errorText }, { status: 502 });
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content ?? "";
  await prisma.agentMessage.create({ data: { agentId: payload.agentId, role: "assistant", content } });

  return NextResponse.json({ reply: content, message: "AI_CHAT_OK" });
}
