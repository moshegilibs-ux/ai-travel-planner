import {
  getAdminAccessToken,
  hasAmadeus,
  hasGoogleMaps,
  hasOpenAI,
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

  return {
    useMockData,
    aiConfigured,
    googleMapsConfigured,
    flightsConfigured,
    activeProviders: {
      ai: !useMockData && aiConfigured ? "openai" : "mock",
      places: !useMockData && googleMapsConfigured ? "google-places" : "mock",
      maps: !useMockData && googleMapsConfigured ? "google-maps" : "mock",
      flights: !useMockData && flightsConfigured ? "amadeus" : "mock",
    },
    messages: {
      dataMode: useMockData ? "Mock data active" : "Real data active",
      ai: aiConfigured ? "Real data active" : "Missing API key",
      googleMaps: googleMapsConfigured ? "Real data active" : "Missing API key",
      flights: flightsConfigured ? "Real data active" : "Missing API key",
      fallback: "Fallback enabled",
    },
  } as const;
}

export type ApiStatus = ReturnType<typeof getApiStatus>;
