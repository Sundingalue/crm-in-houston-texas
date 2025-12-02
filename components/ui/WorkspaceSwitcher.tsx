"use client";

import { useEffect, useState, useTransition } from "react";

type Workspace = { id: string; name: string; domain: string; plan?: string };

export function WorkspaceSwitcher() {
  const [list, setList] = useState<Workspace[]>([]);
  const [current, setCurrent] = useState<string>("");
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [currentLabel, setCurrentLabel] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const [resList, resCurrent] = await Promise.all([fetch("/api/workspaces"), fetch("/api/workspace/current")]);
      if (resList.ok) {
        const data: Workspace[] = await resList.json();
        setList(data);
      }
      if (resCurrent.ok) {
        const data = await resCurrent.json();
        if (data?.id) {
          setCurrent(data.id);
          setCurrentLabel(`${data.name} (${data.plan ?? "plan?"})`);
        }
      }
    };
    load().catch(() => {});
  }, []);

  const select = (id: string) => {
    startTransition(async () => {
      setStatus(null);
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: id }),
      });
      const body = await res.json();
      setStatus(body.message ?? (res.ok ? "Cambiado" : "Error"));
      if (res.ok) {
        setCurrent(id);
        window.location.reload();
      }
    });
  };

  if (!list.length) return null;

  return (
    <div className="flex items-center gap-2">
      <select
        className="rounded-2xl border border-white/20 bg-transparent px-3 py-2 text-xs"
        value={current}
        onChange={(e) => select(e.target.value)}
      >
        <option value="">Switch workspace</option>
        {list.map((ws) => (
          <option key={ws.id} value={ws.id}>
            {ws.name} ({ws.domain}) {ws.plan ? `· ${ws.plan}` : ""}
          </option>
        ))}
      </select>
      <div className="flex flex-col text-[11px] text-current/60">
        {status ? <span>{isPending ? "…" : status}</span> : null}
        {currentLabel ? <span>Actual: {currentLabel}</span> : null}
      </div>
    </div>
  );
}
