"use client";

import { Card } from "@/components/ui/Card";
import { useThemeSettings } from "@/components/providers/ThemeProvider";
import { themeTokens } from "@/lib/utils/theme";
import { useDictionary } from "@/components/providers/LanguageProvider";

type Column = {
  name: string;
  deals: number;
  value: number;
  note?: string;
};

type Props = {
  columns: Column[];
};

const formatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export const PipelineBoard = ({ columns }: Props) => {
  const { mode } = useThemeSettings();
  const theme = themeTokens[mode];
  const dict = useDictionary();

  return (
    <Card subtitle="Pipeline" title={dict.modules.deals.title} badge="IA scoring">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {columns.map((column) => (
          <div key={column.name} className="rounded-2xl bg-white/5 p-4">
            <p className="text-xs uppercase tracking-widest text-current/60">{column.name}</p>
            <p className="mt-3 text-3xl font-semibold">{column.deals}</p>
            <p className={`text-sm ${theme.subtle}`}>{formatter.format(column.value)}</p>
            {column.note ? <p className="mt-4 text-sm text-current/80">{column.note}</p> : null}
            <button
              type="button"
              className="mt-4 w-full rounded-xl border border-white/15 px-3 py-2 text-xs uppercase tracking-widest text-current/70"
            >
              Ver tarjetas
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
};
