"use client";

import { Card } from "@/components/ui/Card";
import { DomainAccessForm } from "@/components/forms/DomainAccessForm";
import { useDictionary } from "@/components/providers/LanguageProvider";

export const WorkspaceHero = () => {
  const dict = useDictionary();

  return (
    <Card subtitle={dict.common.appName} title={dict.common.suite}>
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <p className="text-base text-current/80">{dict.modules.dashboard.description}</p>
          <ul className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-widest text-current/70">
            {dict.common.featurePills.map((pill) => (
              <li key={pill} className="rounded-full border border-white/15 px-4 py-2">
                {pill}
              </li>
            ))}
          </ul>
        </div>
        <DomainAccessForm />
      </div>
    </Card>
  );
};
