import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/85">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-4">
        <Link href="/" className="shrink-0 text-lg font-black text-slate-950 dark:text-white">
          טיולים וחלומות
        </Link>
        <nav className="flex min-w-0 items-center gap-2 overflow-hidden text-sm font-medium text-slate-600 dark:text-slate-300">
          <Link
            href="/"
            className="hidden rounded-full px-3 py-2 transition hover:bg-slate-100 hover:text-slate-950 md:inline-flex dark:hover:bg-white/10 dark:hover:text-white"
          >
            בית
          </Link>
          <Link
            href="/search"
            className="hidden rounded-full px-3 py-2 transition hover:bg-slate-100 hover:text-slate-950 md:inline-flex dark:hover:bg-white/10 dark:hover:text-white"
          >
            חיפוש
          </Link>
          <Link
            href="/saved"
            className="hidden rounded-full px-3 py-2 transition hover:bg-slate-100 hover:text-slate-950 md:inline-flex dark:hover:bg-white/10 dark:hover:text-white"
          >
            שמורים
          </Link>
          <Link
            href="/pricing"
            className="hidden rounded-full px-3 py-2 transition hover:bg-slate-100 hover:text-slate-950 md:inline-flex dark:hover:bg-white/10 dark:hover:text-white"
          >
            מחירים
          </Link>
          <Link
            href="/dashboard"
            className="hidden rounded-full px-3 py-2 transition hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-white/10 dark:hover:text-white lg:inline-flex"
          >
            לוח בקרה
          </Link>
          <Link
            href="/questionnaire"
            className="hidden rounded-full bg-slate-950 px-4 py-2 text-white transition hover:bg-sky-600 dark:bg-sky-500 dark:text-slate-950 md:inline-flex"
          >
            תכנון נגיש
          </Link>
          <ThemeToggle />
          <UserMenu />
        </nav>
      </div>
    </header>
  );
}
