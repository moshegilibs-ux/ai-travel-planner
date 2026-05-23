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

export async function getFlights(input: FlightSearchInput) {
  if (isPublicMockMode()) {
    logPublicMockMode("Flight search is using mock flights because NEXT_PUBLIC_USE_MOCK_DATA is not false.");
    return generateMockFlights(input);
  }

  try {
    const response = await fetch("/api/flights/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error("Flight API route failed");
    }

    const data = (await response.json()) as {
      flights?: FlightDeal[];
    };

    return data.flights?.length ? data.flights : generateMockFlights(input);
  } catch {
    // TODO: Add user-facing provider status when a production Flight API fails.
    logPublicMockMode("Flight API failed, falling back to mock flights.");
    return generateMockFlights(input);
  }
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
