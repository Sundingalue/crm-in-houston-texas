import { NextResponse } from "next/server";
import { z } from "zod";
import { ensureFeatureEnabled, requireWorkspaceId } from "@/lib/db/workspace";
import { prisma } from "@/lib/db/client";
import { registerAutomation } from "@/lib/automations/runner";
import { enforceRateLimit } from "@/lib/utils/rate-limit";
import { ensurePermission } from "@/lib/auth/permissions";

const automationSchema = z.object({
  name: z.string().min(2),
  trigger: z.string().min(2),
  actions: z.record(z.string(), z.any()),
});

export async function GET() {
  const workspaceId = await requireWorkspaceId();
  const enabled = await ensureFeatureEnabled(workspaceId, "automations");
  if (!enabled) return NextResponse.json({ message: "AUTOMATIONS_DISABLED" }, { status: 403 });
  await ensurePermission(workspaceId, "automations", "view");
  const automations = await prisma.automation.findMany({ where: { workspaceId }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(automations);
}

export async function POST(request: Request) {
  const workspaceId = await requireWorkspaceId();
  const enabled = await ensureFeatureEnabled(workspaceId, "automations");
  if (!enabled) return NextResponse.json({ message: "AUTOMATIONS_DISABLED" }, { status: 403 });
  await ensurePermission(workspaceId, "automations", "create");
  const payload = automationSchema.parse(await request.json());
  enforceRateLimit(`automation:${workspaceId}`, 20, 60_000);

  const automation = await registerAutomation({
    ...payload,
    workspaceId,
  });

  return NextResponse.json({ message: "AUTOMATION_REGISTERED", automation });
}
