import { Itinerary, TravelFormData, isItinerary } from "@/lib/itinerary-types";
import { getOpenAIKey, getOpenAIModel } from "@/lib/env";
import {
  activityIntensityOptions,
  budgetRangeOptions,
  dayPreferenceOptions,
  dietaryOptions,
  interestOptions,
  kosherLevelOptions,
  labelFor,
  mobilityOptions,
  paceOptions,
  ridingExperienceOptions,
  ridingStyleOptions,
  routeDifficultyOptions,
  routePriorityOptions,
  shabbatOptions,
  transportationOptions,
  travelModeOptions,
  travelStyleOptions,
  travelerOptions,
  walkingDifficultyOptions,
  cyclingTypeOptions,
} from "@/lib/travel-options";

const recommendationSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "name",
    "area",
    "reason",
    "approximatePrice",
    "rating",
    "imageUrl",
    "mapUrl",
    "accessibilityNotes",
    "isAccessible",
  ],
  properties: {
    name: { type: "string" },
    area: { type: "string" },
    reason: { type: "string" },
    approximatePrice: { type: "string" },
    rating: { type: "number" },
    imageUrl: { type: "string" },
    mapUrl: { type: "string" },
    accessibilityNotes: { type: "string" },
    isAccessible: { type: "boolean" },
  },
} as const;

const activitySchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "period",
    "startTime",
    "endTime",
    "place",
    "activity",
    "description",
    "travelTime",
    "transportation",
    "approximateCost",
    "walkingDistance",
    "ridingDistance",
    "ridingDuration",
    "elevationNote",
    "routeDifficulty",
    "fuelOrChargingStop",
    "accessibilityNotes",
    "restStopSuggestion",
    "accessibilityTags",
    "matchReason",
    "mapUrl",
    "imageUrl",
    "rating",
  ],
  properties: {
    period: { type: "string", enum: ["morning", "afternoon", "evening"] },
    startTime: { type: "string" },
    endTime: { type: "string" },
    place: { type: "string" },
    activity: { type: "string" },
    description: { type: "string" },
    travelTime: { type: "string" },
    transportation: { type: "string" },
    approximateCost: { type: "string" },
    walkingDistance: { type: "string" },
    ridingDistance: { type: "string" },
    ridingDuration: { type: "string" },
    elevationNote: { type: "string" },
    routeDifficulty: { type: "string" },
    fuelOrChargingStop: { type: "string" },
    accessibilityNotes: { type: "string" },
    restStopSuggestion: { type: "string" },
    accessibilityTags: { type: "array", items: { type: "string" } },
    matchReason: { type: "string" },
    mapUrl: { type: "string" },
    imageUrl: { type: "string" },
    rating: { type: "number" },
  },
} as const;

const itineraryJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "destination",
    "heroImageUrl",
    "summary",
    "profileSummary",
    "routeNotes",
    "mobilitySummary",
    "accessibilityHighlights",
    "travelModeSummary",
    "ridingHighlights",
    "equipmentRecommendations",
    "safetyNotes",
    "estimatedTotalCost",
    "tags",
    "days",
    "hotelRecommendations",
    "kosherRestaurants",
    "chabadHouses",
  ],
  properties: {
    destination: { type: "string" },
    heroImageUrl: { type: "string" },
    summary: { type: "string" },
    profileSummary: { type: "string" },
    routeNotes: { type: "array", items: { type: "string" } },
    mobilitySummary: { type: "string" },
    accessibilityHighlights: { type: "array", items: { type: "string" } },
    travelModeSummary: { type: "string" },
    ridingHighlights: { type: "array", items: { type: "string" } },
    equipmentRecommendations: { type: "array", items: { type: "string" } },
    safetyNotes: { type: "array", items: { type: "string" } },
    estimatedTotalCost: { type: "string" },
    tags: { type: "array", items: { type: "string" } },
    days: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "day",
          "title",
          "area",
          "theme",
          "flowNote",
          "estimatedDailyCost",
          "totalWalkingDistance",
          "totalRidingDistance",
          "ridingSummary",
          "scenicHighlights",
          "riderTips",
          "accessibilitySummary",
          "restBreaks",
          "activities",
          "restaurants",
          "budgetTip",
          "travelerFit",
        ],
        properties: {
          day: { type: "number" },
          title: { type: "string" },
          area: { type: "string" },
          theme: { type: "string" },
          flowNote: { type: "string" },
          estimatedDailyCost: { type: "string" },
          totalWalkingDistance: { type: "string" },
          totalRidingDistance: { type: "string" },
          ridingSummary: { type: "string" },
          scenicHighlights: { type: "array", items: { type: "string" } },
          riderTips: { type: "array", items: { type: "string" } },
          accessibilitySummary: { type: "string" },
          restBreaks: { type: "array", items: { type: "string" } },
          activities: {
            type: "array",
            items: activitySchema,
          },
          restaurants: {
            type: "array",
            items: recommendationSchema,
          },
          budgetTip: { type: "string" },
          travelerFit: { type: "string" },
        },
      },
    },
    hotelRecommendations: {
      type: "array",
      items: recommendationSchema,
    },
    kosherRestaurants: {
      type: "array",
      items: recommendationSchema,
    },
    chabadHouses: {
      type: "array",
      items: recommendationSchema,
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
  error?: {
    message?: string;
  };
};

function buildPrompt(form: TravelFormData) {
  const interests = form.interests.length
    ? form.interests.map((interest) => labelFor(interestOptions, interest)).join(", ")
    : "לא נבחרו תחומי עניין ספציפיים";

  return [
    `יעד: ${form.destination}`,
    `מספר ימים: ${form.days}`,
    `הרכב מטיילים: ${labelFor(travelerOptions, form.travelers)}`,
    `מצב טיול: ${labelFor(travelModeOptions, form.travelMode)}`,
    `ניסיון רכיבה: ${labelFor(ridingExperienceOptions, form.ridingExperience)}`,
    `מרחק רכיבה יומי מועדף: ${form.preferredDailyRidingDistance} ק״מ`,
    `קושי מסלול: ${labelFor(routeDifficultyOptions, form.routeDifficulty)}`,
    `העדפת מסלול: ${labelFor(routePriorityOptions, form.routePriority)}`,
    `סגנון רכיבה: ${labelFor(ridingStyleOptions, form.ridingStyle)}`,
    `צריך אפשרויות השכרה: ${form.needRentalOptions ? "כן" : "לא"}`,
    `צריך המלצות ציוד: ${form.needGearRecommendations ? "כן" : "לא"}`,
    `העדפת שטח/off-road: ${form.offRoadPreference ? "כן" : "לא"}`,
    `תמיכה ברכיבה קבוצתית: ${form.groupRidingSupport ? "כן" : "לא"}`,
    `סוג רכיבה באופניים: ${labelFor(cyclingTypeOptions, form.cyclingType)}`,
    `גילאים: ${form.ages || "לא צוין"}`,
    `סטטוס משפחתי: ${form.familyStatus || "לא צוין"}`,
    `גילאי ילדים: ${form.kidsAges || "לא רלוונטי"}`,
    `העדפות תזונה: ${labelFor(dietaryOptions, form.dietaryPreference)}`,
    `רמת כשרות: ${labelFor(kosherLevelOptions, form.kosherLevel)}`,
    `שמירת שבת: ${labelFor(shabbatOptions, form.keepShabbat)}`,
    `סגנון טיול: ${labelFor(travelStyleOptions, form.travelStyle)}`,
    `טווח תקציב: ${labelFor(budgetRangeOptions, form.budgetRange)}`,
    `רמת ניידות: ${labelFor(mobilityOptions, form.mobilityLevel)}`,
    `זמן הליכה מקסימלי ביום: ${form.maxWalkingTimePerDay} דקות`,
    `צריך מעלית: ${form.needElevatorAccess ? "כן" : "לא"}`,
    `צריך תחבורה נגישה לכיסא גלגלים: ${form.needWheelchairAccessibleTransportation ? "כן" : "לא"}`,
    `להימנע ממדרגות: ${form.avoidStairs ? "כן" : "לא"}`,
    `צריך עצירות מנוחה תכופות: ${form.needFrequentRestBreaks ? "כן" : "לא"}`,
    `צריך שירותים נגישים: ${form.accessibleBathroomRequired ? "כן" : "לא"}`,
    `רמת קושי בהליכה: ${labelFor(walkingDifficultyOptions, form.walkingDifficulty)}`,
    `עוצמת פעילות מועדפת: ${labelFor(activityIntensityOptions, form.preferredActivityIntensity)}`,
    `תחבורה מועדפת: ${labelFor(transportationOptions, form.preferredTransportation)}`,
    `קצב: ${labelFor(paceOptions, form.pace)}`,
    `העדפת יום: ${labelFor(dayPreferenceOptions, form.dayPreference)}`,
    `צרכי נגישות: ${form.accessibilityNeeds || "אין"}`,
    `תחומי עניין: ${interests}`,
  ].join("\n");
}

