import { NextResponse } from "next/server";
import {
  airportSuggestions,
  trendingDestinations,
  worldDestinationSuggestions,
} from "@/data/search-suggestions";

type MapboxFeature = {
  place_name?: string;
  text?: string;
  center?: [number, number];
  place_type?: string[];
};

type MapboxResponse = {
  features?: MapboxFeature[];
};

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.toLowerCase() || "";
  const airports = airportSuggestions.filter((item) =>
    `${item.code} ${item.label} ${item.city}`.toLowerCase().includes(query),
  );
  const localDestinations = worldDestinationSuggestions.filter((item) =>
    item.toLowerCase().includes(query),
  );
  const mapboxDestinations = await getMapboxDestinations(query);
  const destinations = [
    ...mapboxDestinations,
    ...localDestinations.map((item) => ({ label: item, value: item, source: "local" })),
  ].filter(
    (item, index, items) =>
      items.findIndex((candidate) => candidate.value === item.value) === index,
  );

  return NextResponse.json({
    airports: airports.slice(0, 8),
    destinations: destinations.slice(0, 8),
    trending: trendingDestinations,
  });
}

async function getMapboxDestinations(query: string) {
  const token =
    process.env.MAPBOX_ACCESS_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  if (!token || query.length < 2) {
    return [];
  }

  try {
    const params = new URLSearchParams({
      access_token: token,
      autocomplete: "true",
      language: "he,en",
      limit: "6",
      types: "place,country,region",
    });
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        query,
      )}.json?${params.toString()}`,
      { next: { revalidate: 86_400 } },
    );

    if (!response.ok) return [];

    const payload = (await response.json()) as MapboxResponse;

    return (payload.features ?? []).map((feature) => ({
      label: feature.place_name || feature.text || "",
      value: feature.place_name || feature.text || "",
      coordinates: feature.center,
      type: feature.place_type?.[0] || "place",
      source: "mapbox",
    }));
  } catch {
    return [];
  }
}
