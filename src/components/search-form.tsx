"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  Accessibility,
  CalendarDays,
  MapPin,
  Plane,
  Search,
  Users,
  Wallet,
} from "lucide-react";
import { airportSuggestions, trendingDestinations } from "@/data/search-suggestions";
import { addLocaleToPath, AppLocale, isLocale } from "@/lib/i18n";
import { VoiceInputButton } from "@/components/voice-input-button";
import type { AccessibilityProfile } from "@/types/travel-marketplace";

const fieldClass =
  "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100 dark:border-white/10 dark:bg-slate-900 dark:text-white dark:focus:ring-sky-500/20";

const accessibilityOptions = [
  ["wheelchair-accessible", "Wheelchair Accessible"],
  ["elder-friendly", "Elder Friendly"],
  ["kids-friendly", "Kids Friendly"],
  ["walker-friendly", "Walker Friendly"],
  ["mobility-scooter-friendly", "Mobility Scooter Friendly"],
  ["elevator-required", "Elevator Required"],
  ["accessible-bathroom", "Accessible Bathroom"],
  ["accessible-toilet", "Accessible Toilet"],
  ["step-free-access", "Step-free Access"],
  ["short-walking-distances", "Short Walking Distances"],
  ["medical-assistance-nearby", "Medical Assistance Nearby"],
] as const;

const accessibilityProfiles: Array<[AccessibilityProfile, string]> = [
  ["none", "No special need"],
  ["wheelchair", "Wheelchair user"],
  ["walker", "Walker user"],
  ["mobility-scooter", "Mobility scooter user"],
  ["senior", "Senior traveler"],
  ["young-children", "Family with young children"],
];

type DestinationSuggestion = {
  label: string;
  value: string;
  source?: string;
};

