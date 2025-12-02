import { NextResponse } from "next/server";
import { requireWorkspaceId } from "@/lib/db/workspace";
import { prisma } from "@/lib/db/client";

export async function GET() {
  const workspaceId = await requireWorkspaceId();
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: {
      id: true,
      name: true,
      domain: true,
      enableAi: true,
      enableCalls: true,
      enableWhatsApp: true,
      enableAutomations: true,
      enableCampaigns: true,
    },
  });
  return NextResponse.json(workspace);
}
