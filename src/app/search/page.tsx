import { AppHeader } from "@/components/app-header";
import { SearchResultsView } from "@/components/search-results-view";
import { getShortTermRentals } from "@/data/short-term-rentals";
import { searchTravel } from "@/lib/amadeus";
import type { SearchParams } from "@/types/travel-marketplace";
import type { Metadata } from "next";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const params = await searchParams;
  const destination = getParam(params.destination) || "Travel";

  return {
    title: `${destination} | טיולים וחלומות`,
    description: `השוואת טיסות, מלונות ומסלולים נגישים עבור ${destination}.`,
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query: SearchParams = {
    from: getParam(params.from) || "Tel Aviv",
    destination: getParam(params.destination) || "Barcelona",
    departureDate: getParam(params.departureDate) || "2026-06-10",
    returnDate: getParam(params.returnDate) || "2026-06-15",
    travelers: toFiniteNumber(getParam(params.travelers), 2, 1),
    budget: toFiniteNumber(getParam(params.budget), 1600, 0),
    accessibilityProfile:
      (getParam(params.accessibilityProfile) as SearchParams["accessibilityProfile"]) ||
      "senior",
    accessibilityFilters:
      getParam(params.accessibilityFilters)
        ?.split(",")
        .map((item) => item.trim())
        .filter(Boolean) || [],
    multiCity: getParam(params.multiCity),
    flexibleDates: getParam(params.flexibleDates) === "true",
    cheapestMonth: getParam(params.cheapestMonth) === "true",
    nearbyAirports: getParam(params.nearbyAirports) === "true",
  };

  const results = await searchTravel({
    origin: query.from,
    destination: query.destination,
    departureDate: query.departureDate,
    returnDate: query.returnDate,
    adults: query.travelers,
    budget: query.budget,
    accessibilityProfile: query.accessibilityProfile,
    accessibilityFilters: query.accessibilityFilters,
    multiCity: query.multiCity,
    flexibleDates: query.flexibleDates,
    cheapestMonth: query.cheapestMonth,
    nearbyAirports: query.nearbyAirports,
  });
  const rentals = getShortTermRentals(query.destination);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <AppHeader />
      <SearchResultsView
        destination={query.destination}
        flights={results.flights}
        hotels={results.hotels}
        rentals={rentals}
        deals={results.deals}
        warning={results.warning}
        warnings={results.warnings}
      />
    </div>
  );
}

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

// Coerce a query value to a finite number. Non-numeric input (e.g. a budget
// "level" label like "Comfort") falls back to a safe default instead of NaN.
function toFiniteNumber(value: string | undefined, fallback: number, min = 0) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.max(min, parsed);
}
