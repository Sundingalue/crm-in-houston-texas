import { dictionaryEs } from "./es";
import { dictionaryEn } from "./en";

export type Locale = "es" | "en";

export const dictionaries = {
  es: dictionaryEs,
  en: dictionaryEn,
};

export const LANGUAGE_COOKIE_KEY = "aurora-locale";

export type AppDictionary = typeof dictionaryEs;

export const getDictionary = (locale: Locale = "es"): AppDictionary => {
  return dictionaries[locale] ?? dictionaryEs;
};
