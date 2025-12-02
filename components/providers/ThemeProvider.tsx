"use client";

import { createContext, useContext } from "react";
import { ThemeMode, useThemeMode } from "@/lib/hooks/useThemeMode";

type ThemeContextValue = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

type Props = {
  children: React.ReactNode;
  initialMode: ThemeMode;
};

export const ThemeProvider = ({ children, initialMode }: Props) => {
  const { mode, setMode } = useThemeMode(initialMode);
  return <ThemeContext.Provider value={{ mode, setMode }}>{children}</ThemeContext.Provider>;
};

export const useThemeSettings = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeSettings debe usarse dentro de ThemeProvider.");
  }
  return context;
};
