import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { requireWorkspaceId } from "@/lib/db/workspace";
import { ensurePermission } from "@/lib/auth/permissions";

const attachmentSchema = z.object({ name: z.string(), url: z.string().url(), entityType: z.string(), entityId: z.string() });

export async function GET(request: Request) {
  const workspaceId = await requireWorkspaceId();
  await ensurePermission(workspaceId, "settings", "view");
  const { searchParams } = new URL(request.url);
  const entityId = searchParams.get("entityId") ?? undefined;
  const entityType = searchParams.get("entityType") ?? undefined;
  const attachments = await prisma.attachment.findMany({
    where: { workspaceId, ...(entityId ? { entityId } : {}), ...(entityType ? { entityType } : {}) },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(attachments);
}

export async function POST(request: Request) {
  const workspaceId = await requireWorkspaceId();
  await ensurePermission(workspaceId, "settings", "create");
  const payload = attachmentSchema.parse(await request.json());
  const attachment = await prisma.attachment.create({ data: { ...payload, workspaceId } });
  return NextResponse.json({ message: "ATTACHMENT_SAVED", attachment });
}
