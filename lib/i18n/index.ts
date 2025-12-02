// crm-project-template/lib/i18n/index.ts

import dictionaryEn from "./en";
import dictionaryEs from "./es";

// Clave única para la cookie de idioma
export const LANGUAGE_COOKIE_KEY = "aurora-lang";

export const dictionaries = {
  en: dictionaryEn,
  es: dictionaryEs,
} as const;

// "en" | "es"
export type Locale = keyof typeof dictionaries;

// Tipo de diccionario según el locale
export type AppDictionary = (typeof dictionaries)[Locale];

// Devuelve el diccionario según el locale (por defecto "es")
export const getDictionary = (locale: Locale = "es"): AppDictionary => {
  return dictionaries[locale] ?? dictionaryEs;
};