function extractResponseText(response: OpenAIResponse) {
  if (response.output_text) {
    return response.output_text;
  }

  return response.output
    ?.flatMap((item) => item.content ?? [])
    .find((content) => content.type === "output_text" || content.text)?.text;
}

export async function generateItineraryWithOpenAI(form: TravelFormData): Promise<Itinerary> {
  const apiKey = getOpenAIKey();

  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: getOpenAIModel(),
      input: [
        {
          role: "system",
          content:
            "אתה יועץ טיולים אישי ומדויק, לא מחולל טקסט כללי. החזר JSON תקין בלבד לפי הסכמה. כתוב בעברית. בנה מסלול ריאליסטי עם מקומות ספציפיים, שעות, זמני נסיעה, עלויות משוערות ותחבורה. חובה לתמוך גם בטיולי אופנועים, כבישים נופיים, אופניים, e-bike, MTB, רכיבת כביש ורכיבה משפחתית. עבור אופנועים: כלול כבישים נופיים/מפותלים, עצירות דלק, מנוחות רוכבים, מלונות ידידותיים לרוכבים, חניה, מזג אוויר placeholder, ציוד ובטיחות. עבור אופניים/e-bike: כלול שבילים בטוחים, מרחק יומי, קושי עליות, עצירות מים, טעינה ל-e-bike, השכרה וציוד. חובה לשמור תאימות לנגישות: להתאים למבוגרים, הליכה מוגבלת, משתמשי כיסא גלגלים ומשפחות עם הורים מבוגרים. הימנע ממקומות לא נגישים, צמצם מעברים, הוסף מנוחות, הערכת מרחק הליכה, הערות נגישות, שירותים נגישים, מעליות ותחבורה נגישה. אל תמציא ודאות על כשרות, נגישות, מזג אוויר, השכרה או חניה: ציין שיש לאמת מול ספקים ומקומות.",
        },
        {
          role: "user",
          content: buildPrompt(form),
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "personalized_travel_itinerary",
          strict: true,
          schema: itineraryJsonSchema,
        },
      },
    }),
  });

  const data = (await response.json()) as OpenAIResponse;

  if (!response.ok) {
    throw new Error(data.error?.message ?? "OpenAI request failed");
  }

  const text = extractResponseText(data);

  if (!text) {
    throw new Error("OpenAI returned an empty itinerary");
  }

  const itinerary = JSON.parse(text) as unknown;

  if (!isItinerary(itinerary)) {
    throw new Error("OpenAI returned an invalid itinerary shape");
  }

  return itinerary;
}
