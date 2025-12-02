import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { UserRole } from "@prisma/client";

const acceptSchema = z.object({
  token: z.string(),
  name: z.string().min(2),
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  const payload = acceptSchema.parse(await request.json());

  const invite = await prisma.invite.findUnique({ where: { token: payload.token } });
  if (!invite) return NextResponse.json({ message: "INVITE_NOT_FOUND" }, { status: 404 });
  if (invite.accepted) return NextResponse.json({ message: "INVITE_ALREADY_USED" }, { status: 400 });
  if (new Date(invite.expiresAt) < new Date()) {
    return NextResponse.json({ message: "INVITE_EXPIRED" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: invite.email } });
  const hashedPassword = await bcrypt.hash(payload.password, 12);

  const user = existing
    ? await prisma.user.update({
        where: { id: existing.id },
        data: {
          name: payload.name,
          hashedPassword,
        },
      })
    : await prisma.user.create({
        data: {
          name: payload.name,
          email: invite.email,
          hashedPassword,
          // Rol global por defecto para usuarios invitados
          role: UserRole.sales,
        },
      });

  await prisma.userWorkspace.upsert({
    where: {
      userId_workspaceId: { userId: user.id, workspaceId: invite.workspaceId },
    },
    update: { roleId: invite.roleId },
    create: {
      userId: user.id,
      workspaceId: invite.workspaceId,
      roleId: invite.roleId,
    },
  });

  await prisma.invite.update({
    where: { token: payload.token },
    data: { accepted: true },
  });

  return NextResponse.json({
    message: "INVITE_ACCEPTED",
    workspaceId: invite.workspaceId,
    userId: user.id,
  });
}
