import {
  getAdminAccessToken,
  hasAmadeus,
  hasFxProvider,
  hasGoogleMaps,
  hasHotelProvider,
  hasOpenAI,
  hasWeatherProvider,
  isMockMode,
  validateProductionRuntimeEnv,
} from "@/lib/env";

export function isAdminTokenConfigured() {
  return Boolean(getAdminAccessToken());
}

export function isValidAdminToken(token?: string | null) {
  const expectedToken = getAdminAccessToken();

  return Boolean(expectedToken && token && token === expectedToken);
}

export function getApiStatus() {
  validateProductionRuntimeEnv();

  const useMockData = isMockMode();
  const aiConfigured = hasOpenAI();
  const googleMapsConfigured = hasGoogleMaps();
  const flightsConfigured = hasAmadeus();
  const hotelsConfigured = hasHotelProvider();
  const fxConfigured = hasFxProvider();
  const weatherConfigured = hasWeatherProvider();

  return {
    useMockData,
    aiConfigured,
    googleMapsConfigured,
    flightsConfigured,
    hotelsConfigured,
    fxConfigured,
    weatherConfigured,
    activeProviders: {
      ai: !useMockData && aiConfigured ? "openai" : "mock",
      places: !useMockData && googleMapsConfigured ? "google-places" : "mock",
      maps: !useMockData && googleMapsConfigured ? "google-maps" : "mock",
      flights: !useMockData && flightsConfigured ? "amadeus" : "unavailable",
      hotels: !useMockData && hotelsConfigured ? "amadeus-hotels" : "unavailable",
      fx: !useMockData && fxConfigured ? "fx-provider" : "unavailable",
      weather: !useMockData && weatherConfigured ? "weather-provider" : "unavailable",
    },
    messages: {
      dataMode: useMockData ? "Mock data active" : "Real data active",
      ai: aiConfigured ? "Real data active" : "Missing API key",
      googleMaps: googleMapsConfigured ? "Real data active" : "Missing API key",
      flights: flightsConfigured ? "Real data active" : "Missing API key",
      hotels: hotelsConfigured ? "Real data active" : "Missing API key",
      fx: fxConfigured ? "Real data active" : "Missing API key",
      weather: weatherConfigured ? "Real data active" : "Missing API key",
      fallback: "Unavailable data is shown as לא זמין כרגע instead of fake prices",
    },
  } as const;
}

export type ApiStatus = ReturnType<typeof getApiStatus>;
