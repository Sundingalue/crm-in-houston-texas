import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { requireWorkspaceId } from "@/lib/db/workspace";
import { ensurePermission } from "@/lib/auth/permissions";

const ruleSchema = z.object({ name: z.string(), trigger: z.any(), conditions: z.any().optional(), actions: z.any(), active: z.boolean().optional().default(true) });

export async function GET() {
  const workspaceId = await requireWorkspaceId();
  await ensurePermission(workspaceId, "automations", "view");
  const rules = await prisma.automationRule.findMany({ where: { workspaceId }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(rules);
}

export async function POST(request: Request) {
  const workspaceId = await requireWorkspaceId();
  await ensurePermission(workspaceId, "automations", "create");
  const payload = ruleSchema.parse(await request.json());
  const rule = await prisma.automationRule.create({ data: { ...payload, workspaceId } });
  return NextResponse.json({ message: "RULE_CREATED", rule });
}
