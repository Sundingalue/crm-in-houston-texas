import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { requireWorkspaceId } from "@/lib/db/workspace";
import { ensurePermission } from "@/lib/auth/permissions";

const inviteSchema = z.object({
  email: z.string().email(),
  roleId: z.string().optional(),
  daysValid: z.number().min(1).max(30).optional().default(7),
});

export async function GET() {
  const workspaceId = await requireWorkspaceId();
  await ensurePermission(workspaceId, "settings", "view");
  const invites = await prisma.invite.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json(invites);
}

export async function POST(request: NextRequest) {
  const workspaceId = await requireWorkspaceId();
  await ensurePermission(workspaceId, "settings", "create");
  const payload = inviteSchema.parse(await request.json());

  const token = crypto.randomUUID().replace(/-/g, "");
  const expiresAt = new Date(Date.now() + payload.daysValid * 24 * 60 * 60 * 1000);

  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  const hostHeader = (await headers()).get("host") ?? "";
  const base =
    workspace?.domain && workspace.domain.length > 0
      ? `https://${workspace.domain}`
      : process.env.NEXTAUTH_URL ?? `http://${hostHeader}`;

  const invite = await prisma.invite.create({
    data: {
      email: payload.email,
      token,
      roleId: payload.roleId,
      expiresAt,
      workspaceId,
    },
  });

  const inviteUrl = `${base}/api/auth/invites/accept?token=${token}`;

  return NextResponse.json({ message: "INVITE_CREATED", invite, inviteUrl });
}

export async function DELETE(request: NextRequest) {
  const workspaceId = await requireWorkspaceId();
  await ensurePermission(workspaceId, "settings", "delete");
  const token = request.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ message: "MISSING_TOKEN" }, { status: 400 });

  await prisma.invite.delete({ where: { token } });
  return NextResponse.json({ message: "INVITE_REVOKED" });
}
