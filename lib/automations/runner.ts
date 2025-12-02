import { prisma } from "@/lib/db/client";
import type { Prisma } from "@prisma/client";

export type AutomationPayload = {
  name: string;
  trigger: string;
  // Usamos el tipo de Prisma para campos JSON
  actions: Prisma.InputJsonValue;
  workspaceId: string;
};

const webhookUrl = process.env.ZAPIER_HOOK_URL;

export async function registerAutomation(payload: AutomationPayload) {
  const automation = await prisma.automation.create({
    data: {
      name: payload.name,
      trigger: payload.trigger,
      actions: payload.actions, // ahora ya es del tipo correcto
      workspaceId: payload.workspaceId,
    },
  });

  if (webhookUrl) {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ automation }),
    });
  }

  return automation;
}
