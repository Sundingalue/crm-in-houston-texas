"use client";

import { Card } from "@/components/ui/Card";
import { themeTokens } from "@/lib/utils/theme";
import { useThemeSettings } from "@/components/providers/ThemeProvider";
import { useDictionary } from "@/components/providers/LanguageProvider";

type Stat = { label: string; value: string; trend: string };
type Performance = { label: string; value: number };
type Source = { canal: string; porcentaje: string };

type Props = {
  stats: Stat[];
  performance: Performance[];
  sources: Source[];
};

export const AnalyticsOverview = ({ stats, performance, sources }: Props) => {
  const { mode } = useThemeSettings();
  const theme = themeTokens[mode];
  const dict = useDictionary();

  return (
    <Card subtitle={dict.modules.dashboard.title} title={dict.modules.dashboard.description}>
      <div className="grid gap-5 lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.label} className="rounded-2xl bg-white/5 p-4">
            <p className="text-xs uppercase tracking-widest text-current/60">{item.label}</p>
            <p className="mt-2 text-3xl font-semibold">{item.value}</p>
            <p className={`text-sm ${theme.subtle}`}>{item.trend}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-current/60">{dict.modules.marketing.title}</p>
          <div className="mt-4 space-y-4">
            {performance.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-sm">
                  <p>{item.label}</p>
                  <span className={theme.subtle}>{item.value}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${theme.accent}`}
                    style={{ width: `${Math.min(item.value, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 p-5">
          <p className="text-sm uppercase tracking-[0.3em] text-current/60">Lead sources</p>
          <ul className="mt-4 space-y-3 text-sm">
            {sources.map((item) => (
              <li key={item.canal} className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                <div>
                  <p className="font-medium">{item.canal}</p>
                </div>
                <span className="text-current/70">{item.porcentaje}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
};
