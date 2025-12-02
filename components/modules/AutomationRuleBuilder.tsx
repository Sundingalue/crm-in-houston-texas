"use client";

import { useEffect, useState, useTransition } from "react";
import { Card } from "@/components/ui/Card";

type Rule = { id: string; name: string; trigger: unknown; actions: unknown; active: boolean };

export function AutomationRuleBuilder() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [form, setForm] = useState({ name: "", trigger: "lead.created", active: true });
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const load = async () => {
    const res = await fetch("/api/automations/rules");
    if (!res.ok) return;
    setRules(await res.json());
  };

  useEffect(() => {
    const run = async () => load();
    run().catch(() => {});
  }, []);

  const submit = () => {
    startTransition(async () => {
      setStatus(null);
      const res = await fetch("/api/automations/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, trigger: { event: form.trigger }, actions: [{ type: "email" }], active: form.active }),
      });
      const body = await res.json();
      setStatus(body.message ?? (res.ok ? "Saved" : "Error"));
      if (res.ok) {
        setForm({ name: "", trigger: "lead.created", active: true });
        load();
      }
    });
  };

  return (
    <Card title="Automations" subtitle="Rules engine skeleton" badge="Stub">
      <div className="grid gap-4 lg:grid-cols-2 text-sm">
        <div className="space-y-2">
          <input
            className="w-full rounded-2xl border border-white/15 bg-transparent px-3 py-2"
            placeholder="Rule name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <select
            className="w-full rounded-2xl border border-white/15 bg-transparent px-3 py-2"
            value={form.trigger}
            onChange={(e) => setForm({ ...form, trigger: e.target.value })}
          >
            <option value="lead.created">Lead created</option>
            <option value="lead.status_changed">Lead status changed</option>
            <option value="deal.created">Deal created</option>
            <option value="message.received">Message received</option>
          </select>
          <label className="flex items-center gap-2 text-xs uppercase tracking-widest text-current/70">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Active
          </label>
          <button
            type="button"
            onClick={submit}
            disabled={isPending || !form.name}
            className="rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-4 py-3 text-sm font-semibold text-slate-900 disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Create rule"}
          </button>
          {status ? <p className="text-xs text-current/70">{status}</p> : null}
        </div>
        <div className="space-y-2">
          {rules.map((rule) => (
            <div key={rule.id} className="rounded-2xl border border-white/15 p-3">
              <p className="text-xs uppercase tracking-[0.3em] text-current/60">{rule.active ? "Active" : "Inactive"}</p>
              <p className="font-semibold">{rule.name}</p>
              <p className="text-[11px] text-current/60">{JSON.stringify(rule.trigger)}</p>
            </div>
          ))}
          {rules.length === 0 ? <p className="text-xs text-current/60">No rules yet.</p> : null}
        </div>
      </div>
    </Card>
  );
}
