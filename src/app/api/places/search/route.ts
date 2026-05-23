import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getGoogleMapsApiKey,
  isMockMode,
  logMockMode,
  validateProductionRuntimeEnv,
} from "@/lib/env";
import type { ApiPlaceResult } from "@/services/api/places";
import { getMapUrl } from "@/services/api/maps";

const searchSchema = z.object({
  destination: z.string().min(1),
  category: z.string().min(1),
  query: z.string().optional(),
  preferences: z.unknown().optional(),
  replacementPreference: z.string().optional(),
});

type GooglePlace = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  rating?: number;
  priceLevel?: string;
  regularOpeningHours?: { weekdayDescriptions?: string[]; openNow?: boolean };
  types?: string[];
  photos?: Array<{ name?: string }>;
};

function buildSearchText(payload: z.infer<typeof searchSchema>) {
  const preferenceText = payload.replacementPreference
    ? ` ${payload.replacementPreference}`
    : "";

  return `${payload.category} ${payload.query ?? ""} ${payload.destination}${preferenceText}`;
}

function priceLabel(priceLevel?: string) {
  if (!priceLevel || priceLevel === "PRICE_LEVEL_UNSPECIFIED") return "מחיר משתנה";
  if (priceLevel === "PRICE_LEVEL_INEXPENSIVE") return "עלות נמוכה";
  if (priceLevel === "PRICE_LEVEL_MODERATE") return "עלות בינונית";
  if (priceLevel === "PRICE_LEVEL_EXPENSIVE") return "עלות גבוהה";
  return "עלות פרימיום";
}

function openingHoursLabel(place: GooglePlace) {
  if (place.regularOpeningHours?.weekdayDescriptions?.length) {
    return place.regularOpeningHours.weekdayDescriptions.slice(0, 2).join(" · ");
  }

  if (typeof place.regularOpeningHours?.openNow === "boolean") {
    return place.regularOpeningHours.openNow ? "פתוח עכשיו" : "סגור כרגע";
  }

  return "יש לאמת שעות פתיחה מראש";
}

function normalizePlace(place: GooglePlace, category: string): ApiPlaceResult {
  const name = place.displayName?.text || "מקום מומלץ";
  const address = place.formattedAddress;

  return {
    placeId: place.id,
    name,
    description: address
      ? `${name} באזור ${address}. מתאים למסלול לפי סוג הפעילות שנבחר, עם דירוגים ומידע ממפות Google.`
      : `${name} מתאים למסלול לפי סוג הפעילות שנבחר. מומלץ לאמת פרטים לפני ההגעה.`,
    address,
    rating: place.rating,
    estimatedPrice: priceLabel(place.priceLevel),
    openingHours: openingHoursLabel(place),
    category: category as ApiPlaceResult["category"],
    photoNames: place.photos?.map((photo) => photo.name || "").filter(Boolean),
    mapUrl: getMapUrl(name, place.id),
  };
}

export async function POST(request: Request) {
  validateProductionRuntimeEnv();
  const apiKey = getGoogleMapsApiKey();

  if (isMockMode()) {
    logMockMode("Places API route returned no real places because mock mode is enabled.");
    return NextResponse.json({ places: [], source: "mock" });
  }

  if (!apiKey) {
    return NextResponse.json({ places: [], source: "mock", warning: "Missing GOOGLE_MAPS_API_KEY" });
  }

  try {
    const payload = searchSchema.parse(await request.json());

    // TODO: Add Places API caching, quota protection and provider failover.
    const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.rating,places.priceLevel,places.regularOpeningHours,places.types,places.photos",
      },
      body: JSON.stringify({
        textQuery: buildSearchText(payload),
        languageCode: "he",
        maxResultCount: 4,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ places: [], source: "fallback" });
    }

    const data = (await response.json()) as { places?: GooglePlace[] };
    const places = (data.places ?? []).map((place) =>
      normalizePlace(place, payload.category),
    );

    return NextResponse.json({ places, source: "google" });
  } catch {
    return NextResponse.json({ places: [], source: "fallback" });
  }
}
