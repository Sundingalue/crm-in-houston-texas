"use client";

import { useEffect, useState, useTransition } from "react";
import { Card } from "@/components/ui/Card";

type Perm = { module: string; action: string };
type UserRow = { id: string; name: string; email: string };

const MODULES = ["leads", "contacts", "accounts", "deals", "campaigns", "messaging", "calls", "ai", "automations", "settings"];
const ACTIONS = ["view", "create", "edit", "delete"];

export function UserPermissionDrawer() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [assign, setAssign] = useState<{ module: string; action: string }>({ module: "", action: "" });
  const [currentPerms, setCurrentPerms] = useState<Perm[]>([]);

  useEffect(() => {
    const load = async () => {
      const resUsers = await fetch("/api/auth/users");
      if (resUsers.ok) {
        const data = await resUsers.json();
        setUsers(
          data.map((u: { id: string; name: string; email: string }) => ({
            id: u.id,
            name: u.name ?? u.email ?? u.id,
            email: u.email,
          })),
        );
      }
      const resPerms = await fetch("/api/auth/permissions");
      if (resPerms.ok) {
        const data = await resPerms.json();
        type UserPermRow = { permissions: Perm[]; user: { id: string } };
        const flattened = (data.userPerms as UserPermRow[]).flatMap((u) =>
          u.permissions.map((p) => ({ ...p, userId: u.user.id })),
        );
        if (selectedUser) {
          setCurrentPerms(flattened.filter((p) => p.userId === selectedUser));
        }
      }
    };
    load().catch(() => {});
  }, [selectedUser]);

  const assignPerm = () => {
    startTransition(async () => {
      setStatus(null);
      if (!selectedUser || !assign.module || !assign.action) {
        setStatus("Selecciona usuario, módulo y acción");
        return;
      }
      const res = await fetch("/api/auth/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUser, module: assign.module, action: assign.action }),
      });
      const body = await res.json();
      setStatus(body.message ?? (res.ok ? "Asignado" : "Error"));
      if (res.ok) setCurrentPerms((prev) => [...prev, { module: assign.module, action: assign.action }]);
    });
  };

  return (
    <Card title="Permisos rápidos" subtitle="Asigna permisos directos sin editar roles">
      <div className="grid gap-3 text-sm">
        <select
          className="rounded-2xl border border-white/15 bg-transparent px-3 py-2"
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
        >
          <option value="">Selecciona usuario</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.email})
            </option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-2">
          <select
            className="rounded-2xl border border-white/15 bg-transparent px-3 py-2"
            value={assign.module}
            onChange={(e) => setAssign({ ...assign, module: e.target.value })}
          >
            <option value="">Módulo</option>
            {MODULES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <select
            className="rounded-2xl border border-white/15 bg-transparent px-3 py-2"
            value={assign.action}
            onChange={(e) => setAssign({ ...assign, action: e.target.value })}
          >
            <option value="">Acción</option>
            {ACTIONS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={assignPerm}
          disabled={isPending || !selectedUser || !assign.module || !assign.action}
          className="rounded-2xl bg-gradient-to-r from-amber-400 to-emerald-400 px-4 py-2 text-xs font-semibold text-slate-900 disabled:opacity-50"
        >
          {isPending ? "Asignando..." : "Asignar"}
        </button>
        {status ? <p className="text-xs text-current/70">{status}</p> : null}
        {selectedUser && (
          <div className="rounded-2xl border border-white/10 p-3 text-xs">
            <p className="text-[11px] uppercase tracking-[0.3em] text-current/60">Permisos actuales</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {currentPerms.map((p) => (
                <span key={`${p.module}-${p.action}`} className="rounded-full border border-white/10 px-2 py-1">
                  {p.module}:{p.action}
                </span>
              ))}
              {currentPerms.length === 0 ? <span className="text-current/60">Sin permisos directos.</span> : null}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
