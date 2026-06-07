"use client";

import Image from "next/image";
import Link from "next/link";
import { cloneElement, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { getUiTranslations } from "@/lib/ui-translations";
import {
  deriveHeroAccessibility,
  loadAccessibilityProfile,
} from "@/lib/accessibility-profile";
import {
  Accessibility,
  ArrowLeft,
  BadgeCheck,
  BrainCircuit,
  Hotel,
  MapPinned,
  Plane,
  Route,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { FormEvent, ReactElement } from "react";
import type { LucideIcon } from "lucide-react";

type BudgetLevel = "Smart value" | "Comfort" | "Premium";
type TravelStyle = "Family" | "Relaxed" | "Culture" | "Beach";

type RoutePreview = {
  id: string;
  title: string;
  image: string;
  split: string[];
  estimate: string;
  transport: string;
  fit: string;
  badges: string[];
};

const budgetMultipliers: Record<BudgetLevel, number> = {
  "Smart value": 0.86,
  Comfort: 1,
  Premium: 1.42,
};

const defaultRoutes: RoutePreview[] = [
  {
    id: "thailand-classic",
    title: "",
    image:
      "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=900&q=80",
    split: [],
    estimate: "$5,900 - $7,400",
    transport: "",
    fit: "",
    badges: ["ai", "family"],
  },
  {
    id: "thailand-islands",
    title: "",
    image:
      "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=900&q=80",
    split: [],
    estimate: "$6,200 - $7,900",
    transport: "",
    fit: "",
    badges: ["ai", "beach"],
  },
  {
    id: "thailand-accessible",
    title: "",
    image:
      "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=900&q=80",
    split: [],
    estimate: "$6,500 - $8,300",
    transport: "",
    fit: "",
    badges: ["accessible", "relaxed"],
  },
];

const europeRoutes: RoutePreview[] = [
  {
    id: "italy-accessible",
    title: "",
    image:
      "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=900&q=80",
    split: [],
    estimate: "$4,800 - $6,200",
    transport: "",
    fit: "",
    badges: ["accessible", "culture"],
  },
  {
    id: "spain-family",
    title: "",
    image:
      "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=900&q=80",
    split: [],
    estimate: "$4,500 - $5,900",
    transport: "",
    fit: "",
    badges: ["family", "ai"],
  },
];

const accessibilityOptions = [
  "Wheelchair user",
  "Limited walking",
  "Step-free hotels",
  "Accessible transport",
  "Relaxed pace",
];

function localizeRoute(
  route: RoutePreview,
  routeCards: Record<string, { title: string; split: readonly string[]; transport: string; fit: string }>,
): RoutePreview {
  const localized = routeCards[route.id];
  return localized ? { ...route, ...localized, split: [...localized.split] } : route;
}


export function HeroTripPlanner() {
  const router = useRouter();
  const locale = useLocale() === "en" ? "en" : "he";
  const copy = getUiTranslations(locale).planner;
  const [from, setFrom] = useState<string>(copy.fromDefault);
  const [destination, setDestination] = useState<string>(copy.destinationDefault);
  const [nights, setNights] = useState(14);
  const [budget, setBudget] = useState<BudgetLevel>("Comfort");
  const [style, setStyle] = useState<TravelStyle>("Family");
  const [accessibility, setAccessibility] = useState<string[]>([
    "Step-free hotels",
    "Relaxed pace",
  ]);

  useEffect(() => {
    const profile = loadAccessibilityProfile();
    if (!profile) return;
    const prefill = deriveHeroAccessibility(profile);
    if (prefill.length) {
      setAccessibility(prefill);
    }
  }, []);

  const routes = useMemo(() => {
    const country = destination.trim().toLowerCase();
    const source = /thai|תאילנד|בנגקוק|bangkok|phuket|פוקט|samui|סמוי/.test(country)
      ? defaultRoutes
      : europeRoutes;
    const multiplier = budgetMultipliers[budget];
    const nightFactor = Math.max(0.75, nights / 14);

    return source.map((route) => {
      const low = Math.round(5200 * multiplier * nightFactor);
      const high = Math.round(6900 * multiplier * nightFactor);
      const badgeMap: Record<string, string> = {
        ai: copy.badges.ai,
        accessible: copy.badges.accessible,
        family: copy.badges.family,
        beach: copy.badges.beach,
        relaxed: copy.badges.relaxed,
        culture: copy.badges.culture,
      };
      return {
        ...localizeRoute(route, copy.routeCards),
        estimate: `$${low.toLocaleString()} - $${high.toLocaleString()}`,
        badges: accessibility.length
          ? Array.from(new Set([copy.badges.accessible, ...route.badges.map((badge) => badgeMap[badge] ?? badge)]))
          : route.badges.map((badge) => badgeMap[badge] ?? badge),
      };
    });
  }, [accessibility.length, budget, copy.badges, destination, locale, nights]);

  const primaryRoute = routes[0];
  const routeCities = primaryRoute.split.map((item) =>
    item.replace(/\s+\d+n$/, "").replace(/\s+\d+\s+לילות?$/, ""),
  );

  function toggleAccessibility(option: string) {
    setAccessibility((current) =>
      current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option],
    );
  }

  function submitPlanner(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams({
      from,
      destination,
      nights: String(nights),
      budget,
      style,
      accessibility: accessibility.join(","),
    });
    router.push(`/search?${params.toString()}`);
  }

  return (
    <div className="grid gap-5">
      <form
        onSubmit={submitPlanner}
        className="rounded-3xl border border-white/70 bg-white/92 p-4 shadow-2xl shadow-slate-900/12 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/92"
      >
        <div className="flex flex-wrap items-center gap-2">
          <PlannerBadge icon={BrainCircuit} label={copy.badges.ai} />
          <PlannerBadge icon={Accessibility} label={copy.badges.accessible} />
          <PlannerBadge icon={Users} label={copy.badges.family} />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <PlannerField label={copy.from}>
            <input value={from} onChange={(event) => setFrom(event.target.value)} />
          </PlannerField>
          <PlannerField label={copy.destination}>
            <input
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
            />
          </PlannerField>
          <PlannerField label={copy.nights}>
            <input
              min={3}
              max={30}
              type="number"
              value={nights}
              onChange={(event) => setNights(Number(event.target.value))}
            />
          </PlannerField>
          <PlannerField label={copy.budget}>
            <select value={budget} onChange={(event) => setBudget(event.target.value as BudgetLevel)}>
              {(["Smart value", "Comfort", "Premium"] as BudgetLevel[]).map((item) => (
                <option key={item} value={item}>
                  {copy.budgets[item]}
                </option>
              ))}
            </select>
          </PlannerField>
          <PlannerField label={copy.style}>
            <select value={style} onChange={(event) => setStyle(event.target.value as TravelStyle)}>
              {(["Family", "Relaxed", "Culture", "Beach"] as TravelStyle[]).map((item) => (
                <option key={item} value={item}>
                  {copy.styles[item]}
                </option>
              ))}
            </select>
          </PlannerField>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-300/20 dark:bg-emerald-950/30">
            <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase text-emerald-700 dark:text-emerald-200">
              <Accessibility className="h-4 w-4" />
              {copy.accessibility}
            </div>
            <div className="grid gap-2">
              {accessibilityOptions.slice(0, 3).map((option) => (
                <label key={option} className="flex items-center gap-2 text-sm font-bold">
                  <input
                    checked={accessibility.includes(option)}
                    type="checkbox"
                    onChange={() => toggleAccessibility(option)}
                    className="h-4 w-4 accent-emerald-600"
                  />
                  {copy.access[option as keyof typeof copy.access]}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {accessibilityOptions.slice(3).map((option) => (
            <label
              key={option}
              className="flex min-h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 dark:border-white/10 dark:bg-slate-950 dark:text-slate-200"
            >
              <input
                checked={accessibility.includes(option)}
                type="checkbox"
                onChange={() => toggleAccessibility(option)}
                className="h-4 w-4 accent-emerald-600"
              />
              {copy.access[option as keyof typeof copy.access]}
            </label>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-slate-950/70">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-black text-slate-900 dark:text-white">
              {copy.routePreview}
            </p>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700 dark:bg-emerald-300/15 dark:text-emerald-200">
              {destination} {nights} {copy.nightUnit}
            </span>
          </div>
          <AnimatedRouteTimeline cities={routeCities} />
        </div>

        <button
          type="submit"
          className="mt-4 inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#15315d] px-6 text-base font-black text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-emerald-700"
        >
          {copy.cta}
          <ArrowLeft className="h-5 w-5" />
        </button>
      </form>

      <div className="grid gap-3 md:grid-cols-3">
        {routes.map((route) => (
          <RoutePreviewCard key={route.id} hotelsNote={copy.hotelsNote} route={route} />
        ))}
      </div>
    </div>
  );
}

function PlannerField({
  children,
  label,
}: {
  children: ReactElement<{ className?: string }>;
  label: string;
}) {
  const child = cloneElement(children, {
    className:
      "mt-1 min-h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-white/10 dark:bg-slate-950 dark:text-white",
  });

  return (
    <label className="block text-xs font-black uppercase text-slate-500 dark:text-slate-300">
      {label}
      {child}
    </label>
  );
}

function PlannerBadge({
  icon: Icon,
  label,
}: {
  icon: LucideIcon;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-950 px-3 py-1.5 text-xs font-black text-white dark:bg-white dark:text-slate-950">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

function AnimatedRouteTimeline({ cities }: { cities: string[] }) {
  return (
    <div className="mt-3">
      <div className="relative flex items-center justify-between gap-2 overflow-hidden rounded-2xl bg-white px-3 py-4 dark:bg-slate-900">
        <div className="absolute left-6 right-6 top-1/2 h-1 -translate-y-1/2 rounded-full bg-slate-200 dark:bg-white/10" />
        <div className="absolute left-6 top-1/2 h-1 w-[58%] -translate-y-1/2 rounded-full bg-emerald-500 route-progress" />
        {cities.map((city, index) => (
          <div key={`${city}-${index}`} className="relative z-10 grid justify-items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#15315d] text-xs font-black text-white shadow-lg shadow-slate-900/20">
              {index + 1}
            </span>
            <span className="max-w-20 text-center text-[11px] font-black leading-tight text-slate-700 dark:text-slate-200">
              {city}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RoutePreviewCard({ hotelsNote, route }: { hotelsNote: string; route: RoutePreview }) {
  return (
    <article className="overflow-hidden rounded-3xl border border-white/70 bg-white shadow-xl shadow-slate-900/10 dark:border-white/10 dark:bg-slate-900">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <Image
          src={route.image}
          alt={route.title}
          fill
          sizes="(min-width: 768px) 220px, 100vw"
          className="object-cover object-center"
        />
        <div className="absolute left-3 top-3 rounded-full bg-white/92 px-3 py-1 text-xs font-black text-slate-900 shadow">
          {route.estimate}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-black text-[#15315d] dark:text-white">{route.title}</h3>
          <Route className="h-5 w-5 shrink-0 text-emerald-500" />
        </div>
        <p className="mt-2 text-sm font-bold leading-6 text-slate-600 dark:text-slate-300">
          {route.split.join(" -> ")}
        </p>
        <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
          {route.fit}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {route.badges.map((badge) => (
            <span
              key={badge}
              className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-black text-emerald-700 dark:bg-emerald-300/15 dark:text-emerald-200"
            >
              <BadgeCheck className="h-3 w-3" />
              {badge}
            </span>
          ))}
        </div>
        <div className="mt-3 grid gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
          <span className="inline-flex items-center gap-2">
            <Plane className="h-4 w-4 text-sky-500" />
            {route.transport}
          </span>
          <span className="inline-flex items-center gap-2">
            <Hotel className="h-4 w-4 text-amber-500" />
            {hotelsNote}
          </span>
        </div>
      </div>
    </article>
  );
}

export function SampleItinerariesSection() {
  const locale = useLocale() === "en" ? "en" : "he";
  const copy = getUiTranslations(locale).planner;
  const icons = [Plane, Accessibility, Users];
  const samples = copy.samples.map((sample, index) => ({
    ...sample,
    icon: icons[index] ?? Plane,
  }));

  return (
    <section className="mx-auto max-w-7xl px-5 py-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-black text-emerald-600 dark:text-emerald-300">
            {copy.samplesEyebrow}
          </p>
          <h2 className="mt-2 text-4xl font-black text-[#15315d] dark:text-white">
            {copy.samplesTitle}
          </h2>
          <p className="mt-3 text-lg leading-8 text-slate-600 dark:text-slate-300">
            {copy.samplesCopy}
          </p>
        </div>
        <div className="grid gap-2 text-sm font-black text-slate-700 sm:grid-cols-3 dark:text-slate-200">
          <TrustItem icon={ShieldCheck} label={copy.trust[0]} />
          <TrustItem icon={Accessibility} label={copy.trust[1]} />
          <TrustItem icon={MapPinned} label={copy.trust[2]} />
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {samples.map(({ icon: Icon, ...sample }) => (
          <Link
            key={sample.title}
            href={sample.href}
            onKeyDown={(event) => {
              if (event.key === " ") {
                event.preventDefault();
                event.currentTarget.click();
              }
            }}
            className="group block cursor-pointer rounded-3xl border border-white/10 bg-[#102647] p-5 text-white no-underline shadow-xl shadow-slate-900/15 outline-none transition hover:-translate-y-1 hover:border-emerald-300 hover:bg-[#15315d] hover:text-white hover:shadow-2xl focus-visible:ring-4 focus-visible:ring-emerald-200 dark:border-white/10 dark:bg-slate-900 dark:hover:bg-slate-800"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-400/15 text-emerald-200 ring-1 ring-emerald-300/25">
                <Icon className="h-6 w-6" />
              </span>
              <span className="rounded-full bg-white/12 px-3 py-1 text-xs font-black text-white ring-1 ring-white/15">
                {sample.budget}
              </span>
            </div>
            <h3 className="mt-5 text-2xl font-black text-white">
              {sample.title}
            </h3>
            <p className="mt-3 text-sm font-black leading-6 text-emerald-100">
              {sample.route}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-200">
              {sample.note}
            </p>
            <div className="mt-5 flex items-center justify-between gap-3">
              <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-black text-emerald-100 ring-1 ring-emerald-300/20">
                {copy.badges.ai}
              </span>
              <ArrowLeft className="h-5 w-5 text-emerald-200 transition group-hover:-translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function TrustItem({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <span className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-white px-4 shadow-sm dark:bg-slate-900">
      <Icon className="h-4 w-4 text-emerald-500" />
      {label}
    </span>
  );
}
