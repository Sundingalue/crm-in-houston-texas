import type { ThemeMode } from "../hooks/useThemeMode";

export const themeTokens: Record<
  ThemeMode,
  {
    page: string;
    card: string;
    accent: string;
    subtle: string;
    sidebar: string;
  }
> = {
  claro: {
    page:
      "bg-gradient-to-br from-stone-50 via-white to-slate-50 text-slate-900",
    card: "bg-white/90 border border-slate-100 shadow-[0_25px_70px_rgba(15,23,42,0.08)]",
    accent: "from-orange-500 to-rose-500 text-white",
    subtle: "text-slate-500",
    sidebar: "bg-white/70 border border-slate-100",
  },
  oscuro: {
    page:
      "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100",
    card: "bg-slate-900/70 border border-slate-800 shadow-[0_35px_80px_rgba(0,0,0,0.55)]",
    accent: "from-blue-500 to-cyan-400 text-white",
    subtle: "text-slate-400",
    sidebar: "bg-slate-900/80 border border-slate-800",
  },
  combinado: {
    page:
      "bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.25),_rgba(2,6,23,0.95)_55%)] text-slate-100",
    card: "bg-white/10 backdrop-blur-xl border border-white/15 shadow-[0_35px_120px_rgba(15,23,42,0.45)]",
    accent: "from-fuchsia-500 via-cyan-400 to-lime-300 text-slate-900",
    subtle: "text-slate-300",
    sidebar: "bg-slate-950/60 border border-white/10",
  },
};
