import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { searchTravel } from "@/lib/amadeus";
import { authOptions } from "@/lib/next-auth";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { apiError } from "@/lib/api-response";
import type { TravelSearchRequest } from "@/types/travel-marketplace";

export async function GET(request: Request) {
  const limited = limitSearch(request);

  if (!limited.ok) {
    return apiError("Too many requests.", 429, "RATE_LIMITED");
  }

  const params = new URL(request.url).searchParams;
  const payload = parseSearchParams(params);
  const validation = travelSearchSchema.safeParse(payload);

  if (!validation.success) {
    return apiError(
      validation.error.issues[0]?.message || "Invalid search request.",
      400,
      "VALIDATION_ERROR",
    );
  }

  try {
    const results = await searchTravel(validation.data);
    await saveSearchHistory(validation.data, results.deals.length);
    return NextResponse.json(results);
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Unable to complete travel search.",
      500,
      "SEARCH_FAILED",
    );
  }
}

export async function POST(request: Request) {
  const limited = limitSearch(request);

  if (!limited.ok) {
    return apiError("Too many requests.", 429, "RATE_LIMITED");
  }

  let payload: TravelSearchRequest;

  try {
    payload = (await request.json()) as TravelSearchRequest;
  } catch {
    return apiError("Invalid JSON body.", 400, "INVALID_JSON");
  }

  const validation = travelSearchSchema.safeParse(payload);

  if (!validation.success) {
    return apiError(
      validation.error.issues[0]?.message || "Invalid search request.",
      400,
      "VALIDATION_ERROR",
    );
  }

  try {
    const results = await searchTravel(validation.data);
    await saveSearchHistory(validation.data, results.deals.length);
    return NextResponse.json(results);
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Unable to complete travel search.",
      500,
      "SEARCH_FAILED",
    );
  }
}

const travelSearchSchema = z.object({
  origin: z.string().min(1, "origin is required."),
  destination: z.string().min(1, "destination is required."),
  departureDate: z.string().min(1, "departureDate is required."),
  returnDate: z.string().optional(),
  adults: z.number().int().min(1, "adults must be at least 1."),
  budget: z.number().min(0, "budget must be a positive number."),
  accessibilityProfile: z
    .enum(["none", "wheelchair", "walker", "mobility-scooter", "senior", "young-children"])
    .optional(),
  accessibilityFilters: z.array(z.string()).optional(),
  multiCity: z.string().optional(),
  flexibleDates: z.boolean().optional(),
  cheapestMonth: z.boolean().optional(),
  nearbyAirports: z.boolean().optional(),
});

function parseSearchParams(params: URLSearchParams): TravelSearchRequest {
  return {
    origin: params.get("origin") || params.get("from") || "",
    destination: params.get("destination") || "",
    departureDate: params.get("departureDate") || "",
    returnDate: params.get("returnDate") || "",
    adults: Number(params.get("adults") || params.get("travelers") || 1),
    budget: Number(params.get("budget") || 0),
    accessibilityProfile:
      (params.get("accessibilityProfile") as TravelSearchRequest["accessibilityProfile"]) ||
      undefined,
    accessibilityFilters:
      params
        .get("accessibilityFilters")
        ?.split(",")
        .map((item) => item.trim())
        .filter(Boolean) || [],
    multiCity: params.get("multiCity") || undefined,
    flexibleDates: params.get("flexibleDates") === "true",
    cheapestMonth: params.get("cheapestMonth") === "true",
    nearbyAirports: params.get("nearbyAirports") === "true",
  };
}

function limitSearch(request: Request) {
  return rateLimit({
    key: `search:${request.headers.get("x-forwarded-for") || "local"}`,
    limit: 60,
  });
}

async function saveSearchHistory(
  query: TravelSearchRequest,
  results: number,
) {
  if (!isDatabaseConfigured()) {
    return;
  }

  const session = await getServerSession(authOptions);

  await prisma.searchHistory.create({
    data: {
      userId: session?.user?.id || null,
      query: query as unknown as Prisma.InputJsonValue,
      results,
    },
  });
}
