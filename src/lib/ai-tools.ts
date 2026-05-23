import { z } from "zod";
import { searchTravel } from "@/lib/amadeus";
import { generateItinerary } from "@/services/api/itinerary";
import type { SearchParams, TripDeal } from "@/types/travel-marketplace";
import type { TripType } from "@/lib/generate-itinerary";

export const aiTripIntentSchema = z.object({
  destination: z.string(),
  days: z.number().int().min(1).max(30),
  budget: z.number().min(0),
  month: z.string().optional(),
  interests: z.array(z.string()).default([]),
  origin: z.string().default("Tel Aviv"),
  adults: z.number().int().min(1).default(1),
});

export type AiTripIntent = z.infer<typeof aiTripIntentSchema>;

export type AiAgentResult = {
  intent: AiTripIntent;
  flights: Awaited<ReturnType<typeof searchFlightsTool>>;
  hotels: Awaited<ReturnType<typeof searchHotelsTool>>;
  budget: Awaited<ReturnType<typeof calculateBudgetTool>>;
  itinerary: Awaited<ReturnType<typeof generateItineraryTool>>;
  comparison: Awaited<ReturnType<typeof compareDealsTool>>;
  recommendations: string[];
  prediction: {
    direction: "rise" | "drop" | "stable";
    confidence: number;
    reason: string;
  };
};

export async function runTravelAgentTools(intent: AiTripIntent) {
  const searchParams = buildSearchParams(intent);
  const travel = await searchTravel({
    origin: searchParams.from,
    destination: searchParams.destination,
    departureDate: searchParams.departureDate,
    returnDate: searchParams.returnDate,
    adults: searchParams.travelers,
    budget: searchParams.budget,
    accessibilityProfile: "senior",
    accessibilityFilters: [
      "wheelchair-accessible",
      "step-free-access",
      "short-walking-distances",
      "accessible-bathroom",
    ],
    flexibleDates: true,
    nearbyAirports: true,
  });

  const flights = searchFlightsTool(travel.flights);
  const hotels = searchHotelsTool(travel.hotels);
  const budget = calculateBudgetTool(travel.deals, intent);
  const itinerary = await generateItineraryTool(intent);
  const comparison = compareDealsTool(travel.deals);

  return {
    intent,
    flights,
    hotels,
    budget,
    itinerary,
    comparison,
    recommendations: buildSmartRecommendations(intent, travel.deals),
    prediction: predictPriceDirection(intent, travel.deals),
  };
}

export function searchFlightsTool(flights: Awaited<ReturnType<typeof searchTravel>>["flights"]) {
  return flights.slice(0, 5).map((flight) => ({
    id: flight.id,
    airline: flight.airline,
    price: Math.round(flight.price),
    departureTime: flight.departureTime,
    arrivalTime: flight.arrivalTime,
    duration: flight.duration,
    nonstop: flight.nonstop,
    risk: flight.nonstop ? "Low layover risk" : "Review layover duration and baggage rules",
  }));
}

export function searchHotelsTool(hotels: Awaited<ReturnType<typeof searchTravel>>["hotels"]) {
  return hotels.slice(0, 5).map((hotel) => ({
    id: hotel.id,
    name: hotel.name,
    rating: hotel.rating,
    stars: hotel.stars,
    pricePerNight: hotel.pricePerNight,
    location: hotel.location,
    amenities: hotel.amenities,
  }));
}

export function calculateBudgetTool(deals: TripDeal[], intent: AiTripIntent) {
  const bestDeal = deals[0];
  const estimatedTotal = bestDeal?.estimatedTotal ?? intent.budget;
  const dailyBudget = Math.round(estimatedTotal / Math.max(1, intent.days));

  return {
    estimatedTotal,
    dailyBudget,
    withinBudget: estimatedTotal <= intent.budget,
    savingsGap: intent.budget - estimatedTotal,
  };
}

export async function generateItineraryTool(intent: AiTripIntent) {
  const result = await generateItinerary({
    destination: intent.destination,
    days: intent.days,
    budget: `$${intent.budget}`,
    tripType: inferTripType(intent.interests),
  });

  return result.itinerary;
}

