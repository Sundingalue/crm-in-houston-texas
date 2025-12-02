import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { requireWorkspaceId } from "@/lib/db/workspace";
import { fetchAndStoreEmails, readImapEnv } from "@/lib/email/imap";
import { logError, logInfo } from "@/lib/utils/logger";

export async function POST() {
  try {
    const workspaceId = await requireWorkspaceId();
    const imapConfig = readImapEnv();
    if (!imapConfig) {
      return NextResponse.json({ message: "IMAP_NOT_CONFIGURED" }, { status: 501 });
    }

    const messages = await fetchAndStoreEmails({ id: workspaceId } as unknown as { id: string });

    if (!messages.length) {
      const placeholder = await prisma.emailMessage.create({
        data: {
          subject: "IMAP sync placeholder",
          from: "inbox@example.com",
          to: "you@example.com",
          body: "Configure IMAP to ingest real mail.",
          workspaceId,
        },
      });
      await logInfo("IMAP_SYNC_PLACEHOLDER", { workspaceId });
      return NextResponse.json({ message: "IMAP sync simulated", created: [placeholder] });
    }

    const created = await prisma.emailMessage.createMany({ data: messages });
    await logInfo("IMAP_SYNC_OK", { workspaceId, count: messages.length });
    return NextResponse.json({ message: "IMAP sync completed", created });
  } catch (error) {
    await logError("IMAP_SYNC_ERROR", { error: String(error) });
    return NextResponse.json({ message: "IMAP_SYNC_ERROR" }, { status: 500 });
  }
}
