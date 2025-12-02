"use client";

import { Card } from "@/components/ui/Card";
import { useDictionary } from "@/components/providers/LanguageProvider";

type DealItem = {
  id: string;
  name: string;
  stage: string;
  value: number;
  closeDate?: string | null;
  account?: string | null;
};

const currency = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export const DealsTable = ({ deals }: { deals: DealItem[] }) => {
  const dict = useDictionary();
  return (
    <Card subtitle={dict.modules.deals.title} title={dict.modules.deals.description}>
      <div className="overflow-x-auto text-sm">
        <table className="min-w-full">
          <thead className="text-left text-xs uppercase tracking-widest text-current/60">
            <tr>
              <th className="pb-3 pr-4">{dict.navigation.deals}</th>
              <th className="pb-3 pr-4">Etapa</th>
              <th className="pb-3 pr-4">Valor</th>
              <th className="pb-3">Cierre</th>
            </tr>
          </thead>
          <tbody>
            {deals.map((deal) => (
              <tr key={deal.id} className="border-t border-white/10">
                <td className="py-3 pr-4">
                  <p className="font-semibold">{deal.name}</p>
                  <p className="text-xs text-current/70">{deal.account ?? "—"}</p>
                </td>
                <td className="py-3 pr-4">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-widest text-current/70">
                    {deal.stage}
                  </span>
                </td>
                <td className="py-3 pr-4">{currency.format(deal.value)}</td>
                <td className="py-3">{deal.closeDate ? new Date(deal.closeDate).toLocaleDateString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
