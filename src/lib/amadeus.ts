import mockResults from "@/data/mock-travel-results.json";
import { fetchWithRetry } from "@/lib/external-api";
import {
  getAmadeusBaseUrl,
  getAmadeusCredentials,
  hasAmadeus,
  isMockMode,
  logMockMode,
} from "@/lib/env";
import { buildBudgetBreakdown, validateBudgetBreakdown } from "@/lib/budget";
import type {
  FlightDeal,
  HotelDeal,
  SearchParams,
  TravelSearchRequest,
  TravelSearchResponse,
  TripDeal,
} from "@/types/travel-marketplace";

type MockResults = {
  flights: FlightDeal[];
  hotels: HotelDeal[];
};

type AmadeusTokenResponse = {
  access_token: string;
  expires_in: number;
};

type AmadeusFlightOffer = {
  id: string;
  validatingAirlineCodes?: string[];
  price?: {
    total?: string;
    currency?: string;
  };
  itineraries?: Array<{
    duration?: string;
    segments?: Array<{
      carrierCode?: string;
      departure?: {
        iataCode?: string;
        at?: string;
      };
      arrival?: {
        iataCode?: string;
        at?: string;
      };
    }>;
  }>;
};

type AmadeusFlightOffersResponse = {
  data?: AmadeusFlightOffer[];
};

type AmadeusHotelListItem = {
  hotelId?: string;
  name?: string;
  iataCode?: string;
  geoCode?: {
    latitude?: number;
    longitude?: number;
  };
  address?: {
    countryCode?: string;
  };
};

type AmadeusHotelListResponse = {
  data?: AmadeusHotelListItem[];
};

type AmadeusHotelOffer = {
  hotel?: {
    hotelId?: string;
    name?: string;
    rating?: string;
    cityCode?: string;
  };
  available?: boolean;
  offers?: Array<{
    price?: {
      total?: string;
      base?: string;
      currency?: string;
    };
  }>;
};

type AmadeusHotelOffersResponse = {
  data?: AmadeusHotelOffer[];
};

type ProviderMode = "amadeus" | "mock" | "unavailable";

const data = mockResults as MockResults;
const amadeusBaseUrl = getAmadeusBaseUrl();

let cachedToken: {
  accessToken: string;
  expiresAt: number;
} | null = null;

const locationCodeMap: Record<string, string> = {
  "tel aviv": "TLV",
  telaviv: "TLV",
  tlv: "TLV",
  paris: "PAR",
  par: "PAR",
  rome: "ROM",
  rma: "ROM",
  barcelona: "BCN",
  bcn: "BCN",
  amsterdam: "AMS",
  ams: "AMS",
  london: "LON",
  lon: "LON",
  dubai: "DXB",
  dxb: "DXB",
  bangkok: "BKK",
  bkk: "BKK",
  thailand: "BKK",
  greece: "ATH",
  athens: "ATH",
  ath: "ATH",
};

export function isAmadeusConfigured() {
  return hasAmadeus();
}

export function toTravelSearchRequest(params: SearchParams): TravelSearchRequest {
  return {
    origin: params.from,
    destination: params.destination,
    departureDate: params.departureDate,
    returnDate: params.returnDate,
    adults: params.travelers,
    budget: params.budget,
    accessibilityProfile: params.accessibilityProfile,
    accessibilityFilters: params.accessibilityFilters,
  };
}

export function toSearchParams(params: TravelSearchRequest): SearchParams {
  return {
    from: params.origin,
    destination: params.destination,
    departureDate: params.departureDate,
    returnDate: params.returnDate || "",
    travelers: params.adults,
    budget: params.budget,
    accessibilityProfile: params.accessibilityProfile,
    accessibilityFilters: params.accessibilityFilters,
    multiCity: params.multiCity,
    flexibleDates: params.flexibleDates,
    cheapestMonth: params.cheapestMonth,
    nearbyAirports: params.nearbyAirports,
  };
}

