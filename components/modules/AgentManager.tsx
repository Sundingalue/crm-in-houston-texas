"use client";

import { useEffect, useState, useTransition } from "react";
import { Card } from "@/components/ui/Card";

type Agent = {
  id: string;
  name: string;
  description?: string | null;
  instructions?: string | null;
  model?: string | null;
  createdAt: string;
  _count?: { messages: number };
};

export function AgentManager() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [form, setForm] = useState<{ name: string; description: string; instructions: string }>({ name: "", description: "", instructions: "" });
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const load = async () => {
    const res = await fetch("/api/ai/agents");
    if (!res.ok) return;
    const data = await res.json();
    setAgents(
      data.map((a: Agent) => ({
        ...a,
        createdAt: new Date(a.createdAt ?? Date.now()).toISOString(),
      })),
    );
  };

  useEffect(() => {
    const run = async () => {
      await load();
    };
    run().catch(() => {});
  }, []);

  const submit = () => {
    startTransition(async () => {
      setStatus(null);
      const res = await fetch("/api/ai/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = await res.json();
      setStatus(body.message ?? (res.ok ? "Agente creado" : "Error"));
      if (res.ok) {
        setForm({ name: "", description: "", instructions: "" });
        load();
      }
    });
  };

  return (
    <Card title="Agentes" subtitle="Administra agentes, prompts y modelos" badge="AI">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2 text-sm">
          <input
            className="w-full rounded-2xl border border-white/15 bg-transparent px-3 py-2"
            placeholder="Nombre del agente"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="w-full rounded-2xl border border-white/15 bg-transparent px-3 py-2"
            placeholder="Descripción"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <textarea
            className="w-full rounded-2xl border border-white/15 bg-transparent px-3 py-2"
            placeholder="Instrucciones / prompt"
            rows={3}
            value={form.instructions}
            onChange={(e) => setForm({ ...form, instructions: e.target.value })}
          />
          <button
            type="button"
            onClick={submit}
            disabled={isPending || !form.name}
            className="w-full rounded-2xl bg-gradient-to-r from-emerald-400 to-sky-400 px-4 py-3 text-sm font-semibold text-slate-900 disabled:opacity-50"
          >
            {isPending ? "Creando..." : "Crear agente"}
          </button>
          {status ? <p className="text-xs text-current/70">{status}</p> : null}
        </div>
        <div className="space-y-2 text-sm">
          {agents.map((agent) => (
            <div key={agent.id} className="rounded-2xl border border-white/10 p-3">
              <p className="text-xs uppercase tracking-[0.3em] text-current/60">{agent.id.slice(0, 6)}…</p>
              <p className="text-lg font-semibold">{agent.name}</p>
              <p className="text-xs text-current/70">{agent.description}</p>
              <p className="text-[11px] text-current/60">
                Creado: {new Date(agent.createdAt).toLocaleString()} · Mensajes: {agent._count?.messages ?? 0}
              </p>
            </div>
          ))}
          {agents.length === 0 ? <p className="text-xs text-current/60">Sin agentes aún.</p> : null}
        </div>
      </div>
    </Card>
  );
}
