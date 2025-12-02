import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { requireWorkspaceId } from "@/lib/db/workspace";
import { ensurePermission } from "@/lib/auth/permissions";

const ruleSchema = z.object({
  name: z.string(),
  trigger: z.any(),                     // obligatorio
  conditions: z.any().optional(),       // opcional
  actions: z.any(),                     // obligatorio
  active: z.boolean().optional().default(true),
});

export async function GET() {
  const workspaceId = await requireWorkspaceId();
  await ensurePermission(workspaceId, "automations", "view");

  const rules = await prisma.automationRule.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(rules);
}

export async function POST(request: Request) {
  const workspaceId = await requireWorkspaceId();
  await ensurePermission(workspaceId, "automations", "create");

  const payload = ruleSchema.parse(await request.json());

  const rule = await prisma.automationRule.create({
    data: {
      name: payload.name,
      // En Prisma el modelo exige siempre estas columnas:
      trigger: payload.trigger ?? {},          // Json obligatorio
      actions: payload.actions ?? {},          // Json obligatorio
      conditions: payload.conditions ?? null,  // Json? opcional
      active: payload.active ?? true,
      workspaceId,
    },
  });

  return NextResponse.json({ message: "RULE_CREATED", rule });
}
