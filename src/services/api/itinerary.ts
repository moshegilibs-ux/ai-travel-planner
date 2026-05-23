import {
  CustomItineraryDay,
  CustomItineraryInput,
  generateCustomItinerary,
} from "@/lib/generate-itinerary";
import { isPublicMockMode, logPublicMockMode } from "@/lib/public-env";

type ItineraryServiceResult = {
  itinerary: CustomItineraryDay[];
  source: "mock" | "ai" | "fallback";
  warning?: string;
};

function shouldUseMockData() {
  return isPublicMockMode();
}

function getMockItineraryResult(
  input: CustomItineraryInput,
  warning?: string,
): ItineraryServiceResult {
  return {
    itinerary: generateCustomItinerary(input),
    source: warning ? "fallback" : "mock",
    warning,
  };
}

async function generateItineraryInBrowser(input: CustomItineraryInput) {
  if (shouldUseMockData()) {
    logPublicMockMode("Itinerary generation is using mock mode in the browser.");
    return getMockItineraryResult(input);
  }

  try {
    const response = await fetch("/api/ai/itinerary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error("AI itinerary route failed");
    }

    const data = (await response.json()) as ItineraryServiceResult;

    if (!data.itinerary?.length) {
      throw new Error("AI itinerary route returned an empty itinerary");
    }

    return data;
  } catch {
    return getMockItineraryResult(
      input,
      "AI לא זמין כרגע, לכן נוצר מסלול mock זמני.",
    );
  }
}

async function generateItineraryOnServer(input: CustomItineraryInput) {
  if (shouldUseMockData()) {
    logPublicMockMode("Itinerary generation is using mock mode on the server.");
    return getMockItineraryResult(input);
  }

  try {
    const { generateAiItinerary } = await import("@/services/api/itinerary.server");
    const itinerary = await generateAiItinerary(input);

    if (!itinerary.length || itinerary.some((day) => !day.places?.length)) {
      throw new Error("AI itinerary failed validation");
    }

    return {
      itinerary,
      source: "ai" as const,
    };
  } catch (error) {
    return getMockItineraryResult(
      input,
      error instanceof Error
        ? `AI fallback: ${error.message}`
        : "AI fallback: unknown error",
    );
  }
}

export async function generateItinerary(
  input: CustomItineraryInput,
): Promise<ItineraryServiceResult> {
  // TODO: Replace mock fallback with production AI + Places API + Flights API + Maps API orchestration.
  if (typeof window !== "undefined") {
    return generateItineraryInBrowser(input);
  }

  return generateItineraryOnServer(input);
}
