"use client";

import type { KeyboardEvent, MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { RouteOption } from "@/lib/generate-itinerary";

type Labels = {
  selected: string;
  selectedPlan: string;
  showPlan: string;
  split: string;
  nights: string;
  flightEstimate: string;
  hotels: string;
  internalTransport: string;
};

export function SearchRouteOptionCard({
  href,
  labels,
  option,
  selected,
}: {
  href: string;
  labels: Labels;
  option: RouteOption;
  selected: boolean;
}) {
  const router = useRouter();

  function openRouteOption() {
    const url = new URL(href, window.location.origin);
    const nextPath = `/search${url.search}${url.hash || "#daily-itinerary"}`;

    router.push(nextPath, { scroll: false });
    window.setTimeout(() => {
      document
        .getElementById("daily-itinerary")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  }

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return;
    }

    event.preventDefault();
    openRouteOption();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLAnchorElement>) {
    if (event.key !== " ") return;

    event.preventDefault();
    openRouteOption();
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-current={selected ? "true" : undefined}
      className={`block rounded-2xl border bg-white p-5 text-inherit no-underline shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-500 dark:bg-slate-900 ${
        selected ? "border-emerald-400 ring-2 ring-emerald-100" : "border-slate-200 dark:border-white/10"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-black text-[#15315d] dark:text-white">{option.name}</h3>
          <p className="mt-1 text-sm font-bold text-slate-500 dark:text-slate-300">
            {option.durationLabel}
          </p>
        </div>
        {selected ? (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
            {labels.selected}
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
        {option.whyThisRouteFits}
      </p>
      {option.accessibilitySummary ? (
        <p className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm font-bold leading-6 text-emerald-900 dark:bg-emerald-300/10 dark:text-emerald-100">
          {option.accessibilitySummary}
        </p>
      ) : null}
      <div className="mt-4 grid gap-2 text-sm">
        <InfoLine
          label={labels.split}
          value={option.destinations
            .map((destination) => `${destination.name} ${destination.nights} ${labels.nights}`)
            .join(" -> ")}
        />
        <InfoLine
          label={labels.flightEstimate}
          value={formatTripMoney(option.budget.internationalFlights, option.budget.currency)}
        />
        <InfoLine
          label={labels.hotels}
          value={formatTripMoney(option.budget.hotels, option.budget.currency)}
        />
        <InfoLine
          label={labels.internalTransport}
          value={formatTripMoney(option.budget.domesticTransportation, option.budget.currency)}
        />
      </div>
      <span
        className={`mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl px-4 text-sm font-black transition ${
          selected
            ? "bg-emerald-100 text-emerald-800"
            : "bg-[#15315d] text-white hover:bg-emerald-700"
        }`}
      >
        {selected ? labels.selectedPlan : labels.showPlan}
        <ArrowLeft className="h-4 w-4" />
      </span>
    </Link>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-950">
      <span className="font-bold text-slate-500 dark:text-slate-300">{label}</span>
      <span className="text-end font-black text-slate-900 dark:text-white">{value}</span>
    </div>
  );
}

function formatTripMoney(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    currency,
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}
