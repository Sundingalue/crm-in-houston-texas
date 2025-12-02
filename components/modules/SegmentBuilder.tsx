"use client";

import { useEffect, useState, useTransition } from "react";
import { Card } from "@/components/ui/Card";

type Segment = { id: string; name: string; entityType: string; filter: unknown };

export function SegmentBuilder() {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [form, setForm] = useState({ name: "", entityType: "lead", filter: "status=qualified" });
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const load = async () => {
    const res = await fetch("/api/segments");
    if (!res.ok) return;
    setSegments(await res.json());
  };

  useEffect(() => {
    const run = async () => load();
    run().catch(() => {});
  }, []);

  const submit = () => {
    startTransition(async () => {
      setStatus(null);
      const res = await fetch("/api/segments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, entityType: form.entityType, filter: { raw: form.filter } }),
      });
      const body = await res.json();
      setStatus(body.message ?? (res.ok ? "Saved" : "Error"));
      if (res.ok) {
        setForm({ name: "", entityType: "lead", filter: "" });
        load();
      }
    });
  };

  return (
    <Card title="Segments" subtitle="Build basic segments" badge="Stub">
      <div className="grid gap-4 lg:grid-cols-2 text-sm">
        <div className="space-y-2">
          <input
            className="w-full rounded-2xl border border-white/15 bg-transparent px-3 py-2"
            placeholder="Segment name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <select
            className="w-full rounded-2xl border border-white/15 bg-transparent px-3 py-2"
            value={form.entityType}
            onChange={(e) => setForm({ ...form, entityType: e.target.value })}
          >
            <option value="lead">Lead</option>
            <option value="contact">Contact</option>
            <option value="deal">Deal</option>
          </select>
          <textarea
            className="w-full rounded-2xl border border-white/15 bg-transparent px-3 py-2"
            rows={3}
            placeholder="Filter expression"
            value={form.filter}
            onChange={(e) => setForm({ ...form, filter: e.target.value })}
          />
          <button
            type="button"
            onClick={submit}
            disabled={isPending || !form.name}
            className="rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-4 py-3 text-sm font-semibold text-slate-900 disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Create segment"}
          </button>
          {status ? <p className="text-xs text-current/70">{status}</p> : null}
        </div>
        <div className="space-y-2">
          {segments.map((segment) => (
            <div key={segment.id} className="rounded-2xl border border-white/15 p-3">
              <p className="text-xs uppercase tracking-[0.3em] text-current/60">{segment.entityType}</p>
              <p className="font-semibold">{segment.name}</p>
              <p className="text-[11px] text-current/60">{JSON.stringify(segment.filter)}</p>
            </div>
          ))}
          {segments.length === 0 ? <p className="text-xs text-current/60">No segments yet.</p> : null}
        </div>
      </div>
    </Card>
  );
}
