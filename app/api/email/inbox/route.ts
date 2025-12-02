import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { requireWorkspaceId } from "@/lib/db/workspace";
import { ensurePermission } from "@/lib/auth/permissions";

export async function GET() {
  const workspaceId = await requireWorkspaceId();
  await ensurePermission(workspaceId, "messaging", "view");
  const emails = await prisma.emailMessage.findMany({
    where: { workspaceId },
    orderBy: { receivedAt: "desc" },
    take: 50,
  });
  return NextResponse.json(emails);
}
