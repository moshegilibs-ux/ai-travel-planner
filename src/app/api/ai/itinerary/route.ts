import { NextResponse } from "next/server";
import { z } from "zod";
import type { CustomItineraryInput, TripType } from "@/lib/generate-itinerary";
import { generateItinerary } from "@/services/api/itinerary";
import { rateLimit } from "@/lib/rate-limit";
import { apiError } from "@/lib/api-response";

const aiItinerarySchema = z.object({
  destination: z.string().min(1),
  days: z.number().int().min(1).max(21),
  budget: z.string().min(1),
  interests: z.array(z.string()).default([]),
  tripType: z
    .enum(["רומנטי", "משפחתי", "בטן גב", "שופינג", "טבע והרפתקאות", "תקציב נמוך"])
    .optional(),
  preferences: z
    .object({
      environment: z.enum(["טבע", "עיר", "משולב"]),
      pace: z.enum(["רגוע", "מאוזן", "עמוס"]),
      budgetStyle: z.enum(["חסכוני", "מאוזן", "יוקרתי"]),
      interests: z.array(z.enum(["אוכל", "תרבות", "חיי לילה", "טבע", "ילדים"])),
    })
    .optional(),
  selectedFlight: z.unknown().optional(),
});

export async function POST(request: Request) {
  const limited = rateLimit({
    key: `ai-itinerary:${request.headers.get("x-forwarded-for") || "local"}`,
    limit: 10,
  });

  if (!limited.ok) {
    return apiError("Too many requests.", 429, "RATE_LIMITED");
  }

  const payload = aiItinerarySchema.parse(await request.json());
  const tripType = payload.tripType ?? inferTripType(payload.interests);
  const result = await generateItinerary({
    destination: payload.destination,
    days: payload.days,
    budget: payload.budget,
    tripType,
    preferences: payload.preferences,
    selectedFlight: payload.selectedFlight as CustomItineraryInput["selectedFlight"],
  });

  return NextResponse.json({
    ...result,
    note:
      result.source === "ai"
        ? "Generated with AI and validated against the project schema."
        : "Using mock fallback. Ready to replace with production AI + Places/Flights/Maps APIs.",
  });
}

function inferTripType(interests: string[]): TripType {
  const text = interests.join(" ").toLowerCase();

  if (text.includes("family")) {
    return "משפחתי";
  }

  if (text.includes("shopping")) {
    return "שופינג";
  }

  if (text.includes("beach")) {
    return "בטן גב";
  }

  if (text.includes("nature") || text.includes("adventure")) {
    return "טבע והרפתקאות";
  }

  if (text.includes("budget")) {
    return "תקציב נמוך";
  }

  return "רומנטי";
}
