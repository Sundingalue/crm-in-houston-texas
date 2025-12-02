import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { isSuperAdmin } from "@/lib/auth/permissions";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json([], { status: 200 });

  if (isSuperAdmin(session.user.email)) {
    const workspaces = await prisma.workspace.findMany({ select: { id: true, name: true, domain: true } });
    return NextResponse.json(workspaces);
  }

  const userId = session.user.id;
  if (!userId) return NextResponse.json([], { status: 200 });

  const memberships = await prisma.userWorkspace.findMany({
    where: { userId },
    select: {
      workspace: {
        select: { id: true, name: true, domain: true },
      },
    },
  });
  return NextResponse.json(memberships.map((m) => m.workspace));
}

export async function POST(request: Request) {
  const { workspaceId } = await request.json();
  if (!workspaceId) return NextResponse.json({ message: "MISSING_WORKSPACE" }, { status: 400 });
  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  if (!workspace) return NextResponse.json({ message: "NOT_FOUND" }, { status: 404 });
  const response = NextResponse.json({ message: "WORKSPACE_SELECTED", workspaceId });
  response.cookies.set("workspaceId", workspaceId, { path: "/", httpOnly: false });
  return response;
}