export function compareDealsTool(deals: TripDeal[]) {
  return deals.slice(0, 4).map((deal, index) => ({
    rank: index + 1,
    id: deal.id,
    title: deal.title,
    total: deal.estimatedTotal,
    hotelRating: deal.hotel.rating,
    flightStops: deal.flight.nonstop ? 0 : 1,
    whyGood:
      index === 0
        ? "Cheapest balanced package with strong hotel value"
        : "Good alternative if schedule or hotel area matters more",
    risks: [
      deal.flight.nonstop ? "No major layover risk" : "Includes at least one stop",
      deal.flight.arrivalTime > "22:00" ? "Late arrival" : "Arrival time is reasonable",
      "Check baggage fees before booking",
    ],
  }));
}

export function optimizeDeals(deals: TripDeal[], budget: number) {
  return [...deals]
    .filter((deal) => deal.estimatedTotal <= budget)
    .sort((a, b) => {
      const aScore =
        a.hotel.rating * 100 - a.estimatedTotal / 10 + (a.flight.nonstop ? 40 : 0);
      const bScore =
        b.hotel.rating * 100 - b.estimatedTotal / 10 + (b.flight.nonstop ? 40 : 0);
      return bScore - aScore;
    });
}

function buildSearchParams(intent: AiTripIntent): SearchParams {
  return {
    from: intent.origin,
    destination: intent.destination,
    departureDate: getApproximateDate(intent.month),
    returnDate: addDays(getApproximateDate(intent.month), intent.days),
    travelers: intent.adults,
    budget: intent.budget,
    accessibilityProfile: "senior",
    accessibilityFilters: ["step-free-access", "short-walking-distances"],
    flexibleDates: true,
    nearbyAirports: true,
  };
}

function buildSmartRecommendations(intent: AiTripIntent, deals: TripDeal[]) {
  const cheapest = deals[0];
  return [
    `Check nearby airports around ${intent.destination}; they may reduce total cost.`,
    `Try flexible dates around ${intent.month || "your travel month"} for cheaper fares.`,
    cheapest
      ? `Stay near ${cheapest.hotel.location} for a strong price-to-rating balance.`
      : "Consider alternative hotel areas outside the center for better nightly rates.",
    "Alternative destinations: Cyprus, Crete, Malta, or southern Italy for similar weather and lower prices.",
  ];
}

function predictPriceDirection(intent: AiTripIntent, deals: TripDeal[]) {
  const average = deals.length
    ? deals.reduce((sum, deal) => sum + deal.estimatedTotal, 0) / deals.length
    : intent.budget;
  const pressure = intent.month?.toLowerCase().includes("august") ? 0.72 : 0.54;

  return {
    direction: average > intent.budget * 0.9 ? "rise" : "stable",
    confidence: Math.round(pressure * 100),
    reason:
      average > intent.budget * 0.9
        ? "Current package prices are close to budget and peak-season demand can push prices up."
        : "Prices are below budget, but fare volatility remains moderate.",
  } as const;
}

function inferTripType(interests: string[]): TripType {
  const text = interests.join(" ").toLowerCase();

  if (text.includes("family")) return "משפחתי";
  if (text.includes("shopping")) return "שופינג";
  if (text.includes("beach")) return "בטן גב";
  if (text.includes("nature") || text.includes("adventure")) return "טבע והרפתקאות";
  if (text.includes("cheap") || text.includes("budget")) return "תקציב נמוך";
  return "רומנטי";
}

function getApproximateDate(month?: string) {
  const year = new Date().getFullYear() + 1;
  const monthIndex = month
    ? new Date(`${month} 1, ${year}`).getMonth()
    : new Date().getMonth() + 1;
  const safeMonth = Number.isFinite(monthIndex) && monthIndex >= 0 ? monthIndex : 5;
  return new Date(Date.UTC(year, safeMonth, 10)).toISOString().slice(0, 10);
}

function addDays(dateValue: string, days: number) {
  const date = new Date(dateValue);
  date.setDate(date.getDate() + Math.max(1, days));
  return date.toISOString().slice(0, 10);
}
