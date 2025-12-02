import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { requireWorkspaceId } from "@/lib/db/workspace";
import { ensurePermission } from "@/lib/auth/permissions";

const segmentSchema = z.object({
  name: z.string(),
  entityType: z.string(),
  filter: z.object({ status: z.array(z.string()).optional(), ownerId: z.string().optional() }).passthrough(),
});

export async function GET() {
  const workspaceId = await requireWorkspaceId();
  await ensurePermission(workspaceId, "campaigns", "view");
  const segments = await prisma.segment.findMany({ where: { workspaceId } });
  return NextResponse.json(segments);
}

export async function POST(request: Request) {
  const workspaceId = await requireWorkspaceId();
  await ensurePermission(workspaceId, "campaigns", "create");
  const payload = segmentSchema.parse(await request.json());
  const segment = await prisma.segment.create({ data: { ...payload, workspaceId } });
  return NextResponse.json({ message: "SEGMENT_CREATED", segment });
}
