import { NextResponse } from "next/server";
import { z } from "zod";
import { enforceRateLimit } from "@/lib/utils/rate-limit";
import { prisma } from "@/lib/db/client";
import { ensureFeatureEnabled, requireWorkspaceId } from "@/lib/db/workspace";
import { ActivityType } from "@prisma/client";
import { ensurePermission } from "@/lib/auth/permissions";

const callSchema = z.object({
  contactId: z.string(),
  phone: z.string(),
  outcome: z.string(),
  durationSec: z.number().min(0),
  leadId: z.string().optional(),
  userId: z.string().optional(),
});

export async function GET() {
  const workspaceId = await requireWorkspaceId();
  const enabled = await ensureFeatureEnabled(workspaceId, "calls");
  if (!enabled) return NextResponse.json({ message: "CALLS_DISABLED" }, { status: 403 });
  await ensurePermission(workspaceId, "calls", "view");
  const calls = await prisma.activity.findMany({
    where: { workspaceId, type: ActivityType.llamada },
    include: {
      lead: { select: { id: true, name: true } },
      user: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return NextResponse.json(calls);
}

export async function POST(request: Request) {
  const workspaceId = await requireWorkspaceId();
  const enabled = await ensureFeatureEnabled(workspaceId, "calls");
  if (!enabled) return NextResponse.json({ message: "CALLS_DISABLED" }, { status: 403 });
  await ensurePermission(workspaceId, "calls", "create");
  const payload = callSchema.parse(await request.json());
  enforceRateLimit(`call:${payload.contactId}`, 15, 60_000);
  const activity = await prisma.activity.create({
    data: {
      type: ActivityType.llamada,
      summary: payload.outcome,
      durationSec: payload.durationSec,
      workspaceId,
      leadId: payload.leadId,
      userId: payload.userId,
      notes: `Teléfono: ${payload.phone}`,
    },
  });
  return NextResponse.json({
    message: "Llamada registrada",
    activity,
  });
}
