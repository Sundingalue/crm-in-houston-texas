import { NextResponse } from "next/server";
import { z } from "zod";
import { enforceRateLimit } from "@/lib/utils/rate-limit";
import { ensureFeatureEnabled, requireWorkspaceId } from "@/lib/db/workspace";
import { ensurePermission } from "@/lib/auth/permissions";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

const agentSchema = z.object({
  prompt: z.string().min(3),
  context: z.record(z.string(), z.any()).optional(),
  locale: z.string().optional(),
  agentId: z.string().optional(),
});

export async function POST(request: Request) {
  const workspaceId = await requireWorkspaceId();
  const enabled = await ensureFeatureEnabled(workspaceId, "ai");
  if (!enabled) return NextResponse.json({ message: "AI_DISABLED" }, { status: 403 });
  await ensurePermission(workspaceId, "ai", "create");

  const payload = agentSchema.parse(await request.json());
  enforceRateLimit("ai-agent", 60, 60_000);

  const contextText = payload.context ? JSON.stringify(payload.context, null, 2) : "Sin contexto adicional.";
  const locale = payload.locale ?? "es";

  if (!OPENAI_API_KEY) {
    return NextResponse.json({
      message: "AI_AGENT_STUB",
      suggestion: `Respuesta (stub) para: ${payload.prompt}`,
      locale,
      workspaceId,
    });
  }

  const system = `Eres un asistente de CRM. Responde en el idioma del prompt (locale: ${locale}). Workspace: ${workspaceId}. Usa el contexto si ayuda.`;
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0.2,
      max_tokens: 280,
      messages: [
        { role: "system", content: system },
        { role: "user", content: payload.prompt },
        { role: "user", content: `Contexto:\n${contextText}` },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return NextResponse.json({ message: "AI_PROVIDER_ERROR", detail: errorText }, { status: 502 });
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content ?? "";

  return NextResponse.json({
    message: "AI_AGENT_OK",
    suggestion: content,
    locale,
    workspaceId,
  });
}
