"use client";

import Image from "next/image";
import { signIn, signOut, useSession } from "next-auth/react";
import { LogOut, Route, UserCircle } from "lucide-react";

export function UserMenu() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  if (isLoading) {
    return (
      <span className="h-10 w-24 animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
    );
  }

  if (!session?.user) {
    return (
      <button
        type="button"
        onClick={() => signIn("google")}
        className="rounded-full border border-slate-200 px-4 py-2 font-bold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
      >
        התחברות עם Google
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <a
        href="#saved-itineraries"
        className="hidden items-center gap-2 rounded-full border border-slate-200 px-3 py-2 font-bold text-slate-700 transition hover:bg-slate-100 sm:inline-flex dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
      >
        <Route className="h-4 w-4 text-sky-500" />
        המסלולים שלי
      </a>
      <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-2 font-bold text-sky-900 dark:bg-sky-500/10 dark:text-sky-100">
        {session.user.image ? (
          <Image
            src={session.user.image}
            alt={session.user.name || "User"}
            width={20}
            height={20}
            className="rounded-full"
          />
        ) : (
          <UserCircle className="h-4 w-4" />
        )}
        {session.user.name || session.user.email}
      </span>
      <button
        type="button"
        onClick={() => signOut()}
        className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-2 font-bold text-white transition hover:bg-sky-600 dark:bg-sky-500 dark:text-slate-950"
      >
        <LogOut className="h-4 w-4" />
        יציאה
      </button>
    </div>
  );
}
