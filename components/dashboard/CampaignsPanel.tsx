"use client";

import { Card } from "@/components/ui/Card";
import { useDictionary } from "@/components/providers/LanguageProvider";
import { themeTokens } from "@/lib/utils/theme";
import { useThemeSettings } from "@/components/providers/ThemeProvider";

type Campaign = {
  id: string;
  name: string;
  status: string;
  channel: string;
  subject: string;
  sent: number;
  opened: number;
  clicked: number;
};

type Props = {
  campaigns: Campaign[];
};

export const CampaignsPanel = ({ campaigns }: Props) => {
  const dict = useDictionary();
  const { mode } = useThemeSettings();
  const theme = themeTokens[mode];

  return (
    <Card subtitle={dict.modules.campaigns.title} title={dict.modules.campaigns.description}>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/15 p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-current/60">Email Campaigns</p>
          <p className="mt-3 text-lg font-semibold">{dict.campaigns.emailEditor.title}</p>
          <div className="mt-4 space-y-3 text-sm">
            <label className="block">
              {dict.campaigns.emailEditor.subject}
              <input
                className="mt-1 w-full rounded-2xl border border-white/20 bg-transparent px-3 py-2 text-sm"
                placeholder="Re: Activa tu copiloto de ventas"
              />
            </label>
            <label className="block">
              {dict.campaigns.emailEditor.segment}
              <select className="mt-1 w-full rounded-2xl border border-white/20 bg-transparent px-3 py-2 text-sm">
                <option>Leads · MQL + Industria SaaS</option>
                <option>Clientes · Renovaciones Q2</option>
              </select>
            </label>
            <label className="block">
              {dict.campaigns.emailEditor.body}
              <textarea
                className="mt-1 w-full rounded-2xl border border-white/20 bg-transparent px-3 py-3 text-sm"
                rows={4}
                placeholder="Hola {{nombre}}, te comparto los insights..."
              />
            </label>
            <button
              type="button"
              className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 px-4 py-3 text-sm font-semibold text-white"
            >
              {dict.campaigns.emailEditor.cta}
            </button>
            <p className={`text-xs ${theme.subtle}`}>Configura SendGrid/Mailgun en lib/config/platform.ts.</p>
          </div>
        </div>
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="rounded-2xl border border-white/10 p-4 text-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-widest text-current/60">{campaign.channel}</p>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs">{campaign.status}</span>
              </div>
              <p className="mt-2 text-lg font-semibold">{campaign.name}</p>
              <p className={`text-sm ${theme.subtle}`}>{campaign.subject}</p>
              <p className="text-sm text-current/80">
                {campaign.sent} sent · {campaign.opened} opened · {campaign.clicked} clicked
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  className="rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-widest text-current/70"
                  type="button"
                >
                  {dict.campaigns.cards.detail}
                </button>
                <button
                  className="rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-widest text-current/70"
                  type="button"
                >
                  {dict.campaigns.cards.history}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
