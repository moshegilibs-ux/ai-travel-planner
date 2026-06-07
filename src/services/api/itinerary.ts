import {
  buildItineraryPrompt,
  generateMultiDestinationItinerary,
  type CustomItineraryInput,
} from "@/lib/generate-itinerary";

export async function generateItinerary(input: CustomItineraryInput) {
  return {
    itinerary: generateMultiDestinationItinerary(input),
    prompt: buildItineraryPrompt(input),
    warning: undefined as string | undefined,
    // Local deterministic generator (no live AI call yet); callers use this to
    // label the response. Swap to "ai" when wiring a production model.
    source: "mock" as "ai" | "mock",
  };
}
