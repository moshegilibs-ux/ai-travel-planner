import OpenAI from "openai";
import { z } from "zod";
import {
  aiTripIntentSchema,
  runTravelAgentTools,
  type AiAgentResult,
} from "@/lib/ai-tools";
import { createCacheKey, getCachedValue, setCachedValue } from "@/lib/ai-cache";
import { getOpenAIKey, getOpenAIModel, hasOpenAI } from "@/lib/env";

const intentFallbacks: Array<{ pattern: RegExp; destination: string }> = [
  { pattern: /greece|יוון/i, destination: "Greece" },
  { pattern: /paris|פריז/i, destination: "Paris" },
  { pattern: /rome|רומא/i, destination: "Rome" },
  { pattern: /thai|תאילנד/i, destination: "Thailand" },
  { pattern: /dubai|דובאי/i, destination: "Dubai" },
];

export const assistantResponseSchema = z.object({
  summary: z.string(),
  destinationSuggestions: z.array(z.string()),
  budgetSummary: z.string(),
  recommendedDealId: z.string().optional(),
  recommendations: z.array(z.string()),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
  risks: z.array(z.string()),
  pricePrediction: z.object({
    direction: z.enum(["rise", "drop", "stable"]),
    confidence: z.number(),
    reason: z.string(),
  }),
});

export type AssistantResponse = z.infer<typeof assistantResponseSchema>;

export function isOpenAIConfigured() {
  return hasOpenAI();
}

export function getOpenAIClient() {
  if (!isOpenAIConfigured()) {
    return null;
  }

  return new OpenAI({
    apiKey: getOpenAIKey(),
  });
}

export async function createAgentContext(prompt: string) {
  const cacheKey = createCacheKey("agent-context", prompt);
  const cached = getCachedValue<AiAgentResult>(cacheKey);

  if (cached) {
    return cached;
  }

  const intent = await extractIntent(prompt);
  const context = await runTravelAgentTools(intent);
  setCachedValue(cacheKey, context);
  return context;
}

export async function createStructuredAssistantResponse(
  prompt: string,
  context: AiAgentResult,
): Promise<AssistantResponse> {
  const client = getOpenAIClient();

  if (!client) {
    return createFallbackAssistantResponse(context);
  }

  const response = await client.responses.create({
    model: getOpenAIModel(),
    input: [
      {
        role: "system",
        content:
          "You are the AI assistant for the Hebrew brand 'טיולים וחלומות' with the tagline 'מטיילים יחד, בלי גבולות'. Prioritize accessible family travel for families, seniors, wheelchair users, walker users and mobility scooter users. Recommend accessible hotels, short walking distances, step-free routes, rest breaks, accessible transport, slower-paced itineraries and clear accessibility risks. Return concise structured JSON, preferably in Hebrew when the user writes Hebrew.",
      },
      {
        role: "user",
        content: JSON.stringify({ prompt, context }),
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "travel_assistant_response",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          required: [
            "summary",
            "destinationSuggestions",
            "budgetSummary",
            "recommendations",
            "pros",
            "cons",
            "risks",
            "pricePrediction",
          ],
          properties: {
            summary: { type: "string" },
            destinationSuggestions: { type: "array", items: { type: "string" } },
            budgetSummary: { type: "string" },
            recommendedDealId: { type: "string" },
            recommendations: { type: "array", items: { type: "string" } },
            pros: { type: "array", items: { type: "string" } },
            cons: { type: "array", items: { type: "string" } },
            risks: { type: "array", items: { type: "string" } },
            pricePrediction: {
              type: "object",
              additionalProperties: false,
              required: ["direction", "confidence", "reason"],
              properties: {
                direction: { type: "string", enum: ["rise", "drop", "stable"] },
                confidence: { type: "number" },
                reason: { type: "string" },
              },
            },
          },
        },
      },
    },
  });

  const parsed = assistantResponseSchema.safeParse(JSON.parse(response.output_text));
  return parsed.success ? parsed.data : createFallbackAssistantResponse(context);
}

