import { NextResponse } from "next/server";
import { getFxApiKey, isMockMode, validateProductionRuntimeEnv } from "@/lib/env";
import { fetchWithRetry } from "@/lib/external-api";
import { apiError } from "@/lib/api-response";

export async function GET(request: Request) {
  validateProductionRuntimeEnv();

  const params = new URL(request.url).searchParams;
  const from = params.get("from") || "USD";
  const to = params.get("to") || "ILS";
  const amount = Number(params.get("amount") || 1);
  const apiKey = getFxApiKey();

  if (isMockMode() || !apiKey) {
    return NextResponse.json({
      available: false,
      rate: null,
      converted: null,
      provider: "FX provider",
      lastChecked: new Date().toISOString(),
      warning: "לא זמין כרגע",
    });
  }

  try {
    const response = await fetchWithRetry(
      `https://api.exchangerate.host/convert?${new URLSearchParams({
        access_key: apiKey,
        from,
        to,
        amount: String(amount),
      }).toString()}`,
      { cache: "no-store" },
      { retries: 2, timeoutMs: 8_000 },
    );

    if (!response.ok) {
      return apiError("FX provider is unavailable.", 503, "FX_UNAVAILABLE");
    }

    const data = (await response.json()) as {
      success?: boolean;
      result?: number;
      info?: { rate?: number };
    };

    if (data.success === false || typeof data.result !== "number") {
      return apiError("FX rate is unavailable.", 503, "FX_UNAVAILABLE");
    }

    return NextResponse.json({
      available: true,
      from,
      to,
      amount,
      rate: data.info?.rate ?? null,
      converted: data.result,
      provider: "exchangerate.host",
      lastChecked: new Date().toISOString(),
    });
  } catch {
    return apiError("FX provider is unavailable.", 503, "FX_UNAVAILABLE");
  }
}
