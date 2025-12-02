import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { requireWorkspaceId } from "@/lib/db/workspace";
import { LeadStatus } from "@prisma/client";
import { ensurePermission } from "@/lib/auth/permissions";

const leadSchema = z.object({
  name: z.string(),
  company: z.string(),
  status: z.nativeEnum(LeadStatus).default(LeadStatus.nuevo),
  source: z.string(),
  ownerId: z.string().optional(),
});

const leadUpdateSchema = leadSchema.extend({
  id: z.string(),
});

const leadDeleteSchema = z.object({ id: z.string() });

export async function GET(request: Request) {
  const workspaceId = await requireWorkspaceId();
  await ensurePermission(workspaceId, "leads", "view");
  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get("status") as LeadStatus | null;
  const leads = await prisma.lead.findMany({
    where: {
      workspaceId,
      ...(statusFilter ? { status: statusFilter } : {}),
    },
    include: {
      owner: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(leads);
}

export async function POST(request: Request) {
  const workspaceId = await requireWorkspaceId();
  await ensurePermission(workspaceId, "leads", "create");
  const payload = leadSchema.parse(await request.json());
  const lead = await prisma.lead.create({
    data: {
      name: payload.name,
      company: payload.company,
      status: payload.status,
      source: payload.source,
      ownerId: payload.ownerId,
      workspaceId,
    },
  });
  return NextResponse.json({
    message: "Lead creado",
    lead,
  });
}

export async function PATCH(request: Request) {
  const workspaceId = await requireWorkspaceId();
  await ensurePermission(workspaceId, "leads", "edit");
  const payload = leadUpdateSchema.parse(await request.json());
  const lead = await prisma.lead.update({
    where: { id: payload.id, workspaceId },
    data: {
      name: payload.name,
      company: payload.company,
      status: payload.status,
      source: payload.source,
      ownerId: payload.ownerId,
    },
  });
  return NextResponse.json({ message: "Lead actualizado", lead });
}

export async function DELETE(request: Request) {
  const workspaceId = await requireWorkspaceId();
  await ensurePermission(workspaceId, "leads", "delete");
  const payload = leadDeleteSchema.parse(await request.json());
  await prisma.lead.delete({ where: { id: payload.id, workspaceId } });
  return NextResponse.json({ message: "Lead eliminado" });
}
