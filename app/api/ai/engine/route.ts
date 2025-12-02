import { NextResponse } from "next/server";
import { ensureFeatureEnabled, requireWorkspaceId } from "@/lib/db/workspace";
import { ensurePermission } from "@/lib/auth/permissions";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

export async function POST(request: Request) {
  const workspaceId = await requireWorkspaceId();
  const enabled = await ensureFeatureEnabled(workspaceId, "ai");
  if (!enabled) return NextResponse.json({ message: "AI_DISABLED" }, { status: 403 });
  await ensurePermission(workspaceId, "ai", "create");

  if (!OPENAI_API_KEY) {
    return NextResponse.json({ message: "AI_ENGINE_PLACEHOLDER", detail: "Set OPENAI_API_KEY to enable" }, { status: 501 });
  }

  const { prompt } = (await request.json().catch(() => ({}))) as { prompt?: string };
  if (!prompt) return NextResponse.json({ message: "MISSING_PROMPT" }, { status: 400 });

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 300,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return NextResponse.json({ message: "AI_PROVIDER_ERROR", detail: errorText }, { status: 502 });
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content ?? "";
  return NextResponse.json({ message: "AI_OK", content, workspaceId });
}
