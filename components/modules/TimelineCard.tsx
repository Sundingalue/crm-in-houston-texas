"use client";

import { useEffect, useState, useTransition } from "react";
import { Card } from "@/components/ui/Card";

type Option = { id: string; label: string };

type TimelineItem = {
  id: string;
  type: string;
  kind?: string;
  title: string;
  detail?: string | null;
  timestamp: string;
};

type Props = {
  entity: "lead" | "contact";
  options: Option[];
};

export function TimelineCard({ entity, options }: Props) {
  const [selected, setSelected] = useState(options[0]?.id ?? "");
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!selected) return;
    startTransition(async () => {
      setStatus(null);
      const param = entity === "lead" ? `leadId=${selected}` : `contactId=${selected}`;
      const res = await fetch(`/api/timeline?${param}`);
      if (!res.ok) {
        setStatus("No se pudo cargar la línea de tiempo.");
        return;
      }
      const data = await res.json();
      setItems(
        (data as TimelineItem[]).map((item) => ({
          ...item,
          timestamp: new Date(item.timestamp).toISOString(),
        })),
      );
    });
  }, [entity, selected]);

  if (!options.length) return null;

  return (
    <Card title="Historial" subtitle="Interacciones en una sola vista">
      <div className="space-y-3 text-sm">
        <select
          className="w-full rounded-2xl border border-white/15 bg-transparent px-3 py-2"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          {options.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
        {status ? <p className="text-xs text-amber-200">{status}</p> : null}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-white/10 p-3">
              <p className="text-[11px] uppercase tracking-[0.3em] text-current/60">
                {item.type} {item.kind ? `· ${item.kind}` : ""}
              </p>
              <p className="text-sm font-semibold">{item.title}</p>
              {item.detail ? (
                item.type === "attachment" ? (
                  <a className="text-xs text-emerald-200 underline" href={item.detail} target="_blank" rel="noreferrer">
                    Abrir archivo
                  </a>
                ) : (
                  <p className="text-xs text-current/70">{item.detail}</p>
                )
              ) : null}
              <p className="text-[11px] text-current/60">{new Date(item.timestamp).toLocaleString()}</p>
            </div>
          ))}
          {items.length === 0 ? <p className="text-xs text-current/60">{isPending ? "Cargando..." : "Sin actividad aún."}</p> : null}
        </div>
      </div>
    </Card>
  );
}
