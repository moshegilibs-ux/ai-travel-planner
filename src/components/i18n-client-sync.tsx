"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { AppLocale, getDirection, isLocale, localeCookieName } from "@/lib/i18n";

export function I18nClientSync() {
  const locale = useLocale();

  useEffect(() => {
    if (!isLocale(locale)) return;

    const appLocale = locale as AppLocale;
    document.documentElement.lang = appLocale;
    document.documentElement.dir = getDirection(appLocale);
    window.localStorage.setItem(localeCookieName, appLocale);
  }, [locale]);

  return null;
}
