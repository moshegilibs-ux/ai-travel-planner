import { NextResponse } from "next/server";
import { getWeatherApiKey, isMockMode } from "@/lib/env";
import { fetchWithRetry } from "@/lib/external-api";
import { apiError } from "@/lib/api-response";

const destinationMap: Record<string, string> = {
  ath: "Athens",
  athens: "Athens",
  greece: "Athens",
  tlv: "Tel Aviv",
  "tel aviv": "Tel Aviv",
  telaviv: "Tel Aviv",
  par: "Paris",
  paris: "Paris",
  lon: "London",
  london: "London",
  nyc: "New York",
  "new york": "New York",
  rom: "Rome",
  rome: "Rome",
  bcn: "Barcelona",
  barcelona: "Barcelona",
  ams: "Amsterdam",
  amsterdam: "Amsterdam",
  dxb: "Dubai",
  dubai: "Dubai",
  bkk: "Bangkok",
  bangkok: "Bangkok",
  thailand: "Bangkok",
};

type WeatherPayload = {
  available: boolean;
  destination: string;
  provider: string;
  current: {
    description: string;
    temperatureC: number | null;
    feelsLikeC: number | null;
    humidity: number | null;
    windSpeed: number | null;
  } | null;
  lastChecked: string;
  warning?: string;
};

function normalizeDestination(value: string) {
  const cleanValue = value.trim();
  return destinationMap[cleanValue.toLowerCase()] || cleanValue;
}

async function fetchOpenWeather(destination: string, apiKey: string): Promise<WeatherPayload> {
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
    throw new Error(`OpenWeather failed with status ${response.status}`);
  }

  const data = (await response.json()) as {
    name?: string;
    weather?: Array<{ description?: string }>;
    main?: { temp?: number; feels_like?: number; humidity?: number };
    wind?: { speed?: number };
  };

  return {
    available: true,
    destination: data.name || destination,
    provider: "OpenWeather",
    current: {
      description: data.weather?.[0]?.description ?? "",
      temperatureC: data.main?.temp ?? null,
      feelsLikeC: data.main?.feels_like ?? null,
      humidity: data.main?.humidity ?? null,
      windSpeed: data.wind?.speed ?? null,
    },
    lastChecked: new Date().toISOString(),
  };
}

async function fetchWeatherApi(destination: string, apiKey: string): Promise<WeatherPayload> {
  const response = await fetchWithRetry(
    `https://api.weatherapi.com/v1/current.json?${new URLSearchParams({
      key: apiKey,
      q: destination,
      lang: "he",
    }).toString()}`,
    { cache: "no-store" },
    { retries: 2, timeoutMs: 8_000 },
  );

  if (!response.ok) {
    throw new Error(`WeatherAPI failed with status ${response.status}`);
  }

  const data = (await response.json()) as {
    location?: { name?: string };
    current?: {
      temp_c?: number;
      feelslike_c?: number;
      humidity?: number;
      wind_kph?: number;
      condition?: { text?: string };
    };
  };

  return {
    available: true,
    destination: data.location?.name || destination,
    provider: "WeatherAPI",
    current: {
      description: data.current?.condition?.text ?? "",
      temperatureC: data.current?.temp_c ?? null,
      feelsLikeC: data.current?.feelslike_c ?? null,
      humidity: data.current?.humidity ?? null,
      windSpeed: data.current?.wind_kph ?? null,
    },
    lastChecked: new Date().toISOString(),
  };
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const destination = params.get("destination") || "";
  const weatherDestination = normalizeDestination(destination);
  const apiKey = getWeatherApiKey();

  if (!destination) {
    return apiError("destination is required.", 400, "VALIDATION_ERROR");
  }

  if (isMockMode() || !apiKey) {
    return NextResponse.json({
      available: false,
      destination: weatherDestination,
      provider: "OpenWeather",
      current: null,
      forecast: [],
      lastChecked: new Date().toISOString(),
      warning: "לא זמין כרגע",
    });
  }

  try {
    return NextResponse.json(await fetchOpenWeather(weatherDestination, apiKey));
  } catch (openWeatherError) {
    console.error("[weather] OpenWeather request failed", openWeatherError);

    try {
      return NextResponse.json(await fetchWeatherApi(weatherDestination, apiKey));
    } catch (weatherApiError) {
      console.error("[weather] WeatherAPI request failed", weatherApiError);
      return apiError("Weather provider is unavailable.", 503, "WEATHER_UNAVAILABLE", {
        destination: weatherDestination,
      });
    }
  }
}
