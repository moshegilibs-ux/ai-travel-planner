"use client";

import { Globe2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  addLocaleToPath,
  AppLocale,
  isLocale,
  localeCookieName,
  localeLabels,
  locales,
} from "@/lib/i18n";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("language");

  function handleChange(nextLocale: string) {
    if (!isLocale(nextLocale)) return;

    window.localStorage.setItem(localeCookieName, nextLocale);
    document.cookie = `${localeCookieName}=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
    const queryString = searchParams.toString();
    const nextPath = addLocaleToPath(pathname || "/", nextLocale);
    router.push(queryString ? `${nextPath}?${queryString}` : nextPath);
    router.refresh();
  }

  return (
    <label className="inline-flex min-h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm dark:border-white/10 dark:bg-slate-900 dark:text-slate-200">
      <Globe2 className="h-4 w-4 text-sky-600 dark:text-sky-300" />
      <span className="sr-only">{t("select")}</span>
      <select
        aria-label={t("select")}
        className="max-w-28 bg-transparent text-sm outline-none md:max-w-none"
        onChange={(event) => handleChange(event.target.value)}
        value={isLocale(locale) ? locale : "he"}
      >
        {locales.map((item: AppLocale) => (
          <option key={item} value={item}>
            {localeLabels[item]}
          </option>
        ))}
      </select>
    </label>
  );
}
