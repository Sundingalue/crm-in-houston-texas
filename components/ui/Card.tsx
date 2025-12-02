"use client";

import type { ReactNode } from "react";
import { useThemeSettings } from "../providers/ThemeProvider";
import { themeTokens } from "@/lib/utils/theme";

type CardProps = {
  title?: string;
  subtitle?: string;
  className?: string;
  children: ReactNode;
  badge?: string;
};

export const Card = ({ title, subtitle, badge, className = "", children }: CardProps) => {
  const { mode } = useThemeSettings();
  const theme = themeTokens[mode];
  return (
    <section className={`rounded-3xl p-6 sm:p-7 ${theme.card} ${className}`}>
      {(title || subtitle || badge) && (
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            {subtitle ? (
              <p className="text-xs uppercase tracking-[0.35em] text-current/60">{subtitle}</p>
            ) : null}
            {title ? <h3 className="mt-2 text-xl font-semibold">{title}</h3> : null}
          </div>
          {badge ? (
            <span className="rounded-full border border-current/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-current/80">
              {badge}
            </span>
          ) : null}
        </header>
      )}
      <div className={title || subtitle ? "mt-6" : ""}>{children}</div>
    </section>
  );
};