export function createFallbackAssistantResponse(
  context: AiAgentResult,
): AssistantResponse {
  const bestDeal = context.comparison[0];

  return {
    summary: `מצאתי מסלול של ${context.intent.days} ימים ל${context.intent.destination} עם דגש על קצב רגוע, מלונות נגישים, תקציב ותכנון יום-יומי שמתאים למשפחה רב-דורית.`,
    destinationSuggestions: [
      context.intent.destination,
      "Crete",
      "Cyprus",
      "Southern Italy",
    ],
    budgetSummary: context.budget.withinBudget
      ? `Estimated total is $${context.budget.estimatedTotal}, within your $${context.intent.budget} budget.`
      : `Estimated total is $${context.budget.estimatedTotal}, about $${Math.abs(context.budget.savingsGap)} above budget.`,
    recommendedDealId: bestDeal?.id,
    recommendations: context.recommendations,
    pros: [
      "משלב טיסות, מלונות ותכנון מסלול במקום אחד",
      "מעדיף קצב רגוע ומרחקי הליכה קצרים",
      "מדגיש מלונות נגישים וסיכוני נגישות לפני הזמנה",
    ],
    cons: [
      "זמינות חדרים נגישים יכולה להשתנות במהירות",
      "יש לוודא מעלית, מקלחת נגישה וגישה ללא מדרגות מול המלון",
    ],
    risks: bestDeal?.risks ?? [
      "יש לבדוק זמני הגעה מאוחרים, מרחק הליכה מהתחנה ועמלות כבודה לפני הזמנה",
    ],
    pricePrediction: context.prediction,
  };
}

export function formatAssistantMarkdown(response: AssistantResponse, context: AiAgentResult) {
  const itineraryPreview = context.itinerary
    .slice(0, 3)
    .map((day) => `- **Day ${day.day}:** ${day.morning} ${day.afternoon}`)
    .join("\n");

  return `## מסלול נגיש ל${context.intent.destination}

${response.summary}

### תקציב
${response.budgetSummary}

### למה זה מתאים
${response.pros.map((item) => `- ${item}`).join("\n")}

### סיכוני נגישות לבדיקה
${response.risks.map((item) => `- ${item}`).join("\n")}

### המלצות חכמות
${response.recommendations.map((item) => `- ${item}`).join("\n")}

### תחזית מחיר
המחירים עשויים להיות במגמת **${response.pricePrediction.direction}** ברמת ביטחון של ${response.pricePrediction.confidence}%. ${response.pricePrediction.reason}

### הצצה למסלול
${itineraryPreview}
`;
}

async function extractIntent(prompt: string) {
  const client = getOpenAIClient();

  if (!client) {
    return fallbackIntent(prompt);
  }

  try {
    const response = await client.responses.create({
      model: getOpenAIModel(),
      input: [
        {
          role: "system",
          content:
            "Extract travel search intent. Infer sensible defaults for accessible family travel. If the user mentions seniors, wheelchair, walker, mobility scooter, children or accessibility, include related interests such as accessibility, short walking distances, accessible hotels and relaxed pace. Return only structured JSON.",
        },
        { role: "user", content: prompt },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "travel_intent",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["destination", "days", "budget", "month", "interests", "origin", "adults"],
            properties: {
              destination: { type: "string" },
              days: { type: "integer", minimum: 1, maximum: 30 },
              budget: { type: "number" },
              month: { type: "string" },
              interests: { type: "array", items: { type: "string" } },
              origin: { type: "string" },
              adults: { type: "integer", minimum: 1 },
            },
          },
        },
      },
    });

    const parsed = aiTripIntentSchema.safeParse(JSON.parse(response.output_text));
    return parsed.success ? parsed.data : fallbackIntent(prompt);
  } catch {
    return fallbackIntent(prompt);
  }
}

function fallbackIntent(prompt: string) {
  const destination =
    intentFallbacks.find((item) => item.pattern.test(prompt))?.destination || "Greece";
  const days = Number(prompt.match(/(\d+)[-\s]?day/i)?.[1] || 5);
  const budget = prompt.toLowerCase().includes("cheap") ? 900 : 1600;
  const monthMatch = prompt.match(
    /(january|february|march|april|may|june|july|august|september|october|november|december)/i,
  );

  return {
    destination,
    days,
    budget,
    month: monthMatch?.[1] || "August",
    interests: prompt.toLowerCase().includes("beach")
      ? ["beach", "food", "budget"]
      : ["culture", "food", "budget"],
    origin: "Tel Aviv",
    adults: 1,
  };
}
