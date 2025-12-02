import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { requireWorkspaceId } from "@/lib/db/workspace";
import { ensurePermission } from "@/lib/auth/permissions";

const permissionSchema = z.object({ module: z.string(), action: z.string() });
const roleSchema = z.object({ name: z.string().min(2), description: z.string().optional(), permissions: z.array(permissionSchema) });

export async function GET() {
  const workspaceId = await requireWorkspaceId();
  await ensurePermission(workspaceId, "settings", "view");
  const roles = await prisma.role.findMany({ where: { workspaceId }, include: { permissions: true } });
  return NextResponse.json(roles);
}

export async function POST(request: Request) {
  const workspaceId = await requireWorkspaceId();
  await ensurePermission(workspaceId, "settings", "edit");
  const payload = roleSchema.parse(await request.json());

  const role = await prisma.role.create({
    data: {
      name: payload.name.toLowerCase(),
      description: payload.description,
      workspaceId,
      permissions: { create: payload.permissions.map((p) => ({ module: p.module, action: p.action })) },
    },
    include: { permissions: true },
  });

  return NextResponse.json({ message: "ROLE_CREATED", role });
}

export async function PATCH(request: Request) {
  const workspaceId = await requireWorkspaceId();
  await ensurePermission(workspaceId, "settings", "edit");
  const updateSchema = roleSchema.extend({ id: z.string() });
  const payload = updateSchema.parse(await request.json());

  await prisma.permission.deleteMany({ where: { roleId: payload.id } });

  const role = await prisma.role.update({
    where: { id: payload.id, workspaceId },
    data: {
      name: payload.name.toLowerCase(),
      description: payload.description,
      permissions: { create: payload.permissions.map((p) => ({ module: p.module, action: p.action })) },
    },
    include: { permissions: true },
  });

  return NextResponse.json({ message: "ROLE_UPDATED", role });
}

export async function DELETE(request: Request) {
  const workspaceId = await requireWorkspaceId();
  await ensurePermission(workspaceId, "settings", "delete");
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ message: "MISSING_ID" }, { status: 400 });
  await prisma.role.delete({ where: { id, workspaceId } });
  return NextResponse.json({ message: "ROLE_DELETED" });
}
