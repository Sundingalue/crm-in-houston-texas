import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { requireWorkspaceId } from "@/lib/db/workspace";
import { AccountSize } from "@prisma/client";
import { ensurePermission } from "@/lib/auth/permissions";

const accountSchema = z.object({
  name: z.string(),
  industry: z.string().optional(),
  size: z.nativeEnum(AccountSize),
});

const accountUpdateSchema = accountSchema.extend({
  id: z.string(),
});

const accountDeleteSchema = z.object({ id: z.string() });

export async function GET() {
  const workspaceId = await requireWorkspaceId();
  await ensurePermission(workspaceId, "accounts", "view");
  const accounts = await prisma.company.findMany({
    where: { workspaceId },
    include: {
      contacts: true,
      deals: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(accounts);
}

export async function POST(request: Request) {
  const workspaceId = await requireWorkspaceId();
  await ensurePermission(workspaceId, "accounts", "create");
  const payload = accountSchema.parse(await request.json());
  const account = await prisma.company.create({
    data: {
      name: payload.name,
      industry: payload.industry,
      size: payload.size,
      workspaceId,
    },
  });
  return NextResponse.json({ message: "Cuenta creada", account });
}

export async function PATCH(request: Request) {
  const workspaceId = await requireWorkspaceId();
  await ensurePermission(workspaceId, "accounts", "edit");
  const payload = accountUpdateSchema.parse(await request.json());
  const account = await prisma.company.update({
    where: { id: payload.id, workspaceId },
    data: {
      name: payload.name,
      industry: payload.industry,
      size: payload.size,
    },
  });
  return NextResponse.json({ message: "Cuenta actualizada", account });
}

export async function DELETE(request: Request) {
  const workspaceId = await requireWorkspaceId();
  await ensurePermission(workspaceId, "accounts", "delete");
  const payload = accountDeleteSchema.parse(await request.json());
  await prisma.company.delete({ where: { id: payload.id, workspaceId } });
  return NextResponse.json({ message: "Cuenta eliminada" });
}
