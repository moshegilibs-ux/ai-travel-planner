"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { LanguageSwitcher } from "@/components/language-switcher";
import { InstallAppButton } from "@/components/install-app-button";
import { addLocaleToPath, AppLocale, isLocale } from "@/lib/i18n";

export function AppHeader() {
  const t = useTranslations("nav");
  const localeValue = useLocale();
  const locale: AppLocale = isLocale(localeValue) ? localeValue : "he";

  const localizedHref = (href: string) => addLocaleToPath(href, locale);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/85">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-4">
        <Link
          href={localizedHref("/")}
          className="shrink-0 text-lg font-black text-slate-950 dark:text-white"
        >
          {t("brand")}
        </Link>
        <nav className="flex min-w-0 items-center gap-2 overflow-hidden text-sm font-medium text-slate-600 dark:text-slate-300">
          <Link
            href={localizedHref("/")}
            className="hidden rounded-full px-3 py-2 transition hover:bg-slate-100 hover:text-slate-950 md:inline-flex dark:hover:bg-white/10 dark:hover:text-white"
          >
            {t("home")}
          </Link>
          <Link
            href={localizedHref("/search")}
            className="hidden rounded-full px-3 py-2 transition hover:bg-slate-100 hover:text-slate-950 md:inline-flex dark:hover:bg-white/10 dark:hover:text-white"
          >
            {t("search")}
          </Link>
          <Link
            href={localizedHref("/saved")}
            className="hidden rounded-full px-3 py-2 transition hover:bg-slate-100 hover:text-slate-950 md:inline-flex dark:hover:bg-white/10 dark:hover:text-white"
          >
            {t("saved")}
          </Link>
          <Link
            href={localizedHref("/my-trip")}
            className="hidden rounded-full px-3 py-2 transition hover:bg-slate-100 hover:text-slate-950 md:inline-flex dark:hover:bg-white/10 dark:hover:text-white"
          >
            {t("myTrip")}
          </Link>
          <Link
            href={localizedHref("/my-trips")}
            className="hidden rounded-full px-3 py-2 transition hover:bg-slate-100 hover:text-slate-950 md:inline-flex dark:hover:bg-white/10 dark:hover:text-white"
          >
            {t("myTrips")}
          </Link>
          <Link
            href={localizedHref("/pricing")}
            className="hidden rounded-full px-3 py-2 transition hover:bg-slate-100 hover:text-slate-950 md:inline-flex dark:hover:bg-white/10 dark:hover:text-white"
          >
            {t("pricing")}
          </Link>
          <Link
            href={localizedHref("/dashboard")}
            className="hidden rounded-full px-3 py-2 transition hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-white/10 dark:hover:text-white lg:inline-flex"
          >
            {t("dashboard")}
          </Link>
          <Link
            href={localizedHref("/questionnaire")}
            className="hidden rounded-full bg-slate-950 px-4 py-2 text-white transition hover:bg-sky-600 dark:bg-sky-500 dark:text-slate-950 md:inline-flex"
          >
            {t("planner")}
          </Link>
          <InstallAppButton />
          <LanguageSwitcher />
          <ThemeToggle />
          <UserMenu />
        </nav>
      </div>
    </header>
  );
}
