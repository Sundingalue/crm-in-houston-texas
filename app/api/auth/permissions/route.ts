import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { requireWorkspaceId } from "@/lib/db/workspace";
import { ensurePermission } from "@/lib/auth/permissions";

const assignSchema = z.object({
  userId: z.string(),
  module: z.string(),
  action: z.string(),
});

export async function GET() {
  const workspaceId = await requireWorkspaceId();
  await ensurePermission(workspaceId, "settings", "view");

  const perms = await prisma.permission.findMany({
    where: { role: { workspaceId } },
    include: { role: { select: { id: true, name: true } } },
  });

  const userPerms = await prisma.userWorkspace.findMany({
    where: { workspaceId },
    include: {
      permissions: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json({ rolePerms: perms, userPerms });
}

export async function POST(request: Request) {
  const workspaceId = await requireWorkspaceId();
  await ensurePermission(workspaceId, "settings", "edit");
  const payload = assignSchema.parse(await request.json());

  const membership = await prisma.userWorkspace.findUnique({
    where: { userId_workspaceId: { userId: payload.userId, workspaceId } },
    include: { permissions: true },
  });

  if (!membership) {
    return NextResponse.json(
      { message: "USER_NOT_IN_WORKSPACE" },
      { status: 404 }
    );
  }

  const already = membership.permissions.find(
    (p) => p.module === payload.module && p.action === payload.action
  );
  if (already) {
    return NextResponse.json({ message: "PERMISSION_EXISTS" }, { status: 200 });
  }

  // El permiso debe estar asociado a un Role (roleId obligatorio en el modelo Permission)
  if (!membership.roleId) {
    return NextResponse.json(
      { message: "USER_HAS_NO_ROLE" },
      { status: 400 }
    );
  }

  const perm = await prisma.permission.create({
    data: {
      module: payload.module,
      action: payload.action,
      // Vinculamos el permiso al Role del usuario en este workspace
      role: {
        connect: { id: membership.roleId },
      },
      // Además lo asociamos explícitamente al UserWorkspace mediante la relación many-to-many
      userWorkspaces: {
        connect: { id: membership.id },
      },
    },
  });

  return NextResponse.json({ message: "PERMISSION_ADDED", perm });
}
