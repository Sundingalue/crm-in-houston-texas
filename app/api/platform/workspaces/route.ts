import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

const workspaceSchema = z.object({
  name: z.string().min(2),
  domain: z.string().min(3),
  active: z.boolean().optional().default(true),
  plan: z.enum(["basic", "pro", "premium"]).optional().default("basic"),
  enableAi: z.boolean().optional().default(true),
  enableCalls: z.boolean().optional().default(true),
  enableWhatsApp: z.boolean().optional().default(true),
  enableAutomations: z.boolean().optional().default(true),
  enableCampaigns: z.boolean().optional().default(true),
});

const superadminEmail = process.env.SUPERADMIN_EMAIL;

async function requireSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!superadminEmail) {
    throw new Error("SUPERADMIN_EMAIL is not configured");
  }
  if (!session?.user?.email || session.user.email !== superadminEmail) {
    throw new Error("UNAUTHORIZED");
  }
}

export async function GET() {
  try {
    await requireSuperAdmin();
  } catch {
    return NextResponse.json({ message: "UNAUTHORIZED" }, { status: 401 });
  }

  const workspaces = await prisma.workspace.findMany({
    include: {
      domains: true,
      users: { select: { id: true } },
      leads: { select: { id: true } },
      contacts: { select: { id: true } },
      deals: { select: { id: true } },
      messages: { select: { id: true } },
      campaigns: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(workspaces);
}

export async function POST(request: NextRequest) {
  try {
    await requireSuperAdmin();
  } catch {
    return NextResponse.json({ message: "UNAUTHORIZED" }, { status: 401 });
  }

  const payload = workspaceSchema.parse(await request.json());

  const existing = await prisma.workspaceDomain.findUnique({ where: { domain: payload.domain } });
  if (existing) {
    return NextResponse.json({ message: "DOMAIN_EXISTS" }, { status: 409 });
  }

  const workspace = await prisma.workspace.create({
    data: {
      name: payload.name,
      domain: payload.domain,
      plan: payload.plan,
      enableAi: payload.enableAi,
      enableCalls: payload.enableCalls,
      enableWhatsApp: payload.enableWhatsApp,
      enableAutomations: payload.enableAutomations,
      enableCampaigns: payload.enableCampaigns,
      domains: {
        create: { domain: payload.domain, active: payload.active },
      },
    },
  });

  return NextResponse.json({ message: "WORKSPACE_CREATED", workspace });
}

export async function PATCH(request: NextRequest) {
  try {
    await requireSuperAdmin();
  } catch {
    return NextResponse.json({ message: "UNAUTHORIZED" }, { status: 401 });
  }

  const updateSchema = workspaceSchema.extend({ id: z.string() });
  const payload = updateSchema.parse(await request.json());

  const workspace = await prisma.workspace.update({
    where: { id: payload.id },
    data: {
      name: payload.name,
      domain: payload.domain,
      plan: payload.plan,
      enableAi: payload.enableAi,
      enableCalls: payload.enableCalls,
      enableWhatsApp: payload.enableWhatsApp,
      enableAutomations: payload.enableAutomations,
      enableCampaigns: payload.enableCampaigns,
      domains: {
        upsert: {
          where: { domain: payload.domain },
          create: { domain: payload.domain, active: payload.active },
          update: { domain: payload.domain, active: payload.active },
        },
      },
    },
    include: { domains: true },
  });

  return NextResponse.json({ message: "WORKSPACE_UPDATED", workspace });
}

export async function DELETE(request: NextRequest) {
  try {
    await requireSuperAdmin();
  } catch {
    return NextResponse.json({ message: "UNAUTHORIZED" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ message: "MISSING_ID" }, { status: 400 });
  }

  await prisma.workspace.delete({ where: { id } });
  return NextResponse.json({ message: "WORKSPACE_DELETED" });
}
