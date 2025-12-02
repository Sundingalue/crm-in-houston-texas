"use client";

import { ThemeSwitcher } from "../ui/ThemeSwitcher";
import { useThemeSettings } from "../providers/ThemeProvider";
import { useDictionary } from "../providers/LanguageProvider";
import { LanguageSwitcher } from "../ui/LanguageSwitcher";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";
import { WorkspaceSwitcher } from "../ui/WorkspaceSwitcher";

type Props = {
  user: Session["user"];
};

export const Topbar = ({ user }: Props) => {
  const { mode, setMode } = useThemeSettings();
  const dict = useDictionary();
  const switcherVariant = mode === "claro" ? "light" : "dark";

  return (
    <header className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-current/80 backdrop-blur-md lg:flex-row lg:items-center lg:gap-6">
      <div className="flex flex-1 items-center gap-3">
        <input
          type="search"
          placeholder={dict.common.searchPlaceholder}
          className="w-full rounded-2xl border border-white/20 bg-transparent px-4 py-3 text-base text-current/90 focus:border-white focus:outline-none"
        />
      </div>
      <div className="flex items-center gap-2">
        <ThemeSwitcher variant={switcherVariant} active={mode} onChange={setMode} />
        <LanguageSwitcher variant={switcherVariant} />
        <WorkspaceSwitcher />
      </div>
      <div className="flex items-center gap-3 rounded-2xl border border-white/15 px-4 py-2">
        <div>
          <p className="text-xs uppercase tracking-widest text-current/60">{user.email}</p>
          <p className="font-semibold">{user.role}</p>
        </div>
        <button
          type="button"
          className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest transition hover:bg-white/10"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          {dict.auth?.logout ?? "Cerrar sesión"}
        </button>
      </div>
    </header>
  );
};
