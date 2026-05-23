import OpenAI from "openai";
import { z } from "zod";
import type {
  CustomItineraryDay,
  CustomItineraryInput,
  ItineraryPlace,
} from "@/lib/generate-itinerary";
import { getOpenAIKey, getOpenAIModel } from "@/lib/env";
import { getPlaceImages } from "@/services/api/images";
import { getMapUrl } from "@/services/api/maps";

const placeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.enum(["אטרקציה", "מסעדה", "נוף", "אוכל", "תרבות", "טבע"]),
  timeSlot: z.enum(["בוקר", "צהריים", "ערב"]),
  suggestedTime: z.string().min(1),
  shortDescription: z.string().min(1),
  detailedDescription: z.string().min(1),
  whyRecommended: z.string().min(1),
  recommendedVisitTime: z.string().min(1),
  openingHours: z.string().min(1),
  estimatedPrice: z.string().min(1),
  rating: z.number().min(0).max(5),
  reviewSummary: z.string().min(1),
  travelerFit: z.array(z.string()).min(1),
  image: z.string().min(1),
  gallery: z.array(z.string()).min(1),
  mapUrl: z.string().min(1),
});

const daySchema = z.object({
  day: z.number().int().min(1),
  title: z.string().min(1),
  morning: z.string().min(1),
  afternoon: z.string().min(1),
  evening: z.string().min(1),
  attractions: z.array(z.string()).min(1),
  restaurant: z.string().min(1),
  dailyTip: z.string().min(1),
  places: z.array(placeSchema).min(1),
  flightNotes: z.array(z.string()).optional(),
});

const itineraryResponseSchema = z.object({
  days: z.array(daySchema).min(1),
});

const itineraryJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["days"],
  properties: {
    days: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "day",
          "title",
          "morning",
          "afternoon",
          "evening",
          "attractions",
          "restaurant",
          "dailyTip",
          "places",
          "flightNotes",
        ],
        properties: {
          day: { type: "number" },
          title: { type: "string" },
          morning: { type: "string" },
          afternoon: { type: "string" },
          evening: { type: "string" },
          attractions: { type: "array", items: { type: "string" } },
          restaurant: { type: "string" },
          dailyTip: { type: "string" },
          flightNotes: { type: "array", items: { type: "string" } },
          places: {
            type: "array",
            minItems: 1,
            items: {
              type: "object",
              additionalProperties: false,
              required: [
                "id",
                "name",
                "category",
                "timeSlot",
                "suggestedTime",
                "shortDescription",
                "detailedDescription",
                "whyRecommended",
                "recommendedVisitTime",
                "openingHours",
                "estimatedPrice",
                "rating",
                "reviewSummary",
                "travelerFit",
                "image",
                "gallery",
                "mapUrl",
              ],
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                category: {
                  type: "string",
                  enum: ["אטרקציה", "מסעדה", "נוף", "אוכל", "תרבות", "טבע"],
                },
                timeSlot: { type: "string", enum: ["בוקר", "צהריים", "ערב"] },
                suggestedTime: { type: "string" },
                shortDescription: { type: "string" },
                detailedDescription: { type: "string" },
                whyRecommended: { type: "string" },
                recommendedVisitTime: { type: "string" },
                openingHours: { type: "string" },
                estimatedPrice: { type: "string" },
                rating: { type: "number" },
                reviewSummary: { type: "string" },
                travelerFit: { type: "array", items: { type: "string" } },
                image: { type: "string" },
                gallery: { type: "array", items: { type: "string" } },
                mapUrl: { type: "string" },
              },
            },
          },
        },
      },
    },
  },
} as const;

type OpenAIResponse = {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
};

function getApiKey() {
  return getOpenAIKey();
}

function extractOutputText(response: OpenAIResponse) {
  if (response.output_text) return response.output_text;

  return response.output
    ?.flatMap((item) => item.content ?? [])
    .find((content) => content.type === "output_text" || content.text)?.text;
}

function buildPrompt(input: CustomItineraryInput) {
  return JSON.stringify(
    {
      ...input,
      instructions: [
        "החזר מסלול בעברית בלבד ובפורמט JSON שתואם בדיוק לסכמה.",
        "כל יום חייב לכלול בוקר, צהריים, ערב, אטרקציות, מסעדה, טיפ יומי ולפחות שלוש עצירות.",
        "כל עצירה חייבת לכלול שם, שעה, תיאור קצר ומפורט, למה מומלץ, שעות פתיחה, מחיר משוער, דירוג, ביקורות, התאמה למטיילים, תמונה, גלריה וקישור מפה.",
        "לתעדף משפחות, מבוגרים, נגישות, זמני מנוחה ומרחקי הליכה קצרים.",
        "אם אין ודאות לגבי שעות פתיחה/מחירים/נגישות, לציין הערכה שמומלץ לאמת מראש.",
        "TODO עתידי: חיבור Places API, Flights API ו-Maps API לאימות מקומות, זמני נסיעה, זמינות ותמונות.",
      ],
    },
    null,
    2,
  );
}

function withSafePlaceAssets(place: ItineraryPlace, index: number): ItineraryPlace {
  const images = getPlaceImages(index);

  return {
    ...place,
    image: place.image || images.image,
    gallery: place.gallery?.length ? place.gallery : images.gallery,
    mapUrl: place.mapUrl || getMapUrl(place.name),
    rating: Math.min(5, Math.max(0, place.rating || 4.4)),
  };
}

function normalizeValidatedDays(days: CustomItineraryDay[]) {
  return days.map((day, dayIndex) => ({
    ...day,
    flightNotes: day.flightNotes ?? [],
    places: day.places.map((place, placeIndex) =>
      withSafePlaceAssets(place, dayIndex + placeIndex),
    ),
  }));
}

export async function generateAiItinerary(
  input: CustomItineraryInput,
): Promise<CustomItineraryDay[]> {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY or AI_API_KEY");
  }

  const client = new OpenAI({ apiKey });
  const response = await client.responses.create({
    model: getOpenAIModel(),
    input: [
      {
        role: "system",
        content:
          "אתה מתכנן טיולים מקצועי למותג טיולים וחלומות. החזר JSON בלבד. המסלול חייב להיות ריאליסטי, נגיש, משפחתי, עם זמני יום הגיוניים, עלויות משוערות ותמיכה במטיילים מבוגרים ובאנשים עם מוגבלויות. אל תשנה את מבנה הנתונים.",
      },
      {
        role: "user",
        content: buildPrompt(input),
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "custom_itinerary_response",
        strict: true,
        schema: itineraryJsonSchema,
      },
    },
  });

  const text = extractOutputText(response as OpenAIResponse);

  if (!text) {
    throw new Error("OpenAI returned an empty itinerary");
  }

  const parsed = itineraryResponseSchema.parse(JSON.parse(text));
  return normalizeValidatedDays(parsed.days);
}
