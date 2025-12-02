import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { requireWorkspaceId } from "@/lib/db/workspace";
import { ActivityType } from "@prisma/client";

const activitySchema = z.object({
  type: z.nativeEnum(ActivityType),
  summary: z.string(),
  leadId: z.string().optional(),
  userId: z.string().optional(),
  durationSec: z.number().optional(),
  notes: z.string().optional(),
});

export async function GET() {
  const workspaceId = await requireWorkspaceId();
  const activities = await prisma.activity.findMany({
    where: { workspaceId },
    include: {
      lead: { select: { id: true, name: true } },
      user: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(activities);
}

export async function POST(request: Request) {
  const workspaceId = await requireWorkspaceId();
  const payload = activitySchema.parse(await request.json());
  const activity = await prisma.activity.create({
    data: {
      type: payload.type,
      summary: payload.summary,
      leadId: payload.leadId,
      userId: payload.userId,
      durationSec: payload.durationSec,
      notes: payload.notes,
      workspaceId,
    },
  });
  return NextResponse.json({ message: "Actividad registrada", activity });
}
