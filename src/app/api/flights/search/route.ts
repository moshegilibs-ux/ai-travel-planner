import { NextResponse } from "next/server";
import { z } from "zod";
import { fetchWithRetry } from "@/lib/external-api";
import {
  getAmadeusBaseUrl,
  getAmadeusCredentials,
  isMockMode,
  logMockMode,
} from "@/lib/env";
import type { FlightDeal, FlightSearchInput } from "@/services/api/flights";
import { generateMockFlights } from "@/lib/mock-flights";

const searchSchema = z.object({
  origin: z.string().min(1),
  destination: z.string().min(1),
  departureDate: z.string().optional(),
  returnDate: z.string().optional(),
  adults: z.number().int().min(1).max(9).optional(),
});

type AmadeusTokenResponse = {
  access_token: string;
  expires_in: number;
};

type AmadeusSegment = {
  carrierCode?: string;
  number?: string;
  departure?: {
    iataCode?: string;
    at?: string;
  };
  arrival?: {
    iataCode?: string;
    at?: string;
  };
};

type AmadeusFlightOffer = {
  id: string;
  validatingAirlineCodes?: string[];
  price?: {
    total?: string;
  };
  itineraries?: Array<{
    duration?: string;
    segments?: AmadeusSegment[];
  }>;
};

type AmadeusFlightResponse = {
  data?: AmadeusFlightOffer[];
};

const amadeusBaseUrl = getAmadeusBaseUrl();

const locationCodeMap: Record<string, string> = {
  "tel aviv": "TLV",
  telaviv: "TLV",
  tlv: "TLV",
  paris: "PAR",
  par: "PAR",
  rome: "ROM",
  barcelona: "BCN",
  amsterdam: "AMS",
  london: "LON",
  dubai: "DXB",
  bangkok: "BKK",
  thailand: "BKK",
  greece: "ATH",
  athens: "ATH",
  ath: "ATH",
};

let cachedToken: {
  accessToken: string;
  expiresAt: number;
} | null = null;

function normalizeLocationCode(value: string) {
  const cleanValue = value.trim();
  const mapped = locationCodeMap[cleanValue.toLowerCase()];

  if (mapped) return mapped;
  return cleanValue.slice(0, 3).toUpperCase();
}

function getDefaultDate(daysFromNow: number) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().slice(0, 10);
}

