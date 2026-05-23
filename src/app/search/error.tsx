"use client";

import Link from "next/link";
import { AppHeader } from "@/components/app-header";

export default function SearchError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-5 py-16">
        <div className="rounded-[2rem] border border-red-200 bg-white p-8 text-center shadow-sm dark:border-red-400/30 dark:bg-slate-900">
          <p className="text-sm font-bold text-red-600 dark:text-red-300">
            Search unavailable
          </p>
          <h1 className="mt-2 text-3xl font-black">We could not load trips.</h1>
          <p className="mt-3 leading-7 text-slate-500">
            {error.message || "There was a temporary issue loading flights and hotels."}
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={reset}
              className="rounded-full bg-slate-950 px-5 py-3 font-bold text-white transition hover:bg-sky-600 dark:bg-sky-500 dark:text-slate-950"
            >
              Try again
            </button>
            <Link
              href="/"
              className="rounded-full border border-slate-200 px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
            >
              Back home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
