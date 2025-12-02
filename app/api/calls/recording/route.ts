import { NextResponse } from "next/server";
import { z } from "zod";
import { ensureFeatureEnabled, requireWorkspaceId } from "@/lib/db/workspace";
import { createRecordingPlaceholder, attachRecording } from "@/lib/voice/recording";
import { enforceRateLimit } from "@/lib/utils/rate-limit";
import { ensurePermission } from "@/lib/auth/permissions";

const recordingSchema = z.object({
  contactId: z.string().optional(),
  leadId: z.string().optional(),
  userId: z.string().optional(),
  recordingUrl: z.string().url().optional(),
  transcript: z.string().optional(),
});

export async function POST(request: Request) {
  const workspaceId = await requireWorkspaceId();
  const enabled = await ensureFeatureEnabled(workspaceId, "calls");
  if (!enabled) return NextResponse.json({ message: "CALLS_DISABLED" }, { status: 403 });
  await ensurePermission(workspaceId, "calls", "edit");
  const payload = recordingSchema.parse(await request.json());
  enforceRateLimit(`call-recording:${workspaceId}`, 10, 60_000);

  const activity = await createRecordingPlaceholder({
    workspaceId,
    contactId: payload.contactId,
    leadId: payload.leadId,
    userId: payload.userId,
    summary: "Grabación de llamada preparada",
  });

  const updated = payload.recordingUrl
    ? await attachRecording(activity.id, payload.recordingUrl, payload.transcript)
    : activity;

  return NextResponse.json({
    message: payload.recordingUrl ? "CALL_RECORDING_ATTACHED" : "CALL_RECORDING_PLACEHOLDER_CREATED",
    activity: updated,
  });
}
