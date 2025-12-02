import type { Workspace } from "@prisma/client";
import { ImapFlow } from "imapflow";

export type ImapConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  tls: boolean;
};

export const readImapEnv = (): ImapConfig | null => {
  const host = process.env.IMAP_HOST;
  const port = process.env.IMAP_PORT ? Number(process.env.IMAP_PORT) : 993;
  const user = process.env.IMAP_USER;
  const password = process.env.IMAP_PASSWORD;
  const tls = process.env.IMAP_TLS ? process.env.IMAP_TLS === "true" : true;

  if (!host || !user || !password) return null;
  return { host, port, user, password, tls };
};

export async function connectImap(config: ImapConfig) {
  const client = new ImapFlow({
    host: config.host,
    port: config.port,
    secure: config.tls,
    auth: {
      user: config.user,
      pass: config.password,
    },
  });
  await client.connect();

  return {
    async listMessages() {
      await client.mailboxOpen("INBOX");
      const messages: Array<{
        uid: string;
        subject: string;
        from: string;
        to: string;
        cc?: string;
        bcc?: string;
        body: string;
        receivedAt: Date;
      }> = [];
      // Fetch latest 20 messages
      for await (const msg of client.fetch({ seq: "1:*" }, { envelope: true, source: true, bodyStructure: true, uid: true })) {
        const envelope = msg.envelope;
        messages.push({
          uid: String(msg.uid),
          subject: envelope.subject ?? "(sin asunto)",
          from: envelope.from?.map((f) => f.address).join(", ") ?? "",
          to: envelope.to?.map((t) => t.address).join(", ") ?? "",
          cc: envelope.cc?.map((t) => t.address).join(", "),
          bcc: envelope.bcc?.map((t) => t.address).join(", "),
          body: "", // body fetch skipped for speed
          receivedAt: envelope.date ?? new Date(),
        });
        if (messages.length >= 20) break;
      }
      return messages;
    },
    async close() {
      try {
        await client.logout();
      } catch {
        // ignore
      }
    },
  };
}

export async function fetchAndStoreEmails(workspace: Workspace) {
  const config = readImapEnv();
  if (!config) {
    throw new Error("IMAP configuration is missing");
  }

  const client = await connectImap(config);
  try {
    const messages = await client.listMessages();
    return messages.map((msg) => ({
      subject: msg.subject,
      from: msg.from,
      to: msg.to,
      cc: msg.cc,
      bcc: msg.bcc,
      body: msg.body,
      receivedAt: msg.receivedAt,
      workspaceId: workspace.id,
    }));
  } finally {
    await client.close();
  }
}
