"use client";

import { useEffect, useState, useTransition } from "react";
import { Card } from "@/components/ui/Card";

type Role = { id: string; name: string };
type Invite = { email: string; token: string; expiresAt: string; accepted: boolean; inviteUrl?: string };

export function InviteLinkCard() {
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("");
  const [roles, setRoles] = useState<Role[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [list, setList] = useState<Invite[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const load = async () => {
      const [rolesRes, invitesRes] = await Promise.all([fetch("/api/roles"), fetch("/api/auth/invites")]);
      if (rolesRes.ok) setRoles(await rolesRes.json());
      if (invitesRes.ok) setList(await invitesRes.json());
    };
    load().catch(() => {});
  }, []);

  const submit = () => {
    startTransition(async () => {
      setStatus(null);
      setInviteUrl(null);
      const res = await fetch("/api/auth/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, roleId }),
      });
      const body = await res.json();
      if (!res.ok) {
        setStatus(body.message ?? "Error");
        return;
      }
      setStatus("Invitación creada");
      setInviteUrl(body.inviteUrl);
      setList((prev) => [body.invite, ...prev]);
      setEmail("");
      setRoleId("");
    });
  };

  const revoke = (token: string) => {
    startTransition(async () => {
      const res = await fetch(`/api/auth/invites?token=${token}`, { method: "DELETE" });
      const body = await res.json();
      setStatus(body.message ?? (res.ok ? "Revocada" : "Error"));
      if (res.ok) setList((prev) => prev.filter((i) => i.token !== token));
    });
  };

  return (
    <Card title="Invitaciones por dominio" subtitle="Genera enlaces para que los invitados entren al workspace correcto">
      <div className="space-y-3 text-sm">
        <input
          className="w-full rounded-2xl border border-white/15 bg-transparent px-3 py-2"
          placeholder="email@cliente.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <select className="w-full rounded-2xl border border-white/15 bg-transparent px-3 py-2" value={roleId} onChange={(e) => setRoleId(e.target.value)}>
          <option value="">Rol (opcional)</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={submit}
          disabled={isPending || !email}
          className="rounded-2xl bg-gradient-to-r from-indigo-400 to-cyan-400 px-4 py-3 text-sm font-semibold text-slate-900 disabled:opacity-50"
        >
          {isPending ? "Creando..." : "Generar enlace"}
        </button>
        {status ? <p className="text-xs text-current/70">{status}</p> : null}
        {inviteUrl ? (
          <div className="rounded-2xl border border-emerald-200/40 bg-emerald-500/10 px-3 py-2 text-xs">
            <p className="font-semibold">Enlace de invitación</p>
            <p className="break-all text-current/80">{inviteUrl}</p>
          </div>
        ) : null}
      </div>
      <div className="mt-4 space-y-2 text-xs">
        {list.map((inv) => (
          <div key={inv.token} className="flex items-center justify-between rounded-2xl border border-white/10 px-3 py-2">
            <div>
              <p className="font-semibold">{inv.email}</p>
              <p className="text-current/60">Expira: {new Date(inv.expiresAt).toLocaleString()}</p>
              <p className="text-current/60">Estado: {inv.accepted ? "Aceptada" : "Pendiente"}</p>
            </div>
            {!inv.accepted ? (
              <button type="button" onClick={() => revoke(inv.token)} className="rounded-full border border-white/20 px-3 py-1">
                Revocar
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </Card>
  );
}
