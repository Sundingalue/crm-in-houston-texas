"use client";

import { useEffect, useState, useTransition } from "react";
import { Card } from "@/components/ui/Card";
import { useDictionary } from "@/components/providers/LanguageProvider";

type Automation = {
  id: string;
  name: string;
  trigger: string;
  createdAt: string;
};

const templates = [
  { name: "Lead → WhatsApp", trigger: "lead.created" },
  { name: "Deal en riesgo → Slack", trigger: "deal.stalled" },
  { name: "Campaña completada → HubSpot", trigger: "campaign.completed" },
];

export const AutomationStudio = () => {
  const dict = useDictionary();
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [isPending, startTransition] = useTransition();
  const [selection, setSelection] = useState(templates[0]);
  const status = process.env.NEXT_PUBLIC_AUTOMATION_STATUS === "connected" ? dict.automation.connected : dict.automation.disconnected;

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/automations");
      if (!res.ok) return;
      const data = await res.json();
      setAutomations(data);
    };
    load();
  }, []);

  const create = () => {
    startTransition(async () => {
      const res = await fetch("/api/automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: selection.name,
          trigger: selection.trigger,
          actions: { sendTo: "zapier_webhook" },
        }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setAutomations((prev) => [data.automation, ...prev]);
    });
  };

  return (
    <Card subtitle={dict.automation.subtitle} title={dict.automation.title} badge={status}>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3 text-sm">
          <p className="text-xs uppercase tracking-[0.4em] text-current/60">{dict.automation.template}</p>
          <div className="grid gap-2">
            {templates.map((template) => (
              <button
                key={template.trigger}
                type="button"
                onClick={() => setSelection(template)}
                className={`flex items-center justify-between rounded-2xl border px-3 py-2 ${
                  selection.trigger === template.trigger ? "border-emerald-300 bg-emerald-200/10" : "border-white/10"
                }`}
              >
                <span>{template.name}</span>
                <span className="text-xs text-current/60">{template.trigger}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={create}
            disabled={isPending}
            className="w-full rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-3 text-sm font-semibold text-slate-900 disabled:opacity-60"
          >
            {isPending ? dict.automation.creating : dict.automation.create}
          </button>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-current/60">{dict.automation.recent}</p>
          <ul className="mt-4 space-y-3 text-sm">
            {automations.map((item) => (
              <li key={item.id} className="rounded-2xl border border-white/10 p-3">
                <p className="font-semibold">{item.name}</p>
                <p className="text-xs text-current/60">{item.trigger}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
};
