"use client";

import { useEffect, useState, useTransition } from "react";
import { Card } from "@/components/ui/Card";

type Workspace = {
  id: string;
  name: string;
  domain: string;
  plan: "basic" | "pro" | "premium";
  domains: { domain: string; active: boolean }[];
  enableAi: boolean;
  enableCalls: boolean;
  enableWhatsApp: boolean;
  enableAutomations: boolean;
  enableCampaigns: boolean;
  users?: { id: string }[];
  leads?: { id: string }[];
  contacts?: { id: string }[];
  deals?: { id: string }[];
  messages?: { id: string }[];
  campaigns?: { id: string }[];
};

const emptyForm = {
  name: "",
  domain: "",
  plan: "basic" as const,
  active: true,
  enableAi: true,
  enableCalls: true,
  enableWhatsApp: true,
  enableAutomations: true,
  enableCampaigns: true,
  id: "",
};

export function WorkspacePanel() {
  const [list, setList] = useState<Workspace[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const load = async () => {
    const res = await fetch("/api/platform/workspaces");
    if (!res.ok) return;
    setList(await res.json());
  };

  useEffect(() => {
    const run = async () => {
      await load();
    };
    run();
  }, []);

  const submit = () => {
    startTransition(async () => {
      setStatus(null);
      const method = form.id ? "PATCH" : "POST";
      const res = await fetch("/api/platform/workspaces", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = await res.json();
      setStatus(body.message ?? (res.ok ? "Saved" : "Error"));
      if (res.ok) {
        setForm(emptyForm);
        void load();
      }
    });
  };

  const remove = (id: string) => {
    startTransition(async () => {
      setStatus(null);
      const res = await fetch(`/api/platform/workspaces?id=${id}`, { method: "DELETE" });
      const body = await res.json();
      setStatus(body.message ?? (res.ok ? "Deleted" : "Error"));
      if (res.ok) void load();
    });
  };

  const edit = (ws: Workspace) => {
    setForm({
      id: ws.id,
      name: ws.name,
      domain: ws.domain,
      plan: ws.plan,
      active: ws.domains[0]?.active ?? true,
      enableAi: ws.enableAi,
      enableCalls: ws.enableCalls,
      enableWhatsApp: ws.enableWhatsApp,
      enableAutomations: ws.enableAutomations,
      enableCampaigns: ws.enableCampaigns,
    });
  };

  return (
    <Card title="Workspaces" subtitle="Superadmin panel" badge="Superadmin">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3 text-sm">
          <input
            className="w-full rounded-2xl border border-white/15 bg-transparent px-3 py-2"
            placeholder="Workspace name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="w-full rounded-2xl border border-white/15 bg-transparent px-3 py-2"
            placeholder="Domain (client1.inhoustontexas.us)"
            value={form.domain}
            onChange={(e) => setForm({ ...form, domain: e.target.value })}
          />
          <label className="block text-xs uppercase tracking-widest text-current/70">
            Plan
            <select
              className="mt-1 w-full rounded-2xl border border-white/15 bg-transparent px-3 py-2"
              value={form.plan}
              onChange={(e) => setForm({ ...form, plan: e.target.value as Workspace["plan"] })}
            >
              <option value="basic">basic</option>
              <option value="pro">pro</option>
              <option value="premium">premium</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-xs uppercase tracking-widest text-current/70">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
            Active
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.enableAi} onChange={(e) => setForm({ ...form, enableAi: e.target.checked })} /> AI
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.enableCalls} onChange={(e) => setForm({ ...form, enableCalls: e.target.checked })} /> Calls
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.enableWhatsApp} onChange={(e) => setForm({ ...form, enableWhatsApp: e.target.checked })} /> WhatsApp
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.enableAutomations} onChange={(e) => setForm({ ...form, enableAutomations: e.target.checked })} /> Automations
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.enableCampaigns} onChange={(e) => setForm({ ...form, enableCampaigns: e.target.checked })} /> Campaigns
            </label>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={submit}
              disabled={isPending || !form.name || !form.domain}
              className="flex-1 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-4 py-3 text-sm font-semibold text-slate-900 disabled:opacity-50"
            >
              {isPending ? "Saving..." : form.id ? "Update workspace" : "Create workspace"}
            </button>
            {form.id ? (
              <button
                type="button"
                onClick={() => setForm(emptyForm)}
                className="rounded-2xl border border-white/20 px-4 py-3 text-sm font-semibold"
              >
                Clear
              </button>
            ) : null}
          </div>
          {status ? <p className="text-xs text-current/70">{status}</p> : null}
        </div>
        <div className="space-y-3 text-sm">
          {list.map((ws) => (
            <div key={ws.id} className="rounded-2xl border border-white/15 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-current/60">{ws.id.slice(0, 6)}…</p>
                  <p className="text-lg font-semibold">{ws.name}</p>
                  <p className="text-xs text-current/70">{ws.domain}</p>
                  <p className="text-[11px] text-current/60">Plan: {ws.plan}</p>
                  <p className="text-[11px] text-current/60">
                    Users {ws.users?.length ?? 0} · Leads {ws.leads?.length ?? 0} · Messages {ws.messages?.length ?? 0}
                  </p>
                  <p className="text-[11px] text-current/60">
                    AI {ws.enableAi ? "on" : "off"} · Calls {ws.enableCalls ? "on" : "off"} · WhatsApp {ws.enableWhatsApp ? "on" : "off"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="rounded-xl border border-white/20 px-3 py-1 text-xs"
                    onClick={() => edit(ws)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="rounded-xl border border-rose-400/50 px-3 py-1 text-xs text-rose-200"
                    onClick={() => remove(ws.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {list.length === 0 ? <p className="text-xs text-current/60">No workspaces yet.</p> : null}
        </div>
      </div>
    </Card>
  );
}
