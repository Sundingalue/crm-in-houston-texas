"use client";

import { useEffect, useState, useTransition } from "react";
import { Card } from "@/components/ui/Card";

type EmailRow = {
  id: string;
  subject: string;
  from: string;
  to: string;
  body: string;
  receivedAt: string;
};

export function ImapInbox() {
  const [list, setList] = useState<EmailRow[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const load = async () => {
    const res = await fetch("/api/email/inbox");
    if (!res.ok) return;
    const data = await res.json();
    setList(
      (data as EmailRow[]).map((m) => ({
        ...m,
        receivedAt: new Date(m.receivedAt).toISOString(),
      })),
    );
  };

  useEffect(() => {
    const run = async () => {
      await load();
    };
    run().catch(() => {});
  }, []);

  const sync = () => {
    startTransition(async () => {
      setStatus(null);
      const res = await fetch("/api/email/imap-sync", { method: "POST" });
      const body = await res.json();
      setStatus(body.message ?? (res.ok ? "Sync OK" : "Error"));
      load();
    });
  };

  return (
    <Card title="Bandeja IMAP" subtitle="Sincroniza correos entrantes y consúltalos" badge="IMAP">
      <div className="flex items-center gap-3 text-sm">
        <button
          type="button"
          onClick={sync}
          disabled={isPending}
          className="rounded-2xl bg-gradient-to-r from-indigo-400 to-sky-400 px-4 py-2 text-xs font-semibold text-slate-900 disabled:opacity-50"
        >
          {isPending ? "Sincronizando..." : "Sync ahora"}
        </button>
        {status ? <p className="text-xs text-current/70">{status}</p> : null}
      </div>
      <div className="mt-4 space-y-3 text-sm">
        {list.map((m) => (
          <div key={m.id} className="rounded-2xl border border-white/10 p-3">
            <p className="text-xs uppercase tracking-[0.3em] text-current/60">De: {m.from}</p>
            <p className="text-xs text-current/60">Para: {m.to}</p>
            <p className="text-sm font-semibold">{m.subject}</p>
            <p className="text-xs text-current/70">{new Date(m.receivedAt).toLocaleString()}</p>
            {m.body ? <p className="mt-2 line-clamp-3 text-xs text-current/70">{m.body}</p> : null}
          </div>
        ))}
        {list.length === 0 ? <p className="text-xs text-current/60">Sin correos. Pulsa “Sync ahora” si ya configuraste IMAP.</p> : null}
      </div>
    </Card>
  );
}
