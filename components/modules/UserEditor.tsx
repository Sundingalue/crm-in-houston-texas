"use client";

import { useEffect, useState, useTransition } from "react";
import { Card } from "@/components/ui/Card";
import { useDictionary } from "@/components/providers/LanguageProvider";

type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "sales";
  active: boolean;
  memberships?: { roleId?: string | null }[];
};

type RoleOption = { id: string; name: string };

export const UserEditor = () => {
  const dict = useDictionary();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [roleId, setRoleId] = useState<string>("");
  const [active, setActive] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [roleOptions, setRoleOptions] = useState<RoleOption[]>([]);

  const load = async () => {
    const res = await fetch("/api/auth/users");
    if (!res.ok) return;
    const data = await res.json();
    setUsers(data);
    if (data[0]) {
      setSelectedId((prev) => prev || data[0].id);
      setActive((prev) => prev ?? data[0].active);
      if (data[0].memberships?.[0]?.roleId) {
        setRoleId((prev) => prev || data[0].memberships[0].roleId || "");
      }
    }
  };

  useEffect(() => {
    const run = async () => load();
    run().catch(() => {});
  }, []);

  useEffect(() => {
    const loadRoles = async () => {
      const res = await fetch("/api/roles");
      if (!res.ok) return;
      const data = await res.json();
      setRoleOptions(data);
      if (!roleId && data[0]) setRoleId(data[0].id);
    };
    loadRoles().catch(() => {});
  }, [roleId]);

  const update = () => {
    startTransition(async () => {
      setStatus(null);
      const res = await fetch("/api/auth/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedId, name: users.find((u) => u.id === selectedId)?.name ?? "", roleId, active }),
      });
      const body = await res.json();
      setStatus(res.ok ? dict.forms.updated : body.message ?? dict.errors.default);
      if (res.ok) load();
    });
  };

  const remove = () => {
    startTransition(async () => {
      setStatus(null);
      const res = await fetch("/api/auth/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedId }),
      });
      const body = await res.json();
      setStatus(res.ok ? dict.forms.deleted : body.message ?? dict.errors.default);
      if (res.ok) load();
    });
  };

  return (
    <Card title={dict.forms.user.title} subtitle={dict.forms.user.subtitle} badge={dict.forms.editBadge}>
      <div className="grid gap-3 text-sm">
        <select
          className="w-full rounded-2xl border border-white/20 bg-transparent px-3 py-2"
          value={selectedId}
          onChange={(e) => {
            const value = e.target.value;
            setSelectedId(value);
            const user = users.find((u) => u.id === value);
            if (user) {
              setActive(user.active);
              if (user.memberships?.[0]?.roleId) setRoleId(user.memberships[0].roleId || "");
            }
          }}
        >
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.email})
            </option>
          ))}
        </select>
        <select
          className="w-full rounded-2xl border border-white/20 bg-transparent px-3 py-2"
          value={roleId}
          onChange={(e) => setRoleId(e.target.value)}
        >
          {roleOptions.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-xs uppercase tracking-widest text-current/70">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
          {dict.forms.userActive ?? "Activo"}
        </label>
        <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={update}
          disabled={isPending || !selectedId}
          className="flex-1 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-4 py-3 text-sm font-semibold text-slate-900 disabled:opacity-50"
        >
          {isPending ? dict.forms.saving : dict.forms.update}
        </button>
          <button
            type="button"
            onClick={remove}
            disabled={isPending || !selectedId}
            className="rounded-2xl border border-white/20 px-4 py-3 text-sm font-semibold"
          >
            {dict.forms.delete}
          </button>
        </div>
        {status ? <p className="text-xs text-current/70">{status}</p> : null}
      </div>
    </Card>
  );
};
