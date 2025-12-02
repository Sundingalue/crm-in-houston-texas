"use client";

import type { Locale } from "@/lib/i18n";
import { useLanguage } from "../providers/LanguageProvider";

const options: { id: Locale; label: string }[] = [
  { id: "es", label: "ES" },
  { id: "en", label: "EN" },
];

type Props = {
  className?: string;
  variant?: "light" | "dark";
};

export const LanguageSwitcher = ({ className = "", variant = "dark" }: Props) => {
  const { locale, setLocale } = useLanguage();
  const baseStyles =
    variant === "light"
      ? "bg-slate-900/5 border border-slate-200 text-slate-900"
      : "bg-white/5 border border-white/10 text-white";
  const activeStyles =
    variant === "light" ? "bg-slate-900 text-white" : "bg-white text-slate-900 shadow-sm";
  const inactiveStyles =
    variant === "light"
      ? "text-slate-700 hover:bg-slate-900/10"
      : "text-white/70 hover:bg-white/10";

  return (
    <div className={`flex items-center gap-1 rounded-full p-1 text-xs font-semibold ${baseStyles} ${className}`}>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => setLocale(option.id)}
          className={`rounded-full px-2 py-1 transition ${
            locale === option.id ? activeStyles : inactiveStyles
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};
