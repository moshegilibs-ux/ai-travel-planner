import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "@/components/language-switcher";
import { UserMenu } from "@/components/user-menu";

export async function AppHeader() {
  const t = await getTranslations("nav");

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-slate-950/90">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-5">
        <Link href="/" className="text-xl font-black text-[#15315d] dark:text-white">
          {t("brand")}
        </Link>
        <nav className="hidden items-center gap-4 text-sm font-bold text-slate-600 md:flex dark:text-slate-200">
          <Link href="/search">{t("search")}</Link>
          <Link href="/my-trips">{t("myTrips")}</Link>
          <Link href="/notifications">{t("notifications")}</Link>
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
