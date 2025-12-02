"use client";

import { Card } from "@/components/ui/Card";
import { useDictionary } from "@/components/providers/LanguageProvider";

type AccountItem = {
  id: string;
  name: string;
  industry?: string | null;
  size: string;
  contacts: number;
  deals: number;
};

type Props = {
  accounts: AccountItem[];
};

export const AccountsOverview = ({ accounts }: Props) => {
  const dict = useDictionary();
  return (
    <Card subtitle={dict.modules.accounts.title} title={dict.modules.accounts.description}>
      <div className="grid gap-4 md:grid-cols-2">
        {accounts.map((account) => (
          <div key={account.id} className="rounded-2xl border border-white/10 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-semibold">{account.name}</p>
                <p className="text-xs text-current/70">{account.industry ?? "—"}</p>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-widest text-current/70">
                {account.size}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-2xl bg-white/5 px-3 py-2">
                <p className="text-current/60">Contactos</p>
                <p className="text-lg font-semibold">{account.contacts}</p>
              </div>
              <div className="rounded-2xl bg-white/5 px-3 py-2">
                <p className="text-current/60">Deals</p>
                <p className="text-lg font-semibold">{account.deals}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
