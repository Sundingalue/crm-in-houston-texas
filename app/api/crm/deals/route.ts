import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { requireWorkspaceId } from "@/lib/db/workspace";
import { DealStage } from "@prisma/client";
import { ensurePermission } from "@/lib/auth/permissions";

const dealSchema = z.object({
  name: z.string(),
  value: z.number(),
  stage: z.nativeEnum(DealStage),
  closeDate: z.string().optional(),
  accountId: z.string().optional(),
  leadId: z.string().optional(),
});

const dealUpdateSchema = dealSchema.extend({
  id: z.string(),
});

const dealDeleteSchema = z.object({ id: z.string() });

export async function GET() {
  const workspaceId = await requireWorkspaceId();
  await ensurePermission(workspaceId, "deals", "view");
  const deals = await prisma.deal.findMany({
    where: { workspaceId },
    include: {
      account: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(deals);
}

export async function POST(request: Request) {
  const workspaceId = await requireWorkspaceId();
  await ensurePermission(workspaceId, "deals", "create");
  const payload = dealSchema.parse(await request.json());
  const deal = await prisma.deal.create({
    data: {
      name: payload.name,
      value: payload.value,
      stage: payload.stage,
      closeDate: payload.closeDate ? new Date(payload.closeDate) : undefined,
      accountId: payload.accountId,
      leadId: payload.leadId,
      workspaceId,
    },
  });
  return NextResponse.json({ message: "Oportunidad creada", deal });
}

export async function PATCH(request: Request) {
  const workspaceId = await requireWorkspaceId();
  await ensurePermission(workspaceId, "deals", "edit");
  const payload = dealUpdateSchema.parse(await request.json());
  const deal = await prisma.deal.update({
    where: { id: payload.id, workspaceId },
    data: {
      name: payload.name,
      value: payload.value,
      stage: payload.stage,
      closeDate: payload.closeDate ? new Date(payload.closeDate) : undefined,
      accountId: payload.accountId,
      leadId: payload.leadId,
    },
  });
  return NextResponse.json({ message: "Oportunidad actualizada", deal });
}

export async function DELETE(request: Request) {
  const workspaceId = await requireWorkspaceId();
  await ensurePermission(workspaceId, "deals", "delete");
  const payload = dealDeleteSchema.parse(await request.json());
  await prisma.deal.delete({ where: { id: payload.id, workspaceId } });
  return NextResponse.json({ message: "Oportunidad eliminada" });
}