export function SearchForm({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const localeValue = useLocale();
  const locale: AppLocale = isLocale(localeValue) ? localeValue : "he";
  const t = useTranslations("searchForm");
  const [from, setFrom] = useState("Tel Aviv");
  const [destination, setDestination] = useState("");
  const [destinationSuggestions, setDestinationSuggestions] = useState<
    DestinationSuggestion[]
  >([]);
  const [departureDate, setDepartureDate] = useState("2026-06-10");
  const [returnDate, setReturnDate] = useState("2026-06-15");
  const [travelers, setTravelers] = useState(2);
  const [budget, setBudget] = useState(1600);
  const [multiCity, setMultiCity] = useState("");
  const [flexibleDates, setFlexibleDates] = useState(false);
  const [cheapestMonth, setCheapestMonth] = useState(false);
  const [nearbyAirports, setNearbyAirports] = useState(true);
  const [accessibilityProfile, setAccessibilityProfile] =
    useState<AccessibilityProfile>("senior");
  const [accessibilityFilters, setAccessibilityFilters] = useState<string[]>([
    "wheelchair-accessible",
    "elder-friendly",
    "kids-friendly",
    "step-free-access",
    "short-walking-distances",
    "elevator-required",
  ]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadSuggestions() {
      try {
        const response = await fetch(
          `/api/autocomplete?q=${encodeURIComponent(destination)}`,
          { signal: controller.signal },
        );

        if (!response.ok) return;

        const payload = (await response.json()) as {
          destinations?: Array<string | DestinationSuggestion>;
        };
        setDestinationSuggestions(
          (payload.destinations ?? [])
            .map((item) =>
              typeof item === "string" ? { label: item, value: item } : item,
            )
            .filter((item) => item.value),
        );
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setDestinationSuggestions([]);
        }
      }
    }

    loadSuggestions();
    return () => controller.abort();
  }, [destination]);

  function toggleAccessibilityFilter(value: string) {
    setAccessibilityFilters((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const selectedDestination = destination.trim();

    if (!selectedDestination) return;

    const params = new URLSearchParams({
      from,
      destination: selectedDestination,
      departureDate,
      returnDate,
      travelers: String(travelers),
      budget: String(budget),
      accessibilityProfile,
      accessibilityFilters: accessibilityFilters.join(","),
      multiCity,
      flexibleDates: String(flexibleDates),
      cheapestMonth: String(cheapestMonth),
      nearbyAirports: String(nearbyAirports),
    });

    const recent = JSON.parse(
      window.localStorage.getItem("trippilot:recent-searches") || "[]",
    ) as string[];
    window.localStorage.setItem(
      "trippilot:recent-searches",
      JSON.stringify(
        [
          selectedDestination,
          ...recent.filter((item) => item !== selectedDestination),
        ].slice(0, 5),
      ),
    );

    router.push(`${addLocaleToPath("/search", locale)}?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`grid w-full max-w-full gap-3 rounded-3xl border border-white/40 bg-white/95 p-3 shadow-2xl shadow-slate-950/10 backdrop-blur dark:border-white/10 dark:bg-slate-950/90 ${
        compact
          ? "lg:grid-cols-[1fr_1fr_1fr_1fr_0.8fr_0.8fr_auto]"
          : "md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_0.8fr_0.8fr_auto]"
      }`}
    >
      <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
        {t("from")}
        <span className="relative block">
          <Plane className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className={`${fieldClass} pl-12 pr-10`}
            list="airport-suggestions"
            onChange={(event) => setFrom(event.target.value)}
            value={from}
          />
          <VoiceInputButton onTranscript={setFrom} />
        </span>
      </label>

      <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
        {t("destination")}
        <span className="relative block">
          <MapPin className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className={`${fieldClass} pl-12 pr-10`}
            list="destination-suggestions"
            onChange={(event) => setDestination(event.target.value)}
            placeholder={t("destination")}
            required
            value={destination}
          />
          <VoiceInputButton onTranscript={setDestination} />
        </span>
      </label>

      <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
        {t("departureDate")}
        <span className="relative block">
          <CalendarDays className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className={`${fieldClass} pr-10`}
            onChange={(event) => setDepartureDate(event.target.value)}
            type="date"
            value={departureDate}
          />
        </span>
      </label>

      <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
        {t("returnDate")}
        <input
          className={fieldClass}
          onChange={(event) => setReturnDate(event.target.value)}
          type="date"
          value={returnDate}
        />
      </label>

      <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
        {t("travelers")}
        <span className="relative block">
          <Users className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className={`${fieldClass} pr-10`}
            min="1"
            onChange={(event) => setTravelers(Number(event.target.value))}
            type="number"
            value={travelers}
          />
        </span>
      </label>

      <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
        {t("budget")}
        <span className="relative block">
          <Wallet className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className={`${fieldClass} pr-10`}
            min="100"
            onChange={(event) => setBudget(Number(event.target.value))}
            type="number"
            value={budget}
          />
        </span>
      </label>

      {!compact ? (
        <div className="grid gap-3 md:col-span-2 lg:col-span-7 lg:grid-cols-[1fr_auto_auto_auto]">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
            {t("multiCity")}
            <input
              className={`${fieldClass} pl-12`}
              onChange={(event) => setMultiCity(event.target.value)}
              placeholder={t("multiCityPlaceholder")}
              value={multiCity}
            />
            <span className="relative -mt-12 block h-12">
              <VoiceInputButton onTranscript={setMultiCity} />
            </span>
          </label>
          {[
            [t("flexibleDates"), flexibleDates, setFlexibleDates],
            [t("cheapestMonth"), cheapestMonth, setCheapestMonth],
            [t("nearbyAirports"), nearbyAirports, setNearbyAirports],
          ].map(([label, checked, setChecked]) => (
            <label
              key={label as string}
              className="mt-6 flex min-h-12 items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 dark:bg-white/10 dark:text-slate-200"
            >
              <input
                checked={checked as boolean}
                onChange={(event) =>
                  (setChecked as (value: boolean) => void)(event.target.checked)
                }
                type="checkbox"
              />
              {label as string}
            </label>
          ))}
          <div className="grid gap-3 md:col-span-2 lg:col-span-4">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
              {t("accessibilityType")}
              <span className="relative block">
                <Accessibility className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  className={`${fieldClass} pr-10`}
                  onChange={(event) =>
                    setAccessibilityProfile(event.target.value as AccessibilityProfile)
                  }
                  value={accessibilityProfile}
                >
                  {accessibilityProfiles.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </span>
            </label>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {accessibilityOptions.map(([value, label]) => (
                <label
                  key={value}
                  className="flex min-h-12 items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-900 dark:bg-emerald-400/10 dark:text-emerald-100"
                >
                  <input
                    checked={accessibilityFilters.includes(value)}
                    onChange={() => toggleAccessibilityFilter(value)}
                    type="checkbox"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <button
        type="submit"
        className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:bg-sky-600 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400"
      >
        <Search className="h-4 w-4" />
        {t("submit")}
      </button>
      <datalist id="airport-suggestions">
        {airportSuggestions.map((item) => (
          <option key={item.code} value={item.code}>
            {item.label}
          </option>
        ))}
      </datalist>
      <datalist id="destination-suggestions">
        {destinationSuggestions.map((item) => (
          <option key={`${item.source ?? "local"}-${item.value}`} value={item.value}>
            {item.label}
          </option>
        ))}
        {trendingDestinations.map((item) => (
          <option key={`trending-${item}`} value={item} />
        ))}
      </datalist>
    </form>
  );
}
