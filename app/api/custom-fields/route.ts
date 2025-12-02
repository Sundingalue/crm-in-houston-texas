import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { requireWorkspaceId } from "@/lib/db/workspace";
import { ensurePermission } from "@/lib/auth/permissions";

const fieldSchema = z.object({ name: z.string(), entityType: z.string(), fieldType: z.string() });

export async function GET(request: Request) {
  const workspaceId = await requireWorkspaceId();
  await ensurePermission(workspaceId, "settings", "view");
  const { searchParams } = new URL(request.url);
  const entityType = searchParams.get("entityType") ?? undefined;
  const fields = await prisma.customField.findMany({ where: { workspaceId, ...(entityType ? { entityType } : {}) } });
  return NextResponse.json(fields);
}

export async function POST(request: Request) {
  const workspaceId = await requireWorkspaceId();
  await ensurePermission(workspaceId, "settings", "create");
  const payload = fieldSchema.parse(await request.json());
  const field = await prisma.customField.create({ data: { ...payload, workspaceId } });
  return NextResponse.json({ message: "FIELD_CREATED", field });
}
