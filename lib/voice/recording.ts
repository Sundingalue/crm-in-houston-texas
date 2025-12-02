import { prisma } from "@/lib/db/client";
import { ActivityType } from "@prisma/client";

type RecordingInput = {
  workspaceId: string;
  contactId?: string;
  leadId?: string;
  userId?: string;
  summary?: string;
};

const providerConfigured = () => Boolean(process.env.VOICE_API_KEY || process.env.VOICE_RECORDING_WEBHOOK_SECRET);

export async function createRecordingPlaceholder(input: RecordingInput) {
  const activity = await prisma.activity.create({
    data: {
      type: ActivityType.llamada,
      summary: input.summary ?? "Plantilla de grabación de llamada",
      workspaceId: input.workspaceId,
      leadId: input.leadId,
      userId: input.userId,
      notes: input.contactId ? `Contacto: ${input.contactId}` : undefined,
      recordingUrl: providerConfigured() ? undefined : "https://example.com/demo-recording.mp3",
    },
  });

  return activity;
}

export async function attachRecording(activityId: string, recordingUrl: string, transcript?: string) {
  const activity = await prisma.activity.update({
    where: { id: activityId },
    data: { recordingUrl, transcript },
  });

  return activity;
}
