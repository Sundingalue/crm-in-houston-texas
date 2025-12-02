import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { ensureFeatureEnabled, requireWorkspaceId } from "@/lib/db/workspace";
import { ensurePermission } from "@/lib/auth/permissions";

const assistSchema = z.object({
  entityType: z.enum(["lead", "contact", "campaign"]),
  entityId: z.string(),
  prompt: z.string().min(3).optional(),
});

export async function POST(request: Request) {
  const workspaceId = await requireWorkspaceId();
  const enabled = await ensureFeatureEnabled(workspaceId, "ai");
  if (!enabled) return NextResponse.json({ message: "AI_DISABLED" }, { status: 403 });

  const payload = assistSchema.parse(await request.json());

  if (payload.entityType === "lead") await ensurePermission(workspaceId, "leads", "view");
  if (payload.entityType === "contact") await ensurePermission(workspaceId, "contacts", "view");
  if (payload.entityType === "campaign") await ensurePermission(workspaceId, "campaigns", "view");

  const entity =
    payload.entityType === "lead"
      ? await prisma.lead.findUnique({ where: { id: payload.entityId, workspaceId } })
      : payload.entityType === "contact"
        ? await prisma.contact.findUnique({ where: { id: payload.entityId, workspaceId }, include: { account: true } })
        : await prisma.campaign.findUnique({ where: { id: payload.entityId, workspaceId } });

  if (!entity) return NextResponse.json({ message: "NOT_FOUND" }, { status: 404 });

  if (payload.entityType === "lead") {
    const lead = entity as { name: string; company: string; status: string; source: string };
    const context = `Lead: ${lead.name} · ${lead.company} · status ${lead.status} · source ${lead.source}`;
    return respondWithAi(context, payload.prompt);
  }

  if (payload.entityType === "contact") {
    const contact = entity as { name: string; email: string; phone?: string | null; account?: { name?: string | null } };
    const context = `Contacto: ${contact.name} · ${contact.email} · ${contact.phone ?? ""} · cuenta ${contact.account?.name ?? "NA"}`;
    return respondWithAi(context, payload.prompt);
  }

  const campaign = entity as { name: string; status: string; channel: string };
  const context = `Campaña: ${campaign.name} · estado ${campaign.status} · canal ${campaign.channel}`;
  return respondWithAi(context, payload.prompt);
}

async function respondWithAi(context: string, prompt?: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  if (!apiKey) {
    return NextResponse.json({ message: "AI_ASSIST_STUB", suggestion: `Sugerencia stub para ${context}` });
  }

  const body = {
    model,
    temperature: 0.3,
    messages: [
      { role: "system", content: "Eres un asistente de CRM. Responde en español con bullets concisos." },
      { role: "user", content: `${context}\n${prompt ?? "Dame sugerencias accionables."}` },
    ],
  };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ message: "AI_PROVIDER_ERROR", detail: err }, { status: 502 });
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content ?? "";
  return NextResponse.json({ message: "AI_ASSIST_OK", suggestion: content });
}
