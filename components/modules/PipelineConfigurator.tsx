"use client";

import { useEffect, useState, useTransition } from "react";
import { Card } from "@/components/ui/Card";

type Stage = { id: string; name: string; order: number };

export function PipelineConfigurator() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [form, setForm] = useState({ name: "", order: stages.length + 1 });
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const load = async () => {
    const res = await fetch("/api/pipeline/stages");
    if (!res.ok) return;
    const data = await res.json();
    setStages(data);
    setForm((prev) => ({ ...prev, order: data.length + 1 }));
  };

  useEffect(() => {
    const run = async () => load();
    run().catch(() => {});
  }, []);

  const submit = () => {
    startTransition(async () => {
      setStatus(null);
      const res = await fetch("/api/pipeline/stages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = await res.json();
      setStatus(body.message ?? (res.ok ? "Saved" : "Error"));
      if (res.ok) {
        setForm({ name: "", order: stages.length + 2 });
        load();
      }
    });
  };

  return (
    <Card title="Pipeline" subtitle="Configure deal stages" badge="Stub">
      <div className="grid gap-4 lg:grid-cols-2 text-sm">
        <div className="space-y-2">
          <input
            className="w-full rounded-2xl border border-white/15 bg-transparent px-3 py-2"
            placeholder="Stage name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="w-full rounded-2xl border border-white/15 bg-transparent px-3 py-2"
            type="number"
            placeholder="Order"
            value={form.order}
            onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
          />
          <button
            type="button"
            onClick={submit}
            disabled={isPending || !form.name}
            className="rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-4 py-3 text-sm font-semibold text-slate-900 disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Add stage"}
          </button>
          {status ? <p className="text-xs text-current/70">{status}</p> : null}
        </div>
        <div className="space-y-2">
          {stages.map((stage) => (
            <div key={stage.id} className="rounded-2xl border border-white/15 p-3">
              <p className="text-xs uppercase tracking-[0.3em] text-current/60">Order {stage.order}</p>
              <p className="font-semibold">{stage.name}</p>
            </div>
          ))}
          {stages.length === 0 ? <p className="text-xs text-current/60">No stages yet.</p> : null}
        </div>
      </div>
    </Card>
  );
}
