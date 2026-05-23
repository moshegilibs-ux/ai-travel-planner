import { NextResponse } from "next/server";
import { apiError } from "@/lib/api-response";
import { getFxApiKey, isMockMode } from "@/lib/env";
import { fetchWithRetry } from "@/lib/external-api";

type FxPayload = {
  available: boolean;
  from: string;
  to: string;
  amount: number;
  rate: number | null;
  converted: number | null;
  provider: string;
  lastChecked: string;
  warning?: string;
};

function normalizeCurrency(value: string) {
  return value.trim().toUpperCase().slice(0, 3) || "USD";
}

function unavailableResponse(from: string, to: string, amount: number, warning: string) {
  return NextResponse.json({
    available: false,
    from,
    to,
    amount,
    rate: null,
    converted: null,
    provider: "FX provider",
    lastChecked: new Date().toISOString(),
    warning,
  } satisfies FxPayload);
}

async function fetchExchangeRateHost(
  from: string,
  to: string,
  amount: number,
  apiKey: string,
): Promise<FxPayload> {
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
    throw new Error(`exchangerate.host failed with status ${response.status}`);
  }

  const data = (await response.json()) as {
    success?: boolean;
    result?: number;
    info?: { rate?: number };
    error?: { type?: string; info?: string };
  };

  if (data.success === false || typeof data.result !== "number") {
    throw new Error(data.error?.info || data.error?.type || "FX rate is unavailable");
  }

  return {
    available: true,
    from,
    to,
    amount,
    rate: data.info?.rate ?? (amount > 0 ? data.result / amount : null),
    converted: data.result,
    provider: "exchangerate.host",
    lastChecked: new Date().toISOString(),
  };
}

async function fetchExchangeRateApi(
  from: string,
  to: string,
  amount: number,
  apiKey: string,
): Promise<FxPayload> {
  const response = await fetchWithRetry(
    `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${from}/${to}/${amount}`,
    { cache: "no-store" },
    { retries: 2, timeoutMs: 8_000 },
  );

  if (!response.ok) {
    throw new Error(`ExchangeRate-API failed with status ${response.status}`);
  }

  const data = (await response.json()) as {
    result?: string;
    conversion_rate?: number;
    conversion_result?: number;
    "error-type"?: string;
  };

  if (data.result !== "success" || typeof data.conversion_result !== "number") {
    throw new Error(data["error-type"] || "FX rate is unavailable");
  }

  return {
    available: true,
    from,
    to,
    amount,
    rate: data.conversion_rate ?? null,
    converted: data.conversion_result,
    provider: "ExchangeRate-API",
    lastChecked: new Date().toISOString(),
  };
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const from = normalizeCurrency(params.get("from") || "USD");
  const to = normalizeCurrency(params.get("to") || "ILS");
  const amount = Number(params.get("amount") || 1);
  const apiKey = getFxApiKey();

  if (!Number.isFinite(amount) || amount <= 0) {
    return apiError("amount must be a positive number.", 400, "VALIDATION_ERROR");
  }

  if (from === to) {
    return NextResponse.json({
      available: true,
      from,
      to,
      amount,
      rate: 1,
      converted: amount,
      provider: "local",
      lastChecked: new Date().toISOString(),
    } satisfies FxPayload);
  }

  if (isMockMode() || !apiKey) {
    return unavailableResponse(from, to, amount, "שער מטבע לא זמין כרגע");
  }

  try {
    return NextResponse.json(await fetchExchangeRateHost(from, to, amount, apiKey));
  } catch (exchangeRateHostError) {
    console.error("[fx] exchangerate.host request failed", exchangeRateHostError);

    try {
      return NextResponse.json(await fetchExchangeRateApi(from, to, amount, apiKey));
    } catch (exchangeRateApiError) {
      console.error("[fx] ExchangeRate-API request failed", exchangeRateApiError);
      return apiError("FX provider is unavailable.", 503, "FX_UNAVAILABLE", {
        from,
        to,
        amount,
      });
    }
  }
}
