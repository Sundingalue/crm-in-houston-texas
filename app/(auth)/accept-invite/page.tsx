"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

export default function AcceptInvitePage() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") ?? "";
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<string | null>(token ? null : "Falta el token de invitación.");
  const [isPending, startTransition] = useTransition();

  const submit = () => {
    startTransition(async () => {
      setStatus(null);
      if (!token) {
        setStatus("Token inválido.");
        return;
      }
      if (password.length < 6) {
        setStatus("La contraseña debe tener al menos 6 caracteres.");
        return;
      }
      if (password !== confirm) {
        setStatus("Las contraseñas no coinciden.");
        return;
      }
      const res = await fetch("/api/auth/invites/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, name, password }),
      });
      const body = await res.json();
      if (!res.ok) {
        setStatus(body.message ?? "No se pudo aceptar la invitación.");
        return;
      }

      // Set workspace cookie so the user lands in the right company
      if (body.workspaceId) {
        await fetch("/api/workspaces", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workspaceId: body.workspaceId }),
        });
      }

      setStatus("¡Invitación aceptada! Inicia sesión.");
      router.push("/login");
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md">
        <p className="text-xs uppercase tracking-[0.4em] text-white/50">Aurora CRM</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Aceptar invitación</h1>
        <p className="mt-1 text-sm text-white/70">Crea tu acceso para el workspace asignado.</p>
        <div className="mt-6 space-y-3 text-sm text-white/90">
          <div>
            <label className="text-xs uppercase tracking-widest text-white/50">Nombre</label>
            <input
              className="mt-1 w-full rounded-2xl border border-white/15 bg-transparent px-3 py-3"
              placeholder="Tu nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-white/50">Contraseña</label>
            <input
              type="password"
              className="mt-1 w-full rounded-2xl border border-white/15 bg-transparent px-3 py-3"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-white/50">Confirmar contraseña</label>
            <input
              type="password"
              className="mt-1 w-full rounded-2xl border border-white/15 bg-transparent px-3 py-3"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={submit}
            disabled={isPending || !token}
            className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400 px-4 py-3 text-sm font-semibold text-slate-900 disabled:opacity-50"
          >
            {isPending ? "Procesando..." : "Aceptar invitación"}
          </button>
          {status ? <p className="text-xs text-amber-200">{status}</p> : null}
        </div>
        <p className="mt-4 text-xs text-white/50">
          Al continuar aceptas el enlace generado por tu administrador. Si no reconoces este dominio, contáctalo antes de seguir.
        </p>
      </div>
    </div>
  );
}
