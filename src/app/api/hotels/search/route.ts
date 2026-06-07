import { NextResponse } from "next/server";
import { z } from "zod";
import { searchHotels } from "@/lib/amadeus";
import type { SearchParams } from "@/types/travel-marketplace";

// Dedicated schema for the planner hotel search. This does NOT touch the
// marketplace /api/search route or its travelSearchSchema (Amadeus contract).
const hotelSearchSchema = z.object({
  destination: z.string().min(1),
  checkInDate: z.string().optional(),
  checkOutDate: z.string().optional(),
  adults: z.number().int().min(1).max(9).optional(),
  budget: z.number().finite().min(0).optional(),
});

const hotelsUnavailableMessage = "מלונות אמיתיים לא זמינים כרגע";

function getDefaultDate(daysFromNow: number) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().slice(0, 10);
}

export async function POST(request: Request) {
  const validation = hotelSearchSchema.safeParse(
    await request.json().catch(() => null),
  );

  if (!validation.success) {
    return NextResponse.json(
      { hotels: [], source: "error", warning: "בקשת חיפוש מלונות לא תקינה." },
      { status: 400 },
    );
  }

  const input = validation.data;
  const checkIn = input.checkInDate || getDefaultDate(35);
  const params: SearchParams = {
    from: "",
    destination: input.destination,
    departureDate: checkIn,
    returnDate: input.checkOutDate || getDefaultDate(38),
    travelers: input.adults ?? 2,
    budget: input.budget ?? 0,
  };

  try {
    // Real hotels only (Amadeus). Returns [] when the provider is not
    // configured — we surface an explicit unavailable state, never mock prices.
    const hotels = await searchHotels(params);

    if (!hotels.length) {
      return NextResponse.json({
        hotels: [],
        source: "unavailable",
        warning: hotelsUnavailableMessage,
      });
    }

    return NextResponse.json({ hotels, source: "amadeus" });
  } catch {
    return NextResponse.json({
      hotels: [],
      source: "unavailable",
      warning: hotelsUnavailableMessage,
    });
  }
}