export async function searchTravel(
  params: TravelSearchRequest,
): Promise<TravelSearchResponse> {
  const searchParams = toSearchParams(params);
  const nights = Math.max(
    1,
    getTripNights(searchParams.departureDate, searchParams.returnDate),
  );

  const [flightResult, hotelResult] = await Promise.all([
    searchFlightsWithMode(searchParams),
    searchHotelsWithMode(searchParams),
  ]);
  const deals = buildTripDeals({
    flights: flightResult.flights,
    hotels: hotelResult.hotels,
    params: searchParams,
    nights,
  });

  return {
    flights: flightResult.flights,
    hotels: hotelResult.hotels,
    deals,
    mode:
      flightResult.mode === "amadeus" || hotelResult.mode === "amadeus"
        ? "amadeus"
        : flightResult.mode === "mock" || hotelResult.mode === "mock"
          ? "mock"
          : "unavailable",
    warning: [flightResult.warning, hotelResult.warning].filter(Boolean).join(" "),
    warnings: {
      flights: flightResult.warning,
      hotels: hotelResult.warning,
    },
  };
}

export async function searchFlights(params: SearchParams): Promise<FlightDeal[]> {
  return (await searchFlightsWithMode(params)).flights;
}

async function searchFlightsWithMode(params: SearchParams): Promise<{
  flights: FlightDeal[];
  mode: ProviderMode;
  warning?: string;
}> {
  if (isMockMode()) {
    logMockMode("Flight search is using development mock data because mock mode is enabled.");
    return {
      flights: getMockFlights(params),
      mode: "mock",
      warning: "מצב פיתוח פעיל. מחירי הטיסות אינם נתוני ספק מאומתים.",
    };
  }

  if (!isAmadeusConfigured()) {
    return {
      flights: [],
      mode: "unavailable",
      warning: "טיסות לא זמינות כרגע",
    };
  }

  try {
    const flights = await searchAmadeusFlights(params);

    if (flights.length === 0) {
      return {
        flights: [],
        mode: "unavailable",
        warning: "טיסות לא זמינות כרגע",
      };
    }

    return { flights, mode: "amadeus" };
  } catch (error) {
    return {
      flights: [],
      mode: "unavailable",
      warning:
        error instanceof Error
          ? `Amadeus search failed: ${error.message}.`
          : "טיסות לא זמינות כרגע",
    };
  }
}

export async function searchHotels(params: SearchParams): Promise<HotelDeal[]> {
  return (await searchHotelsWithMode(params)).hotels;
}

async function searchHotelsWithMode(params: SearchParams): Promise<{
  hotels: HotelDeal[];
  mode: ProviderMode;
  warning?: string;
}> {
  if (isMockMode()) {
    logMockMode("Hotel search is using development mock data because mock mode is enabled.");
    return {
      hotels: getMockHotels(params),
      mode: "mock",
      warning: "מצב פיתוח פעיל. מחירי המלונות אינם נתוני ספק מאומתים.",
    };
  }

  if (!isAmadeusConfigured()) {
    return {
      hotels: [],
      mode: "unavailable",
      warning: "מלונות לא זמינים כרגע",
    };
  }

  try {
    const hotels = await searchAmadeusHotels(params);

    if (hotels.length === 0) {
      return {
        hotels: [],
        mode: "unavailable",
        warning: "מלונות לא זמינים כרגע",
      };
    }

    return { hotels, mode: "amadeus" };
  } catch (error) {
    return {
      hotels: [],
      mode: "unavailable",
      warning:
        error instanceof Error
          ? `Amadeus hotel search failed: ${error.message}.`
          : "מלונות לא זמינים כרגע",
    };
  }
}

export async function getTripDeals(params: SearchParams): Promise<TripDeal[]> {
  const [flights, hotels] = await Promise.all([
    searchFlights(params),
    searchHotels(params),
  ]);
  const nights = Math.max(1, getTripNights(params.departureDate, params.returnDate));

  return buildTripDeals({ flights, hotels, params, nights });
}

export async function getTripById(id: string) {
  const deals = await getTripDeals({
    from: "Tel Aviv",
    destination: "Paris",
    departureDate: "2026-06-10",
    returnDate: "2026-06-15",
    travelers: 2,
    budget: 1600,
  });

  return deals.find((deal) => deal.id === id) ?? deals[0];
}

