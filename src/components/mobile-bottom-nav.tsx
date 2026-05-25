"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MapPinned, Route, Search } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { addLocaleToPath, AppLocale, isLocale } from "@/lib/i18n";

const items = [
  { href: "/", labelKey: "home", Icon: Home },
  { href: "/search", labelKey: "search", Icon: Search },
  { href: "/my-trip", labelKey: "myTrip", Icon: MapPinned },
  { href: "/my-trips", labelKey: "myTrips", Icon: Route },
] as const;

export function MobileBottomNav() {
  const pathname = usePathname();
  const t = useTranslations("mobile");
  const localeValue = useLocale();
  const locale: AppLocale = isLocale(localeValue) ? localeValue : "he";

  return (
    <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-4 rounded-[1.5rem] border border-slate-200 bg-white/95 p-2 shadow-2xl backdrop-blur md:hidden dark:border-white/10 dark:bg-slate-950/95">
      {items.map(({ href, labelKey, Icon }) => {
        const localizedHref = addLocaleToPath(href, locale);
        const active = pathname === href || pathname === localizedHref;

        return (
          <Link
            key={href}
            href={localizedHref}
            className={`flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs font-bold transition ${
              active
                ? "bg-sky-500 text-white"
                : "text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
            }`}
          >
            <Icon className="h-4 w-4" />
            {t(labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}
