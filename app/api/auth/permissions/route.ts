import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { requireWorkspaceId } from "@/lib/db/workspace";
import { ensurePermission } from "@/lib/auth/permissions";

const createPermissionSchema = z.object({
  userWorkspaceId: z.string(),
  module: z.string(),
  action: z.string(),
});

export async function GET(request: Request) {
  const workspaceId = await requireWorkspaceId();
  // Usamos un módulo/acción válidos para el tipo de ensurePermission
  await ensurePermission(workspaceId, "campaigns", "view");

  const { searchParams } = new URL(request.url);
  const userWorkspaceId = searchParams.get("userWorkspaceId") ?? undefined;

  const permissions = await prisma.permission.findMany({
    where: userWorkspaceId
      ? {
          userWorkspaces: {
            some: { id: userWorkspaceId },
          },
        }
      : undefined,
    include: {
      role: true,
      userWorkspaces: true,
    },
  });

  return NextResponse.json(permissions);
}

export async function POST(request: Request) {
  const workspaceId = await requireWorkspaceId();
  // Igual aquí: usamos "campaigns" y "create" para respetar el tipo
  await ensurePermission(workspaceId, "campaigns", "create");

  const payload = createPermissionSchema.parse(await request.json());

  // Buscamos el UserWorkspace al que vamos a asociar el permiso
  const userWorkspace = await prisma.userWorkspace.findUnique({
    where: { id: payload.userWorkspaceId },
    select: { id: true, roleId: true },
  });

  if (!userWorkspace) {
    return NextResponse.json(
      { message: "USER_WORKSPACE_NOT_FOUND" },
      { status: 404 },
    );
  }

  if (!userWorkspace.roleId) {
    return NextResponse.json(
      { message: "USER_WORKSPACE_HAS_NO_ROLE" },
      { status: 400 },
    );
  }

  const permission = await prisma.permission.create({
    data: {
      module: payload.module,
      action: payload.action,
      role: {
        connect: { id: userWorkspace.roleId },
      },
      userWorkspaces: {
        connect: { id: userWorkspace.id },
      },
    },
  });

  return NextResponse.json({
    message: "PERMISSION_CREATED",
    permission,
  });
}
