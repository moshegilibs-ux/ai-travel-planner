import ar from "../../messages/ar.json";
import en from "../../messages/en.json";
import es from "../../messages/es.json";
import fr from "../../messages/fr.json";
import he from "../../messages/he.json";
import ru from "../../messages/ru.json";

export const locales = ["he", "en", "ar", "ru", "fr", "es"] as const;
export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = "he";
export const localeCookieName = "trippilot-locale";

export const localeLabels: Record<AppLocale, string> = {
  he: "עברית",
  en: "English",
  ar: "العربية",
  ru: "Русский",
  fr: "Français",
  es: "Español",
};

export const rtlLocales = new Set<AppLocale>(["he", "ar"]);

export const messagesByLocale = {
  he,
  en,
  ar,
  ru,
  fr,
  es,
};

export function isLocale(value: string | undefined | null): value is AppLocale {
  return Boolean(value && locales.includes(value as AppLocale));
}

export function getDirection(locale: AppLocale) {
  return rtlLocales.has(locale) ? "rtl" : "ltr";
}

export function getLocaleFromPath(pathname: string) {
  const segment = pathname.split("/").filter(Boolean)[0];
  return isLocale(segment) ? segment : null;
}

export function removeLocaleFromPath(pathname: string) {
  const locale = getLocaleFromPath(pathname);

  if (!locale) return pathname || "/";

  const nextPath = pathname.replace(new RegExp(`^/${locale}`), "") || "/";
  return nextPath.startsWith("/") ? nextPath : `/${nextPath}`;
}

export function addLocaleToPath(pathname: string, locale: AppLocale) {
  const cleanPath = removeLocaleFromPath(pathname);
  return cleanPath === "/" ? `/${locale}` : `/${locale}${cleanPath}`;
}

export function detectLocale(acceptLanguage: string | null, storedLocale?: string) {
  if (isLocale(storedLocale)) return storedLocale;

  const requestedLocales =
    acceptLanguage
      ?.split(",")
      .map((item) => item.split(";")[0]?.trim().toLowerCase())
      .filter(Boolean) ?? [];

  for (const requested of requestedLocales) {
    const exact = locales.find((locale) => locale === requested);
    if (exact) return exact;

    const language = requested.split("-")[0];
    const base = locales.find((locale) => locale === language);
    if (base) return base;
  }

  return defaultLocale;
}
