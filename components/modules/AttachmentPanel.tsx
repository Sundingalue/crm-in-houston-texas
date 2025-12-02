"use client";

import { useEffect, useState, useTransition } from "react";
import { Card } from "@/components/ui/Card";

type Attachment = { id: string; name: string; url: string; entityType: string; entityId: string; createdAt: string };

export function AttachmentPanel() {
  const [list, setList] = useState<Attachment[]>([]);
  const [form, setForm] = useState({ name: "", url: "", entityType: "lead", entityId: "" });
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const load = async () => {
    const res = await fetch("/api/attachments");
    if (!res.ok) return;
    setList(await res.json());
  };

  useEffect(() => {
    const run = async () => load();
    run().catch(() => {});
  }, []);

  const submit = () => {
    startTransition(async () => {
      setStatus(null);
      const res = await fetch("/api/attachments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = await res.json();
      setStatus(body.message ?? (res.ok ? "Saved" : "Error"));
      if (res.ok) {
        setForm({ name: "", url: "", entityType: "lead", entityId: "" });
        load();
      }
    });
  };

  return (
    <Card title="Attachments" subtitle="Upload/download placeholder" badge="Stub">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2 text-sm">
          <input
            className="w-full rounded-2xl border border-white/15 bg-transparent px-3 py-2"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="w-full rounded-2xl border border-white/15 bg-transparent px-3 py-2"
            placeholder="URL"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
          />
          <input
            className="w-full rounded-2xl border border-white/15 bg-transparent px-3 py-2"
            placeholder="Entity type (lead/contact/deal)"
            value={form.entityType}
            onChange={(e) => setForm({ ...form, entityType: e.target.value })}
          />
          <input
            className="w-full rounded-2xl border border-white/15 bg-transparent px-3 py-2"
            placeholder="Entity ID"
            value={form.entityId}
            onChange={(e) => setForm({ ...form, entityId: e.target.value })}
          />
          <button
            type="button"
            onClick={submit}
            disabled={isPending || !form.name || !form.url || !form.entityId}
            className="rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-4 py-3 text-sm font-semibold text-slate-900 disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save attachment"}
          </button>
          {status ? <p className="text-xs text-current/70">{status}</p> : null}
        </div>
        <div className="space-y-2 text-sm">
          {list.map((att) => (
            <div key={att.id} className="rounded-2xl border border-white/15 p-3">
              <p className="text-xs uppercase tracking-[0.3em] text-current/60">{att.entityType}</p>
              <p className="font-semibold">{att.name}</p>
              <p className="text-[11px] text-current/70">{att.url}</p>
            </div>
          ))}
          {list.length === 0 ? <p className="text-xs text-current/60">No attachments yet.</p> : null}
        </div>
      </div>
    </Card>
  );
}
