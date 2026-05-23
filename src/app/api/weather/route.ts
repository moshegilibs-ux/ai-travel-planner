import { NextResponse } from "next/server";
import { getWeatherApiKey, isMockMode, validateProductionRuntimeEnv } from "@/lib/env";
import { fetchWithRetry } from "@/lib/external-api";
import { apiError } from "@/lib/api-response";

export async function GET(request: Request) {
  validateProductionRuntimeEnv();

  const params = new URL(request.url).searchParams;
  const destination = params.get("destination") || "";
  const apiKey = getWeatherApiKey();

  if (!destination) {
    return apiError("destination is required.", 400, "VALIDATION_ERROR");
  }

  if (isMockMode() || !apiKey) {
    return NextResponse.json({
      available: false,
      destination,
      provider: "OpenWeather",
      current: null,
      forecast: [],
      lastChecked: new Date().toISOString(),
      warning: "לא זמין כרגע",
    });
  }

  try {
    const response = await fetchWithRetry(
      `https://api.openweathermap.org/data/2.5/weather?${new URLSearchParams({
        q: destination,
        appid: apiKey,
        units: "metric",
        lang: "he",
      }).toString()}`,
      { cache: "no-store" },
      { retries: 2, timeoutMs: 8_000 },
    );

    if (!response.ok) {
      return apiError("Weather provider is unavailable.", 503, "WEATHER_UNAVAILABLE");
    }

    const data = (await response.json()) as {
      weather?: Array<{ description?: string }>;
      main?: { temp?: number; feels_like?: number; humidity?: number };
      wind?: { speed?: number };
    };

    return NextResponse.json({
      available: true,
      destination,
      provider: "OpenWeather",
      current: {
        description: data.weather?.[0]?.description ?? "",
        temperatureC: data.main?.temp ?? null,
        feelsLikeC: data.main?.feels_like ?? null,
        humidity: data.main?.humidity ?? null,
        windSpeed: data.wind?.speed ?? null,
      },
      lastChecked: new Date().toISOString(),
    });
  } catch {
    return apiError("Weather provider is unavailable.", 503, "WEATHER_UNAVAILABLE");
  }
}
