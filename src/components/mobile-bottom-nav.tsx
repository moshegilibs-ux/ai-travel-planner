"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, Search, Sparkles } from "lucide-react";

const items = [
  { href: "/", label: "בית", Icon: Home },
  { href: "/search", label: "חיפוש", Icon: Search },
  { href: "/saved", label: "שמורים", Icon: Heart },
  { href: "/pricing", label: "מסלולים", Icon: Sparkles },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-4 rounded-[1.5rem] border border-slate-200 bg-white/95 p-2 shadow-2xl backdrop-blur md:hidden dark:border-white/10 dark:bg-slate-950/95">
      {items.map(({ href, label, Icon }) => {
        const active = pathname === href;

        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs font-bold transition ${
              active
                ? "bg-sky-500 text-white"
                : "text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
