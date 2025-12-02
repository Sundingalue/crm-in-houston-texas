"use client";

import { Card } from "@/components/ui/Card";
import { useDictionary } from "@/components/providers/LanguageProvider";
import { useThemeSettings } from "@/components/providers/ThemeProvider";
import { themeTokens } from "@/lib/utils/theme";

type LeadItem = {
  id: string;
  name: string;
  company: string;
  status: string;
  source: string;
  createdAt: string;
};

type ActivityItem = {
  id: string;
  type: string;
  summary: string;
  createdAt: string;
};

type Props = {
  leads: LeadItem[];
  activities: ActivityItem[];
};

const formatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
});

export const LeadManagement = ({ leads, activities }: Props) => {
  const dict = useDictionary();
  const { mode } = useThemeSettings();
  const theme = themeTokens[mode];

  return (
    <Card subtitle={dict.modules.leads.title} title={dict.modules.leads.description}>
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="flex-1">
          <div className="flex flex-wrap gap-3 text-xs">
            {dict.leads.filters.map((filtro) => (
              <button
                key={filtro}
                className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-widest text-current/70 transition hover:bg-white/10"
                type="button"
              >
                {filtro}
              </button>
            ))}
          </div>
          <div className="mt-5 overflow-x-auto text-sm">
            <table className="min-w-full">
              <thead className="text-left text-xs uppercase tracking-widest text-current/60">
                <tr>
                  <th className="pb-3 pr-4">{dict.leads.table.lead}</th>
                  <th className="pb-3 pr-4">{dict.leads.table.status}</th>
                  <th className="pb-3 pr-4">{dict.leads.table.source}</th>
                  <th className="pb-3">{dict.leads.table.created}</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-t border-white/10 text-base">
                    <td className="py-3 pr-4">
                      <p className="font-semibold">{lead.name}</p>
                      <p className={`text-sm ${theme.subtle}`}>{lead.company}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-widest text-current/80">
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-sm">{lead.source}</td>
                    <td className="py-3 text-sm">{formatter.format(new Date(lead.createdAt))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="w-full rounded-2xl border border-white/10 p-5 lg:max-w-xs">
          <p className="text-xs uppercase tracking-[0.3em] text-current/60">{dict.leads.activities}</p>
          <ul className="mt-4 space-y-4 text-sm">
            {activities.map((activity) => (
              <li key={activity.id} className="rounded-2xl bg-white/5 p-3">
                <p className="text-xs uppercase tracking-widest text-current/50">{activity.type}</p>
                <p className="font-medium">{activity.summary}</p>
                <p className={`text-xs ${theme.subtle}`}>{formatter.format(new Date(activity.createdAt))}</p>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="mt-4 w-full rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900"
          >
            {dict.leads.table.convertCta}
          </button>
        </div>
      </div>
    </Card>
  );
};
