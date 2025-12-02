"use client";

import { useEffect, useState, useTransition } from "react";
import { Card } from "@/components/ui/Card";

type Permission = { module: string; action: string };
type Role = { id: string; name: string; description?: string | null; permissions: Permission[] };

const MODULES = ["leads", "contacts", "accounts", "deals", "campaigns", "messaging", "calls", "ai", "automations", "settings"];
const ACTIONS = ["view", "create", "edit", "delete"];

export function RoleManager() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [form, setForm] = useState<{ id?: string; name: string; description: string; permissions: Record<string, Set<string>> }>({ name: "", description: "", permissions: {} });
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [userPerms, setUserPerms] = useState<Array<{ userId: string; module: string; action: string; userName: string }>>([]);
  const [assign, setAssign] = useState<{ userId: string; module: string; action: string }>({ userId: "", module: "", action: "" });
  const [users, setUsers] = useState<Array<{ id: string; name: string }>>([]);

  const load = async () => {
    const [resRoles, resPerms, resUsers] = await Promise.all([fetch("/api/roles"), fetch("/api/auth/permissions"), fetch("/api/auth/users")]);
    if (resRoles.ok) {
      const data: Role[] = await resRoles.json();
      setRoles(data);
    }
    if (resPerms.ok) {
      const data = await resPerms.json();
      const flattened = (data.userPerms as Array<{ permissions: Array<{ module: string; action: string }>; user: { id: string; name: string } }>).flatMap(
        (u) => u.permissions.map((p) => ({ userId: u.user.id, module: p.module, action: p.action, userName: u.user.name })),
      );
      setUserPerms(flattened);
    }
    if (resUsers.ok) {
      const data = await resUsers.json();
      setUsers(
        data.map((u: { id: string; name: string; email: string }) => ({
          id: u.id,
          name: u.name ?? u.email ?? u.id,
        })),
      );
    }
  };

  useEffect(() => {
    const run = async () => load();
    run();
  }, []);

  const togglePermission = (module: string, action: string) => {
    setForm((prev) => {
      const next = { ...prev.permissions };
      const set = new Set(next[module] ?? []);
      if (set.has(action)) {
        set.delete(action);
      } else {
        set.add(action);
      }
      next[module] = set;
      return { ...prev, permissions: next };
    });
  };

  const submit = () => {
    startTransition(async () => {
      setStatus(null);
      const permissions: Permission[] = MODULES.flatMap((module) => Array.from(form.permissions[module] ?? []).map((action) => ({ module, action })));
      const res = await fetch("/api/roles", {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: form.id, name: form.name, description: form.description, permissions }),
      });
      const body = await res.json();
      setStatus(body.message ?? (res.ok ? "Saved" : "Error"));
      if (res.ok) {
        setForm({ name: "", description: "", permissions: {} });
        load();
      }
    });
  };

  const edit = (role: Role) => {
    const permissions: Record<string, Set<string>> = {};
    role.permissions.forEach((p) => {
      permissions[p.module] = permissions[p.module] ?? new Set();
      permissions[p.module].add(p.action);
    });
    setForm({ id: role.id, name: role.name, description: role.description ?? "", permissions });
  };

  const remove = (id: string) => {
    startTransition(async () => {
      setStatus(null);
      const res = await fetch(`/api/roles?id=${id}`, { method: "DELETE" });
      const body = await res.json();
      setStatus(body.message ?? (res.ok ? "Deleted" : "Error"));
      if (res.ok) load();
    });
  };

  const assignPerm = () => {
    startTransition(async () => {
      setStatus(null);
      if (!assign.userId || !assign.module || !assign.action) {
        setStatus("Selecciona usuario, módulo y acción");
        return;
      }
      const res = await fetch("/api/auth/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assign),
      });
      const body = await res.json();
      setStatus(body.message ?? (res.ok ? "Permiso asignado" : "Error"));
      if (res.ok) {
        setAssign({ userId: "", module: "", action: "" });
        load();
      }
    });
  };

  return (
    <Card title="Roles y permisos" subtitle="Define quién puede ver/crear/editar/eliminar" badge="Seguridad">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 text-sm">
          <input
            className="w-full rounded-2xl border border-white/15 bg-transparent px-3 py-2"
            placeholder="Role name (owner/admin/seller)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="w-full rounded-2xl border border-white/15 bg-transparent px-3 py-2"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="space-y-2">
            {MODULES.map((mod) => (
              <div key={mod} className="rounded-xl border border-white/10 p-2">
                <p className="text-xs uppercase tracking-[0.3em] text-current/60">{mod}</p>
                <div className="flex flex-wrap gap-2 pt-2 text-xs">
                  {ACTIONS.map((act) => {
                    const active = form.permissions[mod]?.has(act) ?? false;
                    return (
                      <button
                        key={act}
                        type="button"
                        onClick={() => togglePermission(mod, act)}
                        className={`rounded-full border px-3 py-1 ${active ? "border-emerald-300 bg-emerald-200/10" : "border-white/15"}`}
                      >
                        {act}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={submit}
              disabled={isPending || !form.name}
              className="flex-1 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-4 py-3 text-sm font-semibold text-slate-900 disabled:opacity-50"
            >
              {isPending ? "Saving..." : form.id ? "Update role" : "Create role"}
            </button>
            {form.id ? (
              <button
                type="button"
                onClick={() => setForm({ name: "", description: "", permissions: {} })}
                className="rounded-2xl border border-white/20 px-4 py-3 text-sm font-semibold"
              >
                Clear
              </button>
            ) : null}
          </div>
          {status ? <p className="text-xs text-current/70">{status}</p> : null}
        </div>
        <div className="space-y-3 text-sm">
          {roles.map((role) => (
            <div key={role.id} className="rounded-2xl border border-white/15 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-current/60">{role.id.slice(0, 6)}…</p>
                  <p className="text-lg font-semibold">{role.name}</p>
                  <p className="text-xs text-current/70">{role.description ?? ""}</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" className="rounded-xl border border-white/20 px-3 py-1 text-xs" onClick={() => edit(role)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="rounded-xl border border-rose-400/50 px-3 py-1 text-xs text-rose-200"
                    onClick={() => remove(role.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1 text-[11px] text-current/70">
                {role.permissions.map((p) => (
                  <span key={`${p.module}-${p.action}`} className="rounded-full border border-white/10 px-2 py-1">
                    {p.module}:{p.action}
                  </span>
                ))}
              </div>
            </div>
          ))}
          {roles.length === 0 ? <p className="text-xs text-current/60">No roles yet.</p> : null}
        </div>
        <div className="space-y-3 text-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-current/60">Permisos directos por usuario</p>
          {userPerms.length === 0 ? <p className="text-xs text-current/60">Ninguno. Usa roles o asigna en la API /api/auth/permissions.</p> : null}
          {userPerms.map((p) => (
            <div key={`${p.userId}-${p.module}-${p.action}`} className="rounded-2xl border border-white/10 p-3">
              <p className="text-sm font-semibold">{p.userName}</p>
              <p className="text-xs text-current/60">
                {p.module}:{p.action}
              </p>
            </div>
          ))}
          <div className="rounded-2xl border border-white/10 p-3">
            <p className="text-xs uppercase tracking-[0.3em] text-current/60">Asignar permiso directo</p>
            <select
              className="mt-2 w-full rounded-2xl border border-white/15 bg-transparent px-3 py-2 text-sm"
              value={assign.userId}
              onChange={(e) => setAssign({ ...assign, userId: e.target.value })}
            >
              <option value="">Selecciona usuario</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
            <select
              className="mt-2 w-full rounded-2xl border border-white/15 bg-transparent px-3 py-2 text-sm"
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
              className="mt-2 w-full rounded-2xl border border-white/15 bg-transparent px-3 py-2 text-sm"
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
            <button
              type="button"
              onClick={assignPerm}
              disabled={isPending || !assign.userId || !assign.module || !assign.action}
              className="mt-3 w-full rounded-2xl bg-gradient-to-r from-amber-400 to-emerald-400 px-4 py-2 text-xs font-semibold text-slate-900 disabled:opacity-50"
            >
              {isPending ? "Asignando..." : "Asignar permiso"}
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
