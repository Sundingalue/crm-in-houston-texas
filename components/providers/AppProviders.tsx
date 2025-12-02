"use client";

import { ThemeProvider } from "./ThemeProvider";
import { LanguageProvider } from "./LanguageProvider";
import type { Locale } from "@/lib/i18n";
import type { ThemeMode } from "@/lib/hooks/useThemeMode";

type Props = {
  children: React.ReactNode;
  initialLocale: Locale;
  initialTheme: ThemeMode;
};

export const AppProviders = ({ children, initialLocale, initialTheme }: Props) => {
  return (
    <LanguageProvider initialLocale={initialLocale}>
      <ThemeProvider initialMode={initialTheme}>{children}</ThemeProvider>
    </LanguageProvider>
  );
};
