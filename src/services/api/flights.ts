import {
  FlightDeal,
  FlightFilters,
  FlightSearchInput,
  FlightSortOption,
  FlightTimeFilter,
  filterAndSortFlights,
  formatFlightDuration,
  getAvailableAirlines,
} from "@/lib/mock-flights";

export type {
  FlightDeal,
  FlightFilters,
  FlightSearchInput,
  FlightSortOption,
  FlightTimeFilter,
};

export type FlightSearchResult = {
  flights: FlightDeal[];
  source: "amadeus" | "mock" | "fallback" | "unavailable" | "error";
  warning?: string;
  error?: string;
};

export async function searchFlights(input: FlightSearchInput): Promise<FlightSearchResult> {
  // Real flights come only from the Amadeus-backed API route. No mock fallback —
  // when the provider is unavailable the route returns an explicit unavailable
  // state and we surface it as-is (never fabricated prices).
  try {
    const response = await fetch("/api/flights/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    const data = (await response.json()) as {
      flights?: FlightDeal[];
      source?: FlightSearchResult["source"];
      warning?: string;
      error?: { message?: string };
    };

    if (!response.ok) {
      return {
        flights: [],
        source: "error",
        error: data.error?.message || "שגיאה בחיפוש טיסות.",
      };
    }

    return {
      flights: data.flights ?? [],
      source: data.source ?? "unavailable",
      warning: data.warning,
    };
  } catch {
    return {
      flights: [],
      source: "error",
      error: "שגיאה בחיפוש טיסות. נסו שוב בעוד רגע.",
    };
  }
}

export async function getFlights(input: FlightSearchInput) {
  return (await searchFlights(input)).flights;
}

export function sortAndFilterFlights(
  flights: FlightDeal[],
  filters: FlightFilters,
) {
  return filterAndSortFlights(flights, filters);
}

export function getFlightAirlines(flights: FlightDeal[]) {
  return getAvailableAirlines(flights);
}

export { formatFlightDuration };
