import type { CustomItineraryDay, CustomItineraryInput } from "@/lib/generate-itinerary";
import type { HotelDeal } from "@/types/travel-marketplace";

export type SavedItinerary = CustomItineraryInput & {
  id: string;
  itinerary: CustomItineraryDay[];
  createdAt: string;
  // The real hotel the traveler selected for this itinerary (marketplace shape).
  // Parallels the existing selectedFlight on CustomItineraryInput.
  selectedHotel?: HotelDeal | null;
};

const storageKey = "travel-saved-itineraries";

export function createSavedItinerary(
  input: CustomItineraryInput,
  itinerary: CustomItineraryDay[],
  selectedHotel?: HotelDeal | null,
): SavedItinerary {
  return {
    ...input,
    id: `${input.destination}-${input.days}-${Date.now()}`,
    itinerary,
    createdAt: new Date().toISOString(),
    selectedHotel: selectedHotel ?? null,
  };
}

export function getSavedItineraries(): SavedItinerary[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(storageKey);
  return raw ? (JSON.parse(raw) as SavedItinerary[]) : [];
}

export function saveItineraries(items: SavedItinerary[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey, JSON.stringify(items));
}

export function removeSavedItinerary(id: string) {
  const next = getSavedItineraries().filter((item) => item.id !== id);
  saveItineraries(next);
  return next;
}
