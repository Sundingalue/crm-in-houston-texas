import { NextResponse } from "next/server";
import { z } from "zod";
import { summarizeCall } from "@/lib/ai/call-summary";
import { enforceRateLimit } from "@/lib/utils/rate-limit";
import { ensureFeatureEnabled, requireWorkspaceId } from "@/lib/db/workspace";
import { prisma } from "@/lib/db/client";
import { ensurePermission } from "@/lib/auth/permissions";

const summarySchema = z.object({
  activityId: z.string(),
  transcript: z.string().optional(),
});

export async function POST(request: Request) {
  const workspaceId = await requireWorkspaceId();
  const enabled = await ensureFeatureEnabled(workspaceId, "calls");
  if (!enabled) return NextResponse.json({ message: "CALLS_DISABLED" }, { status: 403 });
  await ensurePermission(workspaceId, "calls", "edit");
  const payload = summarySchema.parse(await request.json());
  enforceRateLimit(`call-summary:${workspaceId}`, 15, 60_000);

  const activity = await prisma.activity.findFirst({ where: { id: payload.activityId, workspaceId } });
  if (!activity) {
    return NextResponse.json({ message: "ACTIVITY_NOT_FOUND" }, { status: 404 });
  }

  const summarized = await summarizeCall(payload.activityId, payload.transcript);

  return NextResponse.json({
    message: "CALL_SUMMARY_READY",
    activity: summarized,
  });
}
