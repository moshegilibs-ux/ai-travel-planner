import type {
  CustomItineraryDay,
  CustomItineraryInput,
} from "@/lib/generate-itinerary";

export type SavedItinerary = CustomItineraryInput & {
  id: string;
  createdAt: string;
  itinerary: CustomItineraryDay[];
};

const storageKey = "ai-travel-planner:saved-itineraries";

export function getGuestSavedItinerariesKey() {
  return storageKey;
}

export function createSavedItinerary(
  input: CustomItineraryInput,
  itinerary: CustomItineraryDay[],
): SavedItinerary {
  return {
    ...input,
    id: `${input.destination}-${input.days}-${input.budget}-${input.tripType}-${input.selectedFlight?.flightNumber ?? "no-flight"}`.toLowerCase(),
    createdAt: new Date().toISOString(),
    itinerary,
  };
}

export function getSavedItineraries() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const value = window.localStorage.getItem(storageKey);
    return value ? (JSON.parse(value) as SavedItinerary[]) : [];
  } catch {
    return [];
  }
}

export function saveItineraries(itineraries: SavedItinerary[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(itineraries));
}

export function removeSavedItinerary(id: string) {
  const nextItineraries = getSavedItineraries().filter(
    (itinerary) => itinerary.id !== id,
  );
  saveItineraries(nextItineraries);
  return nextItineraries;
}
