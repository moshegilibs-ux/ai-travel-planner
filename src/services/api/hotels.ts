import type { HotelDeal } from "@/types/travel-marketplace";

export type { HotelDeal };

export type HotelSearchInput = {
  destination: string;
  checkInDate?: string;
  checkOutDate?: string;
  adults?: number;
  budget?: number;
};

export type HotelSearchResult = {
  hotels: HotelDeal[];
  source: "amadeus" | "unavailable" | "error";
  warning?: string;
  error?: string;
};

/**
 * Real hotels come only from the Amadeus-backed API route. There is no mock
 * fallback — when the provider is unavailable the route returns an explicit
 * unavailable state which we surface as-is (never fabricated prices).
 */
export async function searchHotels(
  input: HotelSearchInput,
): Promise<HotelSearchResult> {
  try {
    const response = await fetch("/api/hotels/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    const data = (await response.json()) as {
      hotels?: HotelDeal[];
      source?: HotelSearchResult["source"];
      warning?: string;
    };

    if (!response.ok) {
      return {
        hotels: [],
        source: "error",
        error: data.warning || "שגיאה בחיפוש מלונות.",
      };
    }

    return {
      hotels: data.hotels ?? [],
      source: data.source ?? "unavailable",
      warning: data.warning,
    };
  } catch {
    return {
      hotels: [],
      source: "error",
      error: "שגיאה בחיפוש מלונות. נסו שוב בעוד רגע.",
    };
  }
}
