"use client";

import { useDictionary } from "@/components/providers/LanguageProvider";
import type { AppDictionary } from "@/lib/i18n";

type ModuleKey = keyof AppDictionary["modules"];

export const PageHeader = ({ moduleKey }: { moduleKey: ModuleKey }) => {
  const dict = useDictionary();
  const moduleCopy = dict.modules[moduleKey];

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <p className="text-xs uppercase tracking-[0.4em] text-current/50">{dict.common.appName}</p>
      <h1 className="mt-2 text-3xl font-semibold">{moduleCopy.title}</h1>
      <p className="mt-2 text-sm text-current/80">{moduleCopy.description}</p>
    </div>
  );
};
