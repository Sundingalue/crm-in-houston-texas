"use client";

import type { ReactNode } from "react";
import type { Session } from "next-auth";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useThemeSettings } from "../providers/ThemeProvider";
import { themeTokens } from "@/lib/utils/theme";

type Props = {
  children: ReactNode;
  user: Session["user"];
};

export const AppShell = ({ children, user }: Props) => {
  const { mode } = useThemeSettings();
  const theme = themeTokens[mode];
  return (
    <div data-theme={mode} className={`min-h-screen px-4 py-6 sm:px-12 sm:py-12 ${theme.page}`}>
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-8 lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
        <Sidebar className={`${theme.sidebar} sticky top-6 self-start`} />
        <main className="flex flex-col gap-8">
          <Topbar user={user} />
          <div className="flex flex-col gap-8">{children}</div>
        </main>
      </div>
    </div>
  );
};
