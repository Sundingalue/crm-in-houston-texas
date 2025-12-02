import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { requireWorkspaceId } from "@/lib/db/workspace";
import { ensurePermission } from "@/lib/auth/permissions";
import { logError } from "@/lib/utils/logger";

const querySchema = z.object({
  leadId: z.string().optional(),
  contactId: z.string().optional(),
});

type TimelineItem = {
  id: string;
  type: "activity" | "message" | "email" | "attachment";
  kind?: string;
  title: string;
  detail?: string | null;
  timestamp: Date;
};

export async function GET(request: Request) {
  try {
    const workspaceId = await requireWorkspaceId();
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      leadId: searchParams.get("leadId") ?? undefined,
      contactId: searchParams.get("contactId") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json({ message: "INVALID_PARAMS" }, { status: 400 });
    }

    const { leadId, contactId } = parsed.data;
    if (!leadId && !contactId) return NextResponse.json({ message: "MISSING_TARGET" }, { status: 400 });

    if (leadId) await ensurePermission(workspaceId, "leads", "view");
    if (contactId) await ensurePermission(workspaceId, "contacts", "view");

    const [activities, messages, emails, attachments] = await Promise.all([
      leadId
        ? prisma.activity.findMany({
            where: { workspaceId, leadId },
            orderBy: { createdAt: "desc" },
            take: 50,
          })
        : Promise.resolve([] as []),
      prisma.message.findMany({
        where: { workspaceId, ...(contactId ? { contactId } : {}), ...(leadId ? { leadId } : {}) },
        orderBy: { sentAt: "desc" },
        take: 50,
      }),
      prisma.emailMessage.findMany({
        where: { workspaceId, ...(contactId ? { contactId } : {}), ...(leadId ? { leadId } : {}) },
        orderBy: { receivedAt: "desc" },
        take: 50,
      }),
      prisma.attachment.findMany({
        where: { workspaceId, ...(contactId ? { entityId: contactId } : {}), ...(leadId ? { entityId: leadId } : {}) },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);

    const items: TimelineItem[] = [
      ...activities.map((a) => ({
        id: a.id,
        type: "activity" as const,
        kind: a.type,
        title: a.summary,
        detail: a.notes,
        timestamp: a.createdAt,
      })),
      ...messages.map((m) => ({
        id: m.id,
        type: "message" as const,
        kind: m.channel,
        title: m.body.slice(0, 120),
        detail: m.metadata ? JSON.stringify(m.metadata) : undefined,
        timestamp: m.sentAt,
      })),
      ...emails.map((e) => ({
        id: e.id,
        type: "email" as const,
        kind: "email",
        title: e.subject,
        detail: e.body?.slice(0, 160),
        timestamp: e.receivedAt,
      })),
      ...attachments.map((a) => ({
        id: a.id,
        type: "attachment" as const,
        kind: a.entityType,
        title: a.name,
        detail: a.url,
        timestamp: a.createdAt,
      })),
    ];

    const sorted = items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 100);

    return NextResponse.json(sorted);
  } catch (error) {
    await logError("TIMELINE_ERROR", { error: String(error) });
    return NextResponse.json({ message: "TIMELINE_ERROR" }, { status: 500 });
  }
}
