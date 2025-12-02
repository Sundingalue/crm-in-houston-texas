import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";
import { cookies as serverCookies, headers as serverHeaders } from "next/headers";
import type { Locale } from "@/lib/i18n";
import { LANGUAGE_COOKIE_KEY } from "@/lib/i18n";
import type { ThemeMode } from "@/lib/hooks/useThemeMode";
import { THEME_COOKIE_KEY } from "@/lib/constants/theme";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aurora CRM | Plataforma Comercial Inteligente",
  description:
    "Plantilla CRM de ventas con analítica, automatización y soporte para agentes de IA lista para personalizar.",
};

const FALLBACK_LOCALE: Locale = "es";
const FALLBACK_THEME: ThemeMode = "combinado";

async function resolveLocale(): Promise<Locale> {
  try {
    const cookieStore = await serverCookies();
    const cookieValue = cookieStore.get?.(LANGUAGE_COOKIE_KEY)?.value;
    if (cookieValue) {
      return (cookieValue as Locale) || FALLBACK_LOCALE;
    }
  } catch {
    // ignore - fall back to header parsing below
  }

  try {
    const headerStore = await serverHeaders();
    const cookieHeader = headerStore.get?.("cookie") ?? null;
    if (cookieHeader) {
      const cookieItems = cookieHeader.split(";").map((cookie: string) => cookie.trim());
      const match = cookieItems.find((cookie: string) => cookie.startsWith(`${LANGUAGE_COOKIE_KEY}=`));
      if (match) {
        const value = decodeURIComponent(match.split("=")?.[1] ?? "");
        if (value) {
          return (value as Locale) || FALLBACK_LOCALE;
        }
      }
    }
  } catch {
    // ignore
  }

  return FALLBACK_LOCALE;
}

async function resolveTheme(): Promise<ThemeMode> {
  try {
    const cookieStore = await serverCookies();
    const cookieValue = cookieStore.get?.(THEME_COOKIE_KEY)?.value;
    if (cookieValue) {
      return (cookieValue as ThemeMode) || FALLBACK_THEME;
    }
  } catch {
    // ignore
  }

  try {
    const headerStore = await serverHeaders();
    const cookieHeader = headerStore.get?.("cookie") ?? null;
    if (cookieHeader) {
      const cookieItems = cookieHeader.split(";").map((cookie: string) => cookie.trim());
      const match = cookieItems.find((cookie: string) => cookie.startsWith(`${THEME_COOKIE_KEY}=`));
      if (match) {
        const value = decodeURIComponent(match.split("=")?.[1] ?? "");
        if (value) {
          return (value as ThemeMode) || FALLBACK_THEME;
        }
      }
    }
  } catch {
    // ignore
  }

  return FALLBACK_THEME;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [locale, initialTheme] = await Promise.all([resolveLocale(), resolveTheme()]);
  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppProviders initialLocale={locale} initialTheme={initialTheme}>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
