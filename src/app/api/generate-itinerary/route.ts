import { NextResponse } from "next/server";
import { parseTravelFormData } from "@/lib/itinerary-types";
import { generateMockItinerary } from "@/lib/mock-itinerary";
import { generateItineraryWithOpenAI } from "@/lib/openai-itinerary";
import { hasOpenAI, isProduction, logMockMode } from "@/lib/env";
import { apiError } from "@/lib/api-response";

export async function POST(request: Request) {
  try {
    const form = parseTravelFormData(await request.json());

    if (!hasOpenAI() && !isProduction()) {
      logMockMode("Legacy questionnaire itinerary route is using mock data without OpenAI.");
      return NextResponse.json({
        itinerary: generateMockItinerary(form),
        source: "mock",
      });
    }

    const itinerary = await generateItineraryWithOpenAI(form);

    return NextResponse.json({
      itinerary,
      source: "openai",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate itinerary";

    return apiError(message, 500, "ITINERARY_GENERATION_FAILED");
  }
}