async function getAmadeusAccessToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.accessToken;
  }

  const response = await fetchWithRetry(`${amadeusBaseUrl}/v1/security/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: getAmadeusCredentials().clientId,
      client_secret: getAmadeusCredentials().clientSecret,
    }),
    cache: "no-store",
  }, { retries: 2, timeoutMs: 8_000 });

  if (!response.ok) {
    throw new Error(`authentication failed with status ${response.status}`);
  }

  const token = (await response.json()) as AmadeusTokenResponse;

  cachedToken = {
    accessToken: token.access_token,
    expiresAt: Date.now() + token.expires_in * 1000,
  };

  return token.access_token;
}

async function searchAmadeusFlights(params: SearchParams) {
  const accessToken = await getAmadeusAccessToken();
  const query = new URLSearchParams({
    originLocationCode: normalizeLocationCode(params.from),
    destinationLocationCode: normalizeLocationCode(params.destination),
    departureDate: params.departureDate,
    adults: String(Math.max(1, params.travelers)),
    currencyCode: "USD",
    max: "10",
  });

  if (params.returnDate) {
    query.set("returnDate", params.returnDate);
  }

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
    const message = await getAmadeusErrorMessage(response);
    throw new Error(message || `flight search failed with status ${response.status}`);
  }

  const result = (await response.json()) as AmadeusFlightOffersResponse;

  return (result.data ?? [])
    .map((offer) => normalizeFlightOffer(offer, params))
    .filter((flight): flight is FlightDeal => Boolean(flight))
    .sort((a, b) => (a.price ?? Number.MAX_SAFE_INTEGER) - (b.price ?? Number.MAX_SAFE_INTEGER));
}

async function searchAmadeusHotels(params: SearchParams) {
  const accessToken = await getAmadeusAccessToken();
  const cityCode = normalizeLocationCode(params.destination);
  const hotelListQuery = new URLSearchParams({
    cityCode,
    radius: "20",
    radiusUnit: "KM",
    hotelSource: "ALL",
  });

  const hotelListResponse = await fetchWithRetry(
    `${amadeusBaseUrl}/v1/reference-data/locations/hotels/by-city?${hotelListQuery.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    },
    { retries: 2, timeoutMs: 12_000 },
  );

  if (!hotelListResponse.ok) {
    const message = await getAmadeusErrorMessage(hotelListResponse);
    throw new Error(message || `hotel list failed with status ${hotelListResponse.status}`);
  }

  const hotelList = (await hotelListResponse.json()) as AmadeusHotelListResponse;
  const hotelIds = (hotelList.data ?? [])
    .map((hotel) => hotel.hotelId)
    .filter((hotelId): hotelId is string => Boolean(hotelId))
    .slice(0, 20);

  if (hotelIds.length === 0) {
    return [];
  }

  const offersQuery = new URLSearchParams({
    hotelIds: hotelIds.join(","),
    adults: String(Math.max(1, params.travelers)),
    checkInDate: params.departureDate,
    checkOutDate: params.returnDate || getDefaultCheckoutDate(params.departureDate),
    currency: "USD",
    bestRateOnly: "true",
  });

  const offersResponse = await fetchWithRetry(
    `${amadeusBaseUrl}/v3/shopping/hotel-offers?${offersQuery.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    },
    { retries: 2, timeoutMs: 12_000 },
  );

  if (!offersResponse.ok) {
    const message = await getAmadeusErrorMessage(offersResponse);
    throw new Error(
      message || `hotel offers failed with status ${offersResponse.status}`,
    );
  }

  const offers = (await offersResponse.json()) as AmadeusHotelOffersResponse;

  return (offers.data ?? [])
    .map((offer, index) => normalizeHotelOffer(offer, params, index))
    .filter((hotel): hotel is HotelDeal => Boolean(hotel))
    .sort((a, b) => (a.pricePerNight ?? Number.MAX_SAFE_INTEGER) - (b.pricePerNight ?? Number.MAX_SAFE_INTEGER));
}

function normalizeFlightOffer(
  offer: AmadeusFlightOffer,
  params: SearchParams,
): FlightDeal | null {
  const firstItinerary = offer.itineraries?.[0];
  const segments = firstItinerary?.segments ?? [];
  const firstSegment = segments[0];
  const lastSegment = segments[segments.length - 1];

  if (!firstSegment?.departure?.at || !lastSegment?.arrival?.at) {
    return null;
  }

  return {
    id: `amadeus-${offer.id}`,
    airline:
      offer.validatingAirlineCodes?.[0] ||
      firstSegment.carrierCode ||
      "Unknown airline",
    from: firstSegment.departure.iataCode || normalizeLocationCode(params.from),
    destination:
      lastSegment.arrival.iataCode || normalizeLocationCode(params.destination),
    departureTime: formatFlightTime(firstSegment.departure.at),
    arrivalTime: formatFlightTime(lastSegment.arrival.at),
    price: Number(offer.price?.total || 0),
    currency: offer.price?.currency || "USD",
    provider: "Amadeus",
    availabilityStatus: Number(offer.price?.total || 0) > 0 ? "available" : "unknown",
    lastChecked: new Date().toISOString(),
    bookingLink: undefined,
    priceLabel: Number(offer.price?.total || 0) > 0 ? "מחיר בזמן אמת" : "לא זמין כרגע",
    duration: formatIsoDuration(firstItinerary?.duration || ""),
    nonstop: segments.length === 1,
  };
}

function getMockFlights(params: SearchParams) {
  const destination = params.destination.trim() || "Paris";

  return data.flights
    .map((flight, index) => ({
      ...flight,
      from: params.from || flight.from,
      destination,
      price: Math.max(
        79,
        (flight.price ?? 0) + index * 17 - Math.min(params.budget, 500) / 20,
      ),
      currency: "USD",
      provider: "Development mock",
      availabilityStatus: "unknown" as const,
      lastChecked: new Date().toISOString(),
      bookingLink: undefined,
      priceLabel: "לא זמין כרגע" as const,
    }))
    .sort((a, b) => (a.price ?? Number.MAX_SAFE_INTEGER) - (b.price ?? Number.MAX_SAFE_INTEGER));
}

function getMockHotels(params: SearchParams) {
  return data.hotels
    .map((hotel, index) => ({
      ...hotel,
      location: `${params.destination || "Central"} · ${hotel.location}`,
      pricePerNight: Math.max(65, (hotel.pricePerNight ?? 0) + index * 11),
      currency: "USD",
      provider: "Development mock",
      availabilityStatus: "unknown" as const,
      lastChecked: new Date().toISOString(),
      bookingLink: undefined,
      priceLabel: "לא זמין כרגע" as const,
    }))
    .sort((a, b) => (a.pricePerNight ?? Number.MAX_SAFE_INTEGER) - (b.pricePerNight ?? Number.MAX_SAFE_INTEGER));
}

function normalizeHotelOffer(
  offer: AmadeusHotelOffer,
  params: SearchParams,
  index: number,
): HotelDeal | null {
  const price = Number(
    offer.offers?.[0]?.price?.base || offer.offers?.[0]?.price?.total || 0,
  );

  if (!offer.hotel?.name || !Number.isFinite(price) || price <= 0) {
    return null;
  }

  const stars = Number(offer.hotel.rating || 4);
  const safeStars = Number.isFinite(stars) ? Math.min(Math.max(stars, 1), 5) : 4;

  return {
    id: `amadeus-hotel-${offer.hotel.hotelId || index}`,
    name: offer.hotel.name,
    image: "",
    rating: Math.min(4.9, 4 + safeStars / 10),
    stars: safeStars,
    location: `${params.destination || offer.hotel.cityCode || "City center"} · Amadeus hotel`,
    pricePerNight: Math.round(price),
    currency: offer.offers?.[0]?.price?.currency || "USD",
    provider: "Amadeus Hotels",
    availabilityStatus: offer.available === false ? "unavailable" : "available",
    lastChecked: new Date().toISOString(),
    bookingLink: undefined,
    priceLabel: "מחיר בזמן אמת",
    amenities: getHotelAmenities(index, safeStars),
  };
}

function getHotelAmenities(index: number, stars: number) {
  const baseAmenities = [
    ["Breakfast", "Wi-Fi", "Central location"],
    ["Pool", "Gym", "Concierge"],
    ["Family rooms", "Metro nearby", "Kitchenette"],
    ["Spa", "Fine dining", "Airport shuttle"],
  ];

  return [
    ...(baseAmenities[index % baseAmenities.length] ?? baseAmenities[0]),
    stars >= 5 ? "Luxury" : "Best value",
  ];
}

function buildTripDeals({
  flights,
  hotels,
  params,
  nights,
}: {
  flights: FlightDeal[];
  hotels: HotelDeal[];
  params: SearchParams;
  nights: number;
}) {
  if (!flights.length || !hotels.length) {
    return [];
  }

  return flights.slice(0, 4).map((flight, index) => {
    const hotel = hotels[index % hotels.length];
    const currency = flight.currency || hotel.currency || "USD";
    const budgetBreakdown = buildBudgetBreakdown({
      flightPrice: flight.price,
      hotelPricePerNight: hotel.pricePerNight,
      travelers: params.travelers,
      nights,
      currency,
    });
    const budgetValidation = validateBudgetBreakdown(budgetBreakdown);

    return {
      id: `trip-${flight.id}-${hotel.id}`,
      title: `${params.destination || flight.destination} smart escape`,
      destination: params.destination || flight.destination,
      image: hotel.image,
      flight,
      hotel,
      estimatedTotal: budgetValidation.isValid ? budgetBreakdown.total : null,
      currency,
      budgetBreakdown,
      budgetValidation,
      tags: [
        index === 0 ? "Best Value" : "AI Pick",
        flight.nonstop ? "Nonstop" : "1 stop",
        `${hotel.stars} star hotel`,
        params.accessibilityProfile && params.accessibilityProfile !== "none"
          ? "Accessible pace"
          : "Family ready",
        ...(params.accessibilityFilters ?? []).slice(0, 2),
      ],
      aiSummary:
        params.accessibilityProfile && params.accessibilityProfile !== "none"
          ? "מסלול בקצב רגוע עם דגש על מלון נגיש, מרחקי הליכה קצרים ובדיקת סיכוני נגישות לפני הזמנה."
          : "מסלול משפחתי מאוזן עם זמני טיסה נוחים, מלון מדורג והמלצות מותאמות תקציב.",
    };
  });
}

async function getAmadeusErrorMessage(response: Response) {
  try {
    const body = (await response.json()) as {
      errors?: Array<{ title?: string; detail?: string }>;
    };
    const error = body.errors?.[0];
    return error?.detail || error?.title || "";
  } catch {
    return "";
  }
}

function normalizeLocationCode(value: string) {
  const cleanValue = value.trim();
  const mapped = locationCodeMap[cleanValue.toLowerCase()];

  if (mapped) {
    return mapped;
  }

  return cleanValue.slice(0, 3).toUpperCase();
}

function formatFlightTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

function formatIsoDuration(value: string) {
  const match = value.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);

  if (!match) {
    return value || "Unknown";
  }

  const hours = match[1] ? `${match[1]}h` : "";
  const minutes = match[2] ? `${match[2]}m` : "";

  return [hours, minutes].filter(Boolean).join(" ");
}

function getDefaultCheckoutDate(departureDate: string) {
  const date = new Date(departureDate);

  if (!Number.isFinite(date.getTime())) {
    return departureDate;
  }

  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

function getTripNights(start: string, end: string) {
  const startDate = new Date(start).getTime();
  const endDate = new Date(end).getTime();

  if (!Number.isFinite(startDate) || !Number.isFinite(endDate)) {
    return 4;
  }

  return Math.max(1, Math.round((endDate - startDate) / 86_400_000));
}
