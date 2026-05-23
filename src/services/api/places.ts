import {
  CustomItineraryInput,
  ItineraryPlace,
  RecommendationCategory,
  ReplacementPreference,
  createAlternativePlace,
} from "@/lib/generate-itinerary";
import { isPublicMockMode, logPublicMockMode } from "@/lib/public-env";
import { getPlaceImages } from "@/services/api/images";
import { getMapUrl } from "@/services/api/maps";

export type PlaceSearchInput = {
  destination: string;
  category: RecommendationCategory;
  query?: string;
  preferences?: CustomItineraryInput["preferences"];
  replacementPreference?: ReplacementPreference;
};

export type ApiPlaceResult = {
  placeId?: string;
  name: string;
  description: string;
  address?: string;
  rating?: number;
  estimatedPrice?: string;
  openingHours?: string;
  category: RecommendationCategory;
  photoNames?: string[];
  mapUrl?: string;
};

export function getPlaces(dayPlaces: ItineraryPlace[] = []) {
  // TODO: Enrich itinerary places with cached Places API details before rendering.
  return dayPlaces;
}

export async function searchPlaces(input: PlaceSearchInput) {
  // TODO: Add server-side caching and provider normalization for Google/Tripadvisor/etc.
  try {
    const response = await fetch("/api/places/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!response.ok) return [];

    const data = (await response.json()) as { places?: ApiPlaceResult[] };
    return data.places ?? [];
  } catch {
    return [];
  }
}

export async function replacePlace({
  place,
  input,
  preference,
}: {
  place: ItineraryPlace;
  input: CustomItineraryInput;
  preference: ReplacementPreference;
}) {
  const fallbackPlace = createAlternativePlace(place, input, preference);

  if (isPublicMockMode()) {
    logPublicMockMode("Place replacement is using mock places because NEXT_PUBLIC_USE_MOCK_DATA is not false.");
    return fallbackPlace;
  }

  const [apiPlace] = await searchPlaces({
    destination: input.destination,
    category: place.category,
    query: place.name,
    preferences: input.preferences,
    replacementPreference: preference,
  });

  if (!apiPlace) {
    return fallbackPlace;
  }

  const images = getPlaceImages(place.name.length, apiPlace.photoNames);
  const placeName = `${apiPlace.name} · ${input.destination}`;

  return {
    ...fallbackPlace,
    name: placeName,
    shortDescription: apiPlace.description || fallbackPlace.shortDescription,
    detailedDescription: apiPlace.description || fallbackPlace.detailedDescription,
    openingHours: apiPlace.openingHours || fallbackPlace.openingHours,
    estimatedPrice: apiPlace.estimatedPrice || fallbackPlace.estimatedPrice,
    rating: apiPlace.rating || fallbackPlace.rating,
    image: images.image,
    gallery: images.gallery,
    mapUrl: apiPlace.mapUrl || getMapUrl(apiPlace.name, apiPlace.placeId),
    address: apiPlace.address,
    placeId: apiPlace.placeId,
  };
}
