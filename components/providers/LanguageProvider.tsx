"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { AppDictionary, Locale, getDictionary, LANGUAGE_COOKIE_KEY } from "@/lib/i18n";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
  dictionary: AppDictionary;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

type Props = {
  initialLocale: Locale;
  children: React.ReactNode;
};

export const LanguageProvider = ({ children, initialLocale }: Props) => {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = (value: Locale) => {
    setLocaleState(value);
    if (typeof document !== "undefined") {
      document.cookie = `${LANGUAGE_COOKIE_KEY}=${value}; path=/; max-age=${60 * 60 * 24 * 365}`;
    }
  };

  const dictionary = useMemo(() => getDictionary(locale), [locale]);

  return (
    <LanguageContext.Provider
      value={{
        locale,
        setLocale,
        dictionary,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage debe usarse dentro de LanguageProvider.");
  }
  return ctx;
};

export const useDictionary = () => useLanguage().dictionary;