async function getAmadeusAccessToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.accessToken;
  }

  const { clientId, clientSecret } = getAmadeusCredentials();

  if (!clientId || !clientSecret) {
    throw new Error("Missing Amadeus credentials");
  }

  const response = await fetchWithRetry(
    `${amadeusBaseUrl}/v1/security/oauth2/token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      }),
      cache: "no-store",
    },
    { retries: 2, timeoutMs: 8_000 },
  );

  if (!response.ok) {
    throw new Error(`Amadeus auth failed with status ${response.status}`);
  }

  const token = (await response.json()) as AmadeusTokenResponse;

  cachedToken = {
    accessToken: token.access_token,
    expiresAt: Date.now() + token.expires_in * 1000,
  };

  return token.access_token;
}

function formatTime(value?: string) {
  if (!value) return "--:--";

  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

function isoDurationToMinutes(value?: string) {
  const match = value?.match(/P(?:\d+D)?T(?:(\d+)H)?(?:(\d+)M)?/);

  if (!match) return 0;

  return Number(match[1] || 0) * 60 + Number(match[2] || 0);
}

function getAirlineRating(airline: string) {
  const ratings: Record<string, number> = {
    LY: 4.4,
    A3: 4.5,
    W6: 4.0,
    FR: 3.9,
    LH: 4.6,
    BA: 4.3,
    AF: 4.4,
    KL: 4.5,
  };

  return ratings[airline] ?? 4.2;
}

function normalizeOffer(
  offer: AmadeusFlightOffer,
  input: FlightSearchInput,
): FlightDeal | null {
  const outbound = offer.itineraries?.[0];
  const returnTrip = offer.itineraries?.[1];
  const segments = outbound?.segments ?? [];
  const firstSegment = segments[0];
  const lastSegment = segments[segments.length - 1];

  if (!firstSegment?.departure?.at || !lastSegment?.arrival?.at) {
    return null;
  }

  const airline =
    offer.validatingAirlineCodes?.[0] || firstSegment.carrierCode || "Unknown";
  const flightNumber = `${firstSegment.carrierCode || airline}${firstSegment.number || offer.id}`;
  const returnSegments = returnTrip?.segments ?? [];
  const returnFirst = returnSegments[0];
  const returnLast = returnSegments[returnSegments.length - 1];

  return {
    id: `amadeus-${offer.id}`,
    airline,
    logoText: airline.slice(0, 2).toUpperCase(),
    flightNumber,
    departureTime: formatTime(firstSegment.departure.at),
    arrivalTime: formatTime(lastSegment.arrival.at),
    returnDepartureTime: formatTime(returnFirst?.departure?.at),
    returnArrivalTime: formatTime(returnLast?.arrival?.at),
    durationMinutes: isoDurationToMinutes(outbound?.duration),
    originAirport:
      firstSegment.departure.iataCode || normalizeLocationCode(input.origin),
    destinationAirport:
      lastSegment.arrival.iataCode || normalizeLocationCode(input.destination),
    isDirect: segments.length <= 1,
    stops: Math.max(0, segments.length - 1),
    estimatedPrice: Math.round(Number(offer.price?.total || 0)),
    baggageIncluded: "כבודה לפי תנאי הכרטיס, יש לאמת לפני הזמנה",
    airlineRating: getAirlineRating(airline),
    notes: [
      segments.length <= 1 ? "טיסה ישירה" : `${segments.length - 1} עצירות`,
      "נתוני Amadeus חיים, יש לאמת כבודה ושינויים לפני רכישה",
    ],
  };
}

async function searchAmadeusFlights(input: FlightSearchInput) {
  const accessToken = await getAmadeusAccessToken();
  const query = new URLSearchParams({
    originLocationCode: normalizeLocationCode(input.origin),
    destinationLocationCode: normalizeLocationCode(input.destination),
    departureDate: input.departureDate || getDefaultDate(35),
    adults: String(input.adults || 1),
    currencyCode: "USD",
    max: "10",
  });

  if (input.returnDate) {
    query.set("returnDate", input.returnDate);
  }

  // TODO: Add nearby airport search, flexible dates and fare rules enrichment.
  const response = await fetchWithRetry(
    `${amadeusBaseUrl}/v2/shopping/flight-offers?${query.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    },
    { retries: 2, timeoutMs: 12_000 },
  );

  if (!response.ok) {
    throw new Error(`Amadeus flight search failed with status ${response.status}`);
  }

  const result = (await response.json()) as AmadeusFlightResponse;

  return (result.data ?? [])
    .map((offer) => normalizeOffer(offer, input))
    .filter((flight): flight is FlightDeal => Boolean(flight))
    .filter((flight) => flight.estimatedPrice > 0)
    .sort((a, b) => a.estimatedPrice - b.estimatedPrice);
}

function mockResponse(input: FlightSearchInput, warning?: string) {
  return NextResponse.json({
    flights: generateMockFlights(input),
    source: warning ? "fallback" : "mock",
    warning,
  });
}

export async function POST(request: Request) {
  const validation = searchSchema.safeParse(await request.json().catch(() => null));

  if (!validation.success) {
    return NextResponse.json(
      {
        flights: [],
        source: "error",
        warning: "בקשת חיפוש טיסות לא תקינה.",
      },
      { status: 400 },
    );
  }

  const input = validation.data;

  if (isMockMode()) {
    logMockMode("Flights API route returned mock data because mock mode is enabled.");
    return mockResponse(input);
  }

  try {
    const flights = await searchAmadeusFlights(input);

    if (!flights.length) {
      return NextResponse.json({
        flights: [],
        source: "unavailable",
        warning: "לא נמצאו טיסות",
      });
    }

    return NextResponse.json({ flights, source: "amadeus" });
  } catch {
    return NextResponse.json({
      flights: [],
      source: "unavailable",
      warning: "טיסות לא זמינות כרגע",
    });
  }
}
