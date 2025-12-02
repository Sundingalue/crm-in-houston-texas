import { useEffect, useState } from "react";
import { THEME_COOKIE_KEY } from "@/lib/constants/theme";

export type ThemeMode = "claro" | "oscuro" | "combinado";

const STORAGE_KEY = "aurora-crm-theme";

export const useThemeMode = (initial: ThemeMode = "combinado") => {
  const [mode, setMode] = useState<ThemeMode>(initial);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, mode);
    document.cookie = `${THEME_COOKIE_KEY}=${mode}; path=/; max-age=${60 * 60 * 24 * 365}`;
  }, [mode]);

  return { mode, setMode };
};
