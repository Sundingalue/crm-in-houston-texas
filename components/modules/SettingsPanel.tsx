"use client";

import { Card } from "@/components/ui/Card";
import { useDictionary } from "@/components/providers/LanguageProvider";

type EnvVar = {
  key: string;
  description: string;
};

export const SettingsPanel = ({ envs }: { envs: EnvVar[] }) => {
  const dict = useDictionary();
  return (
    <Card subtitle={dict.modules.settings.title} title={dict.modules.settings.description}>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/15 p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-current/60">{dict.settings.domainCardTitle}</p>
          <p className="mt-2 text-sm text-current/80">{dict.settings.domainCardDescription}</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>• Multi-dominio / SSL automático</li>
            <li>• Logos y paletas por workspace</li>
            <li>• Portales white-label</li>
          </ul>
          <button className="mt-4 rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-widest" type="button">
            Configurar branding
          </button>
        </div>
        <div className="rounded-2xl border border-white/15 p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-current/60">{dict.settings.envTitle}</p>
          <ul className="mt-4 space-y-3 text-sm">
            {envs.map((env) => (
              <li key={env.key} className="rounded-2xl bg-white/5 px-3 py-2">
                <p className="font-semibold">{env.key}</p>
                <p className="text-xs text-current/70">{env.description}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-emerald-300/30 bg-emerald-500/5 p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-current/60">Invitaciones</p>
          <p className="mt-2 text-sm text-current/80">Genera enlaces por workspace y comparte el dominio correcto.</p>
          <ul className="mt-4 space-y-2 text-sm text-current/80">
            <li>1. Crea el workspace con su dominio.</li>
            <li>2. Genera el link de invitación.</li>
            <li>3. El invitado acepta y se le asigna rol.</li>
          </ul>
          <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-200/50 px-4 py-2 text-xs uppercase tracking-widest">
            Usar tarjeta de Invitaciones abajo
          </span>
        </div>
      </div>
    </Card>
  );
};
