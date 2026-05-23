import { NextResponse } from "next/server";
import { airportSuggestions, trendingDestinations } from "@/data/search-suggestions";

export function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.toLowerCase() || "";
  const airports = airportSuggestions.filter((item) =>
    `${item.code} ${item.label} ${item.city}`.toLowerCase().includes(query),
  );
  const destinations = trendingDestinations.filter((item) =>
    item.toLowerCase().includes(query),
  );

  return NextResponse.json({
    airports: airports.slice(0, 8),
    destinations: destinations.slice(0, 8),
    trending: trendingDestinations,
  });
}
