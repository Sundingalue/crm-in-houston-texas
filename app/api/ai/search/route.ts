import { NextResponse } from "next/server";
import { z } from "zod";
import { enforceRateLimit } from "@/lib/utils/rate-limit";
import { prisma } from "@/lib/db/client";
import { ensureFeatureEnabled, requireWorkspaceId } from "@/lib/db/workspace";
import { ensurePermission } from "@/lib/auth/permissions";

const searchSchema = z.object({
  query: z.string().min(2),
});

type SearchResult = {
  id: string;
  type: "lead" | "contact" | "account" | "deal";
  title: string;
  detail?: string;
};

export async function POST(request: Request) {
  const workspaceId = await requireWorkspaceId();
  const enabled = await ensureFeatureEnabled(workspaceId, "ai");
  if (!enabled) return NextResponse.json({ message: "AI_DISABLED" }, { status: 403 });
  await ensurePermission(workspaceId, "ai", "view");

  const payload = searchSchema.parse(await request.json());
  enforceRateLimit("ai-search", 80, 60_000);

  const q = payload.query;

  const [leads, contacts, accounts, deals] = await Promise.all([
    prisma.lead.findMany({
      where: {
        workspaceId,
        OR: [
          { name: { contains: q } },
          { company: { contains: q } },
          { source: { contains: q } },
        ],
      },
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
    prisma.contact.findMany({
      where: {
        workspaceId,
        OR: [
          { name: { contains: q } },
          { email: { contains: q } },
          { phone: { contains: q } },
        ],
      },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { account: true },
    }),
    prisma.company.findMany({
      where: {
        workspaceId,
        OR: [
          { name: { contains: q } },
          { industry: { contains: q } },
        ],
      },
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
    prisma.deal.findMany({
      where: {
        workspaceId,
        OR: [
          { name: { contains: q } },
          { account: { name: { contains: q } } },
          { lead: { company: { contains: q } } },
        ],
      },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { account: true, lead: true },
    }),
  ]);

  const results: SearchResult[] = [
    ...leads.map((lead) => ({
      id: lead.id,
      type: "lead" as const,
      title: `Lead · ${lead.name}`,
      detail: `${lead.company} · ${lead.status} · ${lead.source}`,
    })),
    ...contacts.map((c) => ({
      id: c.id,
      type: "contact" as const,
      title: `Contacto · ${c.name}`,
      detail: `${c.email ?? ""} ${c.phone ?? ""} ${(c as { account?: { name?: string | null } }).account?.name ? "· " + (c as { account?: { name?: string | null } }).account?.name : ""}`.trim(),
    })),
    ...accounts.map((a) => ({
      id: a.id,
      type: "account" as const,
      title: `Cuenta · ${a.name}`,
      detail: `${a.industry ?? "sin industria"} · ${a.size}`,
    })),
    ...deals.map((d) => ({
      id: d.id,
      type: "deal" as const,
      title: `Deal · ${d.name}`,
      detail: `${d.stage} · ${(d as { account?: { name?: string | null }; lead?: { company?: string | null } }).account?.name ?? (d as { lead?: { company?: string | null } }).lead?.company ?? ""}`,
    })),
  ].slice(0, 12);

  return NextResponse.json({
    query: payload.query,
    results,
  });
}
