"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDictionary } from "../providers/LanguageProvider";
import { useThemeSettings } from "../providers/ThemeProvider";
import type { AppDictionary } from "@/lib/i18n";
import { useEffect, useState } from "react";

type Props = {
  className?: string;
};

const navItems: Array<{ key: keyof AppDictionary["navigation"]; icon: string; href: string; feature?: "enableCampaigns" | "enableWhatsApp" | "enableCalls" | "enableAi" | "enableAutomations" }> = [
  { key: "dashboard", icon: "📊", href: "/dashboard" },
  { key: "leads", icon: "🧲", href: "/leads" },
  { key: "contacts", icon: "👥", href: "/contacts" },
  { key: "accounts", icon: "🏢", href: "/accounts" },
  { key: "deals", icon: "📈", href: "/deals" },
  { key: "marketing", icon: "📊", href: "/marketing" },
  { key: "campaigns", icon: "✉️", href: "/campaigns", feature: "enableCampaigns" },
  { key: "messaging", icon: "💬", href: "/messaging", feature: "enableWhatsApp" },
  { key: "calls", icon: "📞", href: "/calls", feature: "enableCalls" },
  { key: "ai", icon: "🤖", href: "/ai", feature: "enableAi" },
  { key: "settings", icon: "⚙️", href: "/settings" },
];

export const Sidebar = ({ className = "" }: Props) => {
  const dict = useDictionary();
  const pathname = usePathname();
  const { mode } = useThemeSettings();
  const [features, setFeatures] = useState<{ enableCampaigns?: boolean; enableWhatsApp?: boolean; enableCalls?: boolean; enableAi?: boolean; enableAutomations?: boolean }>({});

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/workspace/current");
      if (!res.ok) return;
      const data = await res.json();
      setFeatures(data || {});
    };
    load();
  }, []);
  const isLight = mode === "claro";
  const activeClasses = isLight ? "bg-slate-900/10 text-slate-900" : "bg-white/15 text-white";
  const baseClasses = isLight ? "text-slate-600" : "text-current/80";
  const hoverClasses = isLight ? "hover:bg-slate-900/5 hover:text-slate-900" : "hover:bg-white/10 hover:text-white";
  const cardBorder = isLight ? "border-slate-200" : "border-white/10";

  return (
    <aside className={`flex w-full flex-col gap-6 rounded-3xl p-5 sm:w-72 ${className}`}>
      <div>
        <p className="text-xs uppercase tracking-[0.6em] text-current/50">{dict.common.appName}</p>
        <h2 className="mt-2 text-2xl font-semibold">{dict.common.suite}</h2>
        <p className="text-sm text-current/70">{dict.common.mutiTenantCard.description}</p>
      </div>
      <nav className="space-y-1 text-sm font-medium">
        {navItems
          .filter((item) => {
            if (!item.feature) return true;
            return features[item.feature] ?? true;
          })
          .map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.key}
                href={item.href}
              className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2 transition ${
                active ? activeClasses : `${baseClasses} ${hoverClasses}`
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{dict.navigation[item.key]}</span>
            </Link>
          );
        })}
      </nav>
      <div className={`rounded-2xl border ${cardBorder} p-4 text-xs ${baseClasses}`}>
        <p className="font-semibold uppercase tracking-widest">{dict.common.mutiTenantCard.title}</p>
        <p className="mt-2">{dict.common.mutiTenantCard.description}</p>
      </div>
    </aside>
  );
};
