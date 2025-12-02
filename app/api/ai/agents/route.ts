import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { ensureFeatureEnabled, requireWorkspaceId } from "@/lib/db/workspace";
import { ensurePermission } from "@/lib/auth/permissions";

const agentSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  instructions: z.string().optional(),
  model: z.string().optional(),
  voiceId: z.string().optional(),
  phoneNumber: z.string().optional(),
});

export async function GET() {
  const workspaceId = await requireWorkspaceId();
  const enabled = await ensureFeatureEnabled(workspaceId, "ai");
  if (!enabled) return NextResponse.json({ message: "AI_DISABLED" }, { status: 403 });
  await ensurePermission(workspaceId, "ai", "view");
  const agents = await prisma.agent.findMany({ where: { workspaceId }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(agents);
}

export async function POST(request: Request) {
  const workspaceId = await requireWorkspaceId();
  const enabled = await ensureFeatureEnabled(workspaceId, "ai");
  if (!enabled) return NextResponse.json({ message: "AI_DISABLED" }, { status: 403 });
  await ensurePermission(workspaceId, "ai", "create");
  const payload = agentSchema.parse(await request.json());
  const agent = await prisma.agent.create({ data: { ...payload, workspaceId } });
  return NextResponse.json({ message: "AGENT_CREATED", agent });
}
