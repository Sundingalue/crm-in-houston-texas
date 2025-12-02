import { prisma } from "@/lib/db/client";

const hasSummarizer = () => Boolean(process.env.AI_AGENT_API_KEY || process.env.TRANSCRIPTION_API_KEY);

export async function summarizeCall(activityId: string, transcript?: string) {
  const promptBasedSummary =
    "Resumen automático de la llamada: el cliente solicitó seguimiento y enviar propuesta. Este texto es una plantilla; conecta tu proveedor de IA para obtener resúmenes reales.";

  const summary = transcript
    ? `Resumen IA (plantilla): ${transcript.slice(0, 180)}${transcript.length > 180 ? "…" : ""}`
    : promptBasedSummary;

  const aiSummary = hasSummarizer() ? summary : "Conecta tu proveedor de IA para generar resúmenes automáticos.";

  return prisma.activity.update({
    where: { id: activityId },
    data: { aiSummary },
  });
}
