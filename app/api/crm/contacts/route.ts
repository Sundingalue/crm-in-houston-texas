import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { requireWorkspaceId } from "@/lib/db/workspace";
import { ensurePermission } from "@/lib/auth/permissions";

const contactoSchema = z.object({
  name: z.string(),
  title: z.string().optional(),
  email: z.string().email(),
  phone: z.string().optional(),
  accountId: z.string().optional(),
});

const contactoUpdateSchema = contactoSchema.extend({
  id: z.string(),
});

const contactoDeleteSchema = z.object({ id: z.string() });

export async function GET() {
  const workspaceId = await requireWorkspaceId();
  await ensurePermission(workspaceId, "contacts", "view");
  const contactos = await prisma.contact.findMany({
    where: { workspaceId },
    include: {
      account: {
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(contactos);
}

export async function POST(request: Request) {
  const workspaceId = await requireWorkspaceId();
  await ensurePermission(workspaceId, "contacts", "create");
  const payload = contactoSchema.parse(await request.json());
  const contacto = await prisma.contact.create({
    data: {
      name: payload.name,
      title: payload.title,
      email: payload.email,
      phone: payload.phone,
      accountId: payload.accountId,
      workspaceId,
    },
  });
  return NextResponse.json({ message: "Contacto creado", contacto });
}

export async function PATCH(request: Request) {
  const workspaceId = await requireWorkspaceId();
  await ensurePermission(workspaceId, "contacts", "edit");
  const payload = contactoUpdateSchema.parse(await request.json());
  const contacto = await prisma.contact.update({
    where: { id: payload.id, workspaceId },
    data: {
      name: payload.name,
      title: payload.title,
      email: payload.email,
      phone: payload.phone,
      accountId: payload.accountId,
    },
  });
  return NextResponse.json({ message: "Contacto actualizado", contacto });
}

export async function DELETE(request: Request) {
  const workspaceId = await requireWorkspaceId();
  await ensurePermission(workspaceId, "contacts", "delete");
  const payload = contactoDeleteSchema.parse(await request.json());
  await prisma.contact.delete({ where: { id: payload.id, workspaceId } });
  return NextResponse.json({ message: "Contacto eliminado" });
}
