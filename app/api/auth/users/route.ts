import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import bcrypt from "bcryptjs";
import { requireWorkspaceId } from "@/lib/db/workspace";
import { ensurePermission, isSuperAdmin } from "@/lib/auth/permissions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

// Definimos los roles explícitamente (igual que en Prisma)
const USER_ROLES = ["admin", "manager", "sales"] as const;
type UserRole = (typeof USER_ROLES)[number];

const userRoleEnum = z.enum(USER_ROLES);

const inviteSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  role: userRoleEnum.optional(),
  roleId: z.string().optional(),
});

const updateSchema = z.object({
  id: z.string(),
  name: z.string().min(2),
  role: userRoleEnum,
  active: z.boolean().optional(),
  roleId: z.string().optional(),
});

const deleteSchema = z.object({ id: z.string() });

export async function GET() {
  const workspaceId = await requireWorkspaceId();
  await ensurePermission(workspaceId, "settings", "view");

  const users = await prisma.user.findMany({
    where: { workspaceId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      memberships: {
        where: { workspaceId },
        select: { roleId: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const workspaceId = await requireWorkspaceId();
  await ensurePermission(workspaceId, "settings", "create");

  const payload = inviteSchema.parse(await request.json());

  const existing = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  const hashedPassword = await bcrypt.hash("Temporal123!", 12);

  const user =
    existing ??
    (await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        role: payload.role ?? ("sales" as UserRole),
        hashedPassword,
      },
    }));

  await prisma.userWorkspace.upsert({
    where: {
      userId_workspaceId: { userId: user.id, workspaceId },
    },
    update: { roleId: payload.roleId },
    create: {
      userId: user.id,
      workspaceId,
      roleId: payload.roleId,
    },
  });

  return NextResponse.json({
    message: "Invitación registrada",
    user,
  });
}

export async function PATCH(request: Request) {
  const workspaceId = await requireWorkspaceId();
  await ensurePermission(workspaceId, "settings", "edit");

  const payload = updateSchema.parse(await request.json());

  const user = await prisma.user.update({
    where: { id: payload.id, workspaceId },
    data: {
      name: payload.name,
      role: payload.role,
      active: payload.active ?? true,
    },
  });

  if (payload.roleId) {
    await prisma.userWorkspace.upsert({
      where: {
        userId_workspaceId: { userId: user.id, workspaceId },
      },
      update: { roleId: payload.roleId },
      create: {
        userId: user.id,
        workspaceId,
        roleId: payload.roleId,
      },
    });
  }

  return NextResponse.json({
    message: "Usuario actualizado",
    user,
  });
}

export async function DELETE(request: Request) {
  const workspaceId = await requireWorkspaceId();
  const session = await getServerSession(authOptions);

  if (!session?.user?.email || isSuperAdmin(session.user.email)) {
    // superadmin puede borrar sin chequear permisos de workspace
  } else {
    await ensurePermission(workspaceId, "settings", "delete");
  }

  const payload = deleteSchema.parse(await request.json());

  await prisma.user.delete({
    where: { id: payload.id, workspaceId },
  });

  return NextResponse.json({ message: "Usuario eliminado" });
}
