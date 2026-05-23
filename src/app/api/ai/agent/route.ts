import { z } from "zod";
import {
  createAgentContext,
  createStructuredAssistantResponse,
  formatAssistantMarkdown,
} from "@/lib/openai-agent";
import { createCacheKey, getCachedValue, setCachedValue } from "@/lib/ai-cache";
import { rateLimit } from "@/lib/rate-limit";
import { captureAiFailure } from "@/lib/monitoring";
import { trackServerEvent } from "@/lib/analytics";
import { getFeatureFlags } from "@/lib/feature-flags";
import { apiError } from "@/lib/api-response";

const agentRequestSchema = z.object({
  message: z.string().min(3).max(2000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      }),
    )
    .default([]),
});

export async function POST(request: Request) {
  if (!getFeatureFlags().ai) {
    return apiError(
      "AI assistant is temporarily disabled.",
      503,
      "AI_DISABLED",
      "ה-AI כבוי זמנית בשלב ההשקה הזה. חיפוש טיסות, מלונות ומסלולים שמורים עדיין זמינים.",
    );
  }

  const limited = rateLimit({
    key: `ai-agent:${request.headers.get("x-forwarded-for") || "local"}`,
    limit: 20,
  });

  if (!limited.ok) {
    return apiError("Too many AI requests.", 429, "RATE_LIMITED");
  }

  const payload = agentRequestSchema.parse(await request.json());
  const cacheKey = createCacheKey("ai-agent-response", payload.message);
  const cached = getCachedValue<string>(cacheKey);

  if (cached) {
    return streamText(cached);
  }

  try {
    await trackServerEvent("ai_message_sent", { promptLength: payload.message.length });
    const context = await createAgentContext(payload.message);
    const structured = await createStructuredAssistantResponse(payload.message, context);
    const markdown = formatAssistantMarkdown(structured, context);
    setCachedValue(cacheKey, markdown);
    return streamText(markdown);
  } catch {
    captureAiFailure("AI agent route failed", { prompt: payload.message });
    const fallback =
      "## עוזר טיולים נגיש במצב fallback\n\nאפשר עדיין לקבל טיוטת מסלול. נסו: **תכנן לנו טיול נגיש ליוון ל-5 ימים עם סבתא בכיסא גלגלים**. אשווה טיסות ומלונות לדוגמה, אחשב תקציב ואבנה מסלול יום-יומי רגוע.";
    return streamText(fallback);
  }
}

function streamText(text: string) {
  const encoder = new TextEncoder();
  const words = text.split(/(\s+)/);

  const stream = new ReadableStream({
    async start(controller) {
      for (const word of words) {
        controller.enqueue(encoder.encode(word));
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
