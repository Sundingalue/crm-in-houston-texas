"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useThemeSettings } from "@/components/providers/ThemeProvider";
import { useDictionary } from "@/components/providers/LanguageProvider";

type Mode = "login" | "register";

type Props = {
  mode: Mode;
};

const palettes = {
  claro: {
    page: "bg-gradient-to-b from-[#fbfaf6] to-[#eef2ff]",
    primary: "text-slate-900",
    secondary: "text-slate-600",
    card: "bg-white/95 border border-slate-200 text-slate-900",
    panel: "bg-white/90 border border-slate-200",
    input: "border-slate-200 bg-white text-slate-900 placeholder:text-slate-500 focus:ring-slate-900/20",
    subtle: "text-slate-500",
    bullet: "bg-emerald-500",
  },
  oscuro: {
    page: "bg-[#05070f]",
    primary: "text-white",
    secondary: "text-white/70",
    card: "bg-white/5 border border-white/15 text-white",
    panel: "bg-slate-950/70 border border-white/15",
    input: "border-white/20 bg-white/5 text-white placeholder:text-white/40 focus:ring-emerald-400/60",
    subtle: "text-white/60",
    bullet: "bg-emerald-400",
  },
  combinado: {
    page: "bg-[#070b16]",
    primary: "text-white",
    secondary: "text-white/70",
    card: "bg-white/5 border border-white/10 text-white",
    panel: "bg-slate-950/60 border border-white/15",
    input: "border-white/15 bg-white/5 text-white placeholder:text-white/40 focus:ring-emerald-400/60",
    subtle: "text-white/60",
    bullet: "bg-emerald-400",
  },
} as const;

export const AuthScreen = ({ mode }: Props) => {
  const dict = useDictionary();
  const { mode: themeMode, setMode } = useThemeSettings();
  const palette = palettes[themeMode];
  const router = useRouter();
  const isLogin = mode === "login";
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    workspace: "",
    domain: "",
  });

  const handleChange = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      if (isLogin) {
        const result = await signIn("credentials", {
          email: form.email,
          password: form.password,
          redirect: false,
        });
        if (result?.error) {
          setStatus(dict.errors.invalidCredentials);
        } else {
          router.replace("/dashboard");
        }
      } else {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workspace: form.workspace,
            domain: form.domain,
            email: form.email,
            password: form.password,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({ code: "GENERIC" }));
          if (data.code === "EMAIL_EXISTS") {
            setStatus(dict.errors.workspaceExists);
          } else {
            setStatus(dict.errors.default);
          }
          return;
        }
        const result = await signIn("credentials", {
          email: form.email,
          password: form.password,
          redirect: false,
        });
        if (result?.error) {
          setStatus(dict.errors.default);
        } else {
          router.replace("/dashboard");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-theme={themeMode} className={`min-h-screen px-4 py-10 transition-colors sm:px-8 ${palette.page}`}>
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="flex items-center justify-between">
          <p className={`text-sm font-semibold tracking-[0.6em] ${palette.secondary}`}>{dict.common.appName}</p>
          <div className="flex flex-wrap items-center gap-2">
            <ThemeSwitcher variant={themeMode === "claro" ? "light" : "dark"} active={themeMode} onChange={setMode} />
            <LanguageSwitcher variant={themeMode === "claro" ? "light" : "dark"} />
          </div>
        </header>
        <div className={`grid gap-10 rounded-[36px] p-10 shadow-[0_55px_120px_rgba(15,23,42,0.35)] backdrop-blur-2xl md:grid-cols-2 ${palette.card}`}>
          <div className="flex flex-col justify-between gap-10">
            <div className="space-y-4">
              <p className={`text-sm uppercase tracking-[0.45em] ${palette.secondary}`}>{dict.common.appName}</p>
              <h1 className={`text-4xl font-semibold leading-tight ${palette.primary}`}>{dict.auth.headline}</h1>
              <p className={`text-base ${palette.secondary}`}>{dict.auth.subheadline}</p>
            </div>
            <ul className={`space-y-4 text-sm ${palette.secondary}`}>
              {dict.common.featurePills.map((pill) => (
                <li key={pill} className="flex items-center gap-3">
                  <span className={`h-2.5 w-2.5 rounded-full ${palette.bullet}`} />
                  {pill}
                </li>
              ))}
            </ul>
          </div>
          <form
            onSubmit={handleSubmit}
            className={`rounded-[28px] p-8 shadow-[0_35px_60px_rgba(2,6,23,0.45)] ${palette.panel}`}
          >
            <div className="space-y-2">
              <p className={`text-lg font-semibold ${palette.primary}`}>{isLogin ? dict.auth.login : dict.auth.register}</p>
              <p className={`text-xs uppercase tracking-[0.4em] ${palette.subtle}`}>{dict.common.suite}</p>
            </div>
            <div className="mt-6 space-y-5 text-sm">
              {!isLogin && (
                <>
                  <label className={`block text-xs font-semibold uppercase tracking-widest ${palette.subtle}`}>
                    {dict.auth.form.workspace}
                    <input
                      className={`mt-2 w-full rounded-2xl px-4 py-3 text-base focus:outline-none focus:ring-2 ${palette.input}`}
                      value={form.workspace}
                      onChange={handleChange("workspace")}
                      required
                    />
                  </label>
                  <label className={`block text-xs font-semibold uppercase tracking-widest ${palette.subtle}`}>
                    {dict.auth.form.domain}
                    <input
                      className={`mt-2 w-full rounded-2xl px-4 py-3 text-base focus:outline-none focus:ring-2 ${palette.input}`}
                      placeholder="ventas.empresa.com"
                      value={form.domain}
                      onChange={handleChange("domain")}
                      required
                    />
                  </label>
                </>
              )}
              <label className={`block text-xs font-semibold uppercase tracking-widest ${palette.subtle}`}>
                {dict.auth.form.email}
                <input
                  className={`mt-2 w-full rounded-2xl px-4 py-3 text-base focus:outline-none focus:ring-2 ${palette.input}`}
                  type="email"
                  value={form.email}
                  onChange={handleChange("email")}
                  required
                />
              </label>
              <label className={`block text-xs font-semibold uppercase tracking-widest ${palette.subtle}`}>
                {dict.auth.form.password}
                <input
                  className={`mt-2 w-full rounded-2xl px-4 py-3 text-base focus:outline-none focus:ring-2 ${palette.input}`}
                  type="password"
                  value={form.password}
                  onChange={handleChange("password")}
                  required
                  minLength={8}
                />
              </label>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-gradient-to-r from-orange-500 via-rose-500 to-fuchsia-500 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:opacity-90 disabled:opacity-60"
              >
                {loading ? "Procesando..." : isLogin ? dict.auth.form.ctaLogin : dict.auth.form.ctaRegister}
              </button>
              {status ? (
                <div className="flex items-center gap-2 rounded-2xl border border-rose-500/60 bg-rose-500/15 px-4 py-3 text-sm font-medium text-rose-100">
                  <span className="h-2 w-2 rounded-full bg-rose-400" />
                  <p>{status}</p>
                </div>
              ) : null}
              <p className={`text-xs ${palette.subtle}`}>
                {dict.auth.form.alt}{" "}
                {isLogin ? (
                  <a className="font-semibold text-white" href="/register">
                    {dict.auth.form.altLinkRegister}
                  </a>
                ) : (
                  <a className="font-semibold text-white" href="/login">
                    {dict.auth.form.altLinkLogin}
                  </a>
                )}
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
