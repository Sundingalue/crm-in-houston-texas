import { NextResponse } from "next/server";
import { requireWorkspaceId } from "@/lib/db/workspace";
import { ensurePermission } from "@/lib/auth/permissions";

export async function GET() {
  const workspaceId = await requireWorkspaceId();
  await ensurePermission(workspaceId, "settings", "view");
  return NextResponse.json({
    leads: 0,
    deals: 0,
    campaigns: 0,
    messages: 0,
    note: "Analytics summary stub",
  });
}
