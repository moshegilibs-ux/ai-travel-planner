import {
  FlightDeal,
  FlightFilters,
  FlightSearchInput,
  FlightSortOption,
  FlightTimeFilter,
  filterAndSortFlights,
  formatFlightDuration,
  generateMockFlights,
  getAvailableAirlines,
} from "@/lib/mock-flights";
import { isPublicMockMode, logPublicMockMode } from "@/lib/public-env";

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
  if (isPublicMockMode()) {
    logPublicMockMode("Flight search is using mock flights because NEXT_PUBLIC_USE_MOCK_DATA is not false.");
    return {
      flights: generateMockFlights(input),
      source: "mock",
      warning: "מצב פיתוח פעיל. מחירי הטיסות אינם נתוני ספק מאומתים.",
    };
  }

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
