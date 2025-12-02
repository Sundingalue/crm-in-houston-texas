import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { requireWorkspaceId } from "@/lib/db/workspace";
import { ensurePermission } from "@/lib/auth/permissions";

const stageSchema = z.object({ name: z.string(), order: z.number() });

export async function GET() {
  const workspaceId = await requireWorkspaceId();
  await ensurePermission(workspaceId, "deals", "view");
  const stages = await prisma.pipelineStage.findMany({ where: { workspaceId }, orderBy: { order: "asc" } });
  return NextResponse.json(stages);
}

export async function POST(request: Request) {
  const workspaceId = await requireWorkspaceId();
  await ensurePermission(workspaceId, "deals", "edit");
  const payload = stageSchema.parse(await request.json());
  const stage = await prisma.pipelineStage.create({ data: { ...payload, workspaceId } });
  return NextResponse.json({ message: "STAGE_CREATED", stage });
}
