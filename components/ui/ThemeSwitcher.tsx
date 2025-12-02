"use client";

import { ThemeMode } from "@/lib/hooks/useThemeMode";

type Props = {
  active: ThemeMode;
  onChange: (mode: ThemeMode) => void;
  className?: string;
  variant?: "light" | "dark";
};

const options: { id: ThemeMode; label: string }[] = [
  { id: "claro", label: "Claro" },
  { id: "oscuro", label: "Oscuro" },
  { id: "combinado", label: "Combinado" },
];

export const ThemeSwitcher = ({ active, onChange, className = "", variant = "dark" }: Props) => {
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
    <div className={`flex items-center gap-2 rounded-full p-1 text-xs font-semibold ${baseStyles} ${className}`}>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={`rounded-full px-3 py-1 transition ${
            active === option.id ? activeStyles : inactiveStyles
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};
