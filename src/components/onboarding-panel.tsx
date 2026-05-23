"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plane, Sparkles, WalletCards } from "lucide-react";

const demoTrips = [
  {
    title: "Budget Greece beta demo",
    href: "/search?origin=Tel%20Aviv&destination=Athens&departureDate=2026-08-10&returnDate=2026-08-15&adults=2&budget=1400",
  },
  {
    title: "Tokyo city break",
    href: "/destinations/tokyo",
  },
  {
    title: "Bangkok value route",
    href: "/destinations/bangkok",
  },
];

export function OnboardingPanel() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(localStorage.getItem("trippilot:onboarding-dismissed") !== "true");
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-6">
      <div className="rounded-[2rem] border border-sky-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/10">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-bold text-sky-600 dark:text-sky-300">
              New here? Start with a guided beta tour.
            </p>
            <h2 className="mt-1 text-2xl font-black">Plan, compare, save and optimize.</h2>
          </div>
          <button
            onClick={() => {
              localStorage.setItem("trippilot:onboarding-dismissed", "true");
              setVisible(false);
            }}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold transition hover:bg-slate-100 dark:border-white/10 dark:hover:bg-white/10"
          >
            Dismiss
          </button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Plane,
              title: "Run a sample search",
              text: "Compare flights and hotels with mock fallback if providers are offline.",
            },
            {
              icon: Sparkles,
              title: "Ask the AI assistant",
              text: "Try: I want a cheap 5-day trip to Greece in August.",
            },
            {
              icon: WalletCards,
              title: "Track value",
              text: "Save trips, track prices and review budget estimates.",
            },
          ].map((step) => (
            <div key={step.title} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/50">
              <step.icon className="h-5 w-5 text-sky-500" />
              <h3 className="mt-3 font-black">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {step.text}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {demoTrips.map((trip) => (
            <Link
              key={trip.title}
              href={trip.href}
              prefetch
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-sky-600 dark:bg-sky-500 dark:text-slate-950"
            >
              {trip.title}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
