import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/client";

const bodySchema = z.object({
  workspace: z.string().min(3),
  domain: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
});

export async function POST(request: Request) {
  const payload = bodySchema.parse(await request.json());

  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUser) {
    return NextResponse.json({ code: "EMAIL_EXISTS" }, { status: 409 });
  }

  const workspace = await prisma.workspace.create({
    data: {
      name: payload.workspace,
      domain: payload.domain,
      primaryColor: payload.primaryColor ?? "#f97316",
      secondaryColor: payload.secondaryColor ?? "#0ea5e9",
    },
  });

  const hashedPassword = await bcrypt.hash(payload.password, 12);

  await prisma.user.create({
    data: {
      name: payload.email.split("@")[0] ?? "Administrador",
      email: payload.email,
      hashedPassword,
      role: "admin",
      workspaceId: workspace.id,
    },
  });

  return NextResponse.json(
    {
      message: "Workspace created",
      workspace: workspace.name,
      domain: workspace.domain,
    },
    { status: 201 },
  );
}
