"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, DatabaseZap, RefreshCw } from "lucide-react";
import type { ApiStatus } from "@/lib/api-status";

const cards = [
  { key: "aiConfigured", provider: "ai", title: "AI API", message: "ai" },
  {
    key: "googleMapsConfigured",
    provider: "places",
    title: "Google Places / Maps API",
    message: "googleMaps",
  },
  {
    key: "flightsConfigured",
    provider: "flights",
    title: "Flight API",
    message: "flights",
  },
] as const;

export function DeveloperSettings({ initialStatus }: { initialStatus: ApiStatus }) {
  const [status] = useState<ApiStatus>(initialStatus);
  const [isLoading, setIsLoading] = useState(false);

  function loadStatus() {
    // The admin token is intentionally not stored in localStorage or passed to this component.
    setIsLoading(true);
    window.setTimeout(() => setIsLoading(false), 250);
  }

  useEffect(() => {
    const url = new URL(window.location.href);

    if (url.searchParams.has("token")) {
      url.searchParams.delete("token");
      window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    }
  }, []);

  return (
    <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-bold text-sky-600 dark:text-sky-300">
            Developer settings
          </p>
          <h2 className="mt-1 text-2xl font-black">API status</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            בדיקת ספקים פעילים בלי לחשוף מפתחות API בצד לקוח.
          </p>
        </div>
        <button
          type="button"
          onClick={loadStatus}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <DatabaseZap className="h-6 w-6 text-sky-600" />
            <div>
              <p className="font-black text-slate-950 dark:text-white">
                {status.messages.dataMode}
              </p>
              <p className="text-sm text-slate-500">
                {status.useMockData
                  ? "NEXT_PUBLIC_USE_MOCK_DATA=true"
                  : "NEXT_PUBLIC_USE_MOCK_DATA=false"}
              </p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-2 text-sm font-black text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
            {status.messages.fallback}
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {cards.map((card) => {
          const configured = Boolean(status[card.key]);
          const provider = status.activeProviders[card.provider];

          return (
            <article
              key={card.title}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-black text-slate-950 dark:text-white">
                    {card.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Provider: {provider}
                  </p>
                </div>
                {configured ? (
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                ) : (
                  <AlertTriangle className="h-6 w-6 text-amber-500" />
                )}
              </div>
              <p
                className={`mt-4 rounded-full px-3 py-2 text-sm font-black ${
                  configured
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200"
                    : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200"
                }`}
              >
                {status.messages[card.message]}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
