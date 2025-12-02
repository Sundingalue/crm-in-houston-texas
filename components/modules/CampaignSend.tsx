"use client";

import { useEffect, useState, useTransition } from "react";
import { Card } from "@/components/ui/Card";

type Campaign = { id: string; name: string };
type Segment = { id: string; name: string; entityType: string };

export function CampaignSend() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [selection, setSelection] = useState({ campaignId: "", segmentId: "" });
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const load = async () => {
      const [cRes, sRes] = await Promise.all([fetch("/api/email/campaigns"), fetch("/api/segments")]);
      if (cRes.ok) setCampaigns(await cRes.json());
      if (sRes.ok) setSegments(await sRes.json());
    };
    load().catch(() => {});
  }, []);

  const send = () => {
    startTransition(async () => {
      setStatus(null);
      const res = await fetch("/api/email/campaigns/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selection),
      });
      const body = await res.json();
      setStatus(body.message ?? (res.ok ? "Queued" : "Error"));
    });
  };

  return (
    <Card title="Enviar campaña" subtitle="Selecciona campaña y segmento" badge="Queue stub">
      <div className="grid gap-3 text-sm">
        <select
          className="w-full rounded-2xl border border-white/15 bg-transparent px-3 py-2"
          value={selection.campaignId}
          onChange={(e) => setSelection({ ...selection, campaignId: e.target.value })}
        >
          <option value="">Selecciona campaña</option>
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          className="w-full rounded-2xl border border-white/15 bg-transparent px-3 py-2"
          value={selection.segmentId}
          onChange={(e) => setSelection({ ...selection, segmentId: e.target.value })}
        >
          <option value="">Todos</option>
          {segments.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.entityType})
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={send}
          disabled={isPending || !selection.campaignId}
          className="rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-4 py-3 text-sm font-semibold text-slate-900 disabled:opacity-50"
        >
          {isPending ? "Enviando..." : "Colocar en cola"}
        </button>
        {status ? <p className="text-xs text-current/70">{status}</p> : null}
      </div>
    </Card>
  );
}
