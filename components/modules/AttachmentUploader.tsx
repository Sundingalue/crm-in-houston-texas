"use client";

import { useEffect, useState, useTransition } from "react";
import { Card } from "@/components/ui/Card";

type Option = { id: string; label: string };
type Attachment = { id: string; name: string; url: string; createdAt: string };

type Props = {
  entityType: "lead" | "contact" | "deal";
  options: Option[];
};

export function AttachmentUploader({ entityType, options }: Props) {
  const [entityId, setEntityId] = useState(options[0]?.id ?? "");
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [list, setList] = useState<Attachment[]>([]);
  const [isPending, startTransition] = useTransition();

  const load = async (id: string) => {
    const res = await fetch(`/api/attachments?entityType=${entityType}&entityId=${id}`);
    if (!res.ok) return;
    const data = await res.json();
    setList(
      (data as Attachment[]).map((a) => ({
        ...a,
        createdAt: new Date(a.createdAt).toISOString(),
      })),
    );
  };

  useEffect(() => {
    if (!entityId) return;
    load(entityId).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityId, entityType]);

  const submit = () => {
    startTransition(async () => {
      setStatus(null);
      const res = await fetch("/api/attachments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, url, entityType, entityId }),
      });
      const body = await res.json();
      setStatus(body.message ?? (res.ok ? "Guardado" : "Error"));
      if (res.ok) {
        setName("");
        setUrl("");
        load(entityId);
      }
    });
  };

  if (!options.length) return null;

  return (
    <Card title="Archivos" subtitle="Adjunta URLs (S3/Drive) al registro">
      <div className="grid gap-3 text-sm">
        <select
          className="w-full rounded-2xl border border-white/15 bg-transparent px-3 py-2"
          value={entityId}
          onChange={(e) => setEntityId(e.target.value)}
        >
          {options.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
        <input
          className="w-full rounded-2xl border border-white/15 bg-transparent px-3 py-2"
          placeholder="Nombre de archivo"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="w-full rounded-2xl border border-white/15 bg-transparent px-3 py-2"
          placeholder="URL (S3/Drive)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          type="button"
          onClick={submit}
          disabled={isPending || !name || !url}
          className="w-full rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-4 py-2 text-xs font-semibold text-slate-900 disabled:opacity-50"
        >
          {isPending ? "Guardando..." : "Adjuntar"}
        </button>
        {status ? <p className="text-xs text-current/70">{status}</p> : null}
        <div className="space-y-2">
          {list.map((att) => (
            <a
              key={att.id}
              href={att.url}
              target="_blank"
              rel="noreferrer"
              className="block rounded-2xl border border-white/10 px-3 py-2 hover:border-emerald-200/50"
            >
              <p className="text-sm font-semibold">{att.name}</p>
              <p className="text-[11px] text-current/60">{new Date(att.createdAt).toLocaleString()}</p>
              <p className="text-[11px] text-emerald-200/80 break-all">{att.url}</p>
            </a>
          ))}
          {list.length === 0 ? <p className="text-xs text-current/60">Sin archivos adjuntos.</p> : null}
        </div>
      </div>
    </Card>
  );
}
