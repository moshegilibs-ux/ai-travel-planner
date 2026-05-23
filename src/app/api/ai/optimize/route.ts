import { NextResponse } from "next/server";
import { z } from "zod";
import { optimizeDeals } from "@/lib/ai-tools";
import type { TripDeal } from "@/types/travel-marketplace";
import { rateLimit } from "@/lib/rate-limit";
import { apiError } from "@/lib/api-response";

const optimizeSchema = z.object({
  budget: z.number().min(0),
  deals: z.array(z.unknown()),
});

export async function POST(request: Request) {
  const limited = rateLimit({
    key: `ai-optimize:${request.headers.get("x-forwarded-for") || "local"}`,
    limit: 30,
  });

  if (!limited.ok) {
    return apiError("Too many optimization requests.", 429, "RATE_LIMITED");
  }

  const payload = optimizeSchema.parse(await request.json());
  const optimized = optimizeDeals(payload.deals as TripDeal[], payload.budget);

  return NextResponse.json({
    optimized,
    strategy:
      "Minimized total cost, prioritized higher hotel rating, and reduced layovers when possible.",
  });
}
