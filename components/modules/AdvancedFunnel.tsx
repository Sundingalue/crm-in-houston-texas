"use client";

import { Card } from "@/components/ui/Card";
import { useDictionary } from "@/components/providers/LanguageProvider";

type Stage = {
  name: string;
  conversion: number;
  value: number;
  velocityDays: number;
};

type Props = {
  stages: Stage[];
};

export const AdvancedFunnel = ({ stages }: Props) => {
  const dict = useDictionary();

  return (
    <Card subtitle={dict.funnel.subtitle} title={dict.funnel.title} badge="Pro">
      <div className="space-y-4">
        {stages.map((stage) => (
          <div key={stage.name} className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between text-sm font-semibold">
              <span>{stage.name}</span>
              <span>{stage.conversion}%</span>
            </div>
            <div className="relative h-3 rounded-full bg-white/10">
              <div
                className="absolute left-0 top-0 h-3 rounded-full bg-gradient-to-r from-indigo-400 to-emerald-400"
                style={{ width: `${Math.min(stage.conversion, 100)}%` }}
              />
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-white/70">
              <span>
                {dict.funnel.value}: €{stage.value.toLocaleString()}
              </span>
              <span>
                {dict.funnel.velocity}: {stage.velocityDays}d
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
