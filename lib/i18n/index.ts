import "server-only";
import dictionaryEn from "./en";
import dictionaryEs from "./es";

export const dictionaries = {
  en: dictionaryEn,
  es: dictionaryEs,
} as const;

// "en" | "es"
export type Locale = keyof typeof dictionaries;

// Diccionario puede ser el de inglés o el de español
export type AppDictionary = (typeof dictionaries)[Locale];

export const getDictionary = (locale: Locale = "es"): AppDictionary => {
  return dictionaries[locale] ?? dictionaryEs;
};
