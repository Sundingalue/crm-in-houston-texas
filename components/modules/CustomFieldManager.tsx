"use client";

import { useEffect, useState, useTransition } from "react";
import { Card } from "@/components/ui/Card";

type Field = { id: string; name: string; entityType: string; fieldType: string };

export function CustomFieldManager() {
  const [fields, setFields] = useState<Field[]>([]);
  const [form, setForm] = useState({ name: "", entityType: "lead", fieldType: "text" });
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const load = async () => {
    const res = await fetch("/api/custom-fields");
    if (!res.ok) return;
    setFields(await res.json());
  };

  useEffect(() => {
    const run = async () => load();
    run().catch(() => {});
  }, []);

  const submit = () => {
    startTransition(async () => {
      setStatus(null);
      const res = await fetch("/api/custom-fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = await res.json();
      setStatus(body.message ?? (res.ok ? "Saved" : "Error"));
      if (res.ok) {
        setForm({ name: "", entityType: "lead", fieldType: "text" });
        load();
      }
    });
  };

  return (
    <Card title="Custom fields" subtitle="Add fields to leads/contacts/deals" badge="Stub">
      <div className="grid gap-4 lg:grid-cols-2 text-sm">
        <div className="space-y-2">
          <input
            className="w-full rounded-2xl border border-white/15 bg-transparent px-3 py-2"
            placeholder="Field name"
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
            <option value="account">Account</option>
            <option value="deal">Deal</option>
          </select>
          <select
            className="w-full rounded-2xl border border-white/15 bg-transparent px-3 py-2"
            value={form.fieldType}
            onChange={(e) => setForm({ ...form, fieldType: e.target.value })}
          >
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="date">Date</option>
            <option value="select">Select</option>
          </select>
          <button
            type="button"
            onClick={submit}
            disabled={isPending || !form.name}
            className="rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-4 py-3 text-sm font-semibold text-slate-900 disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Create field"}
          </button>
          {status ? <p className="text-xs text-current/70">{status}</p> : null}
        </div>
        <div className="space-y-2">
          {fields.map((field) => (
            <div key={field.id} className="rounded-2xl border border-white/15 p-3">
              <p className="text-xs uppercase tracking-[0.3em] text-current/60">{field.entityType}</p>
              <p className="font-semibold">{field.name}</p>
              <p className="text-[11px] text-current/60">{field.fieldType}</p>
            </div>
          ))}
          {fields.length === 0 ? <p className="text-xs text-current/60">No custom fields yet.</p> : null}
        </div>
      </div>
    </Card>
  );
}
