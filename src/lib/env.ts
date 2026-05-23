import { z } from "zod";

const optionalString = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().optional(),
);

const publicMockModeSchema = z.enum(["true", "false"]).optional();

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  OPENAI_API_KEY: optionalString,
  AI_API_KEY: optionalString,
  OPENAI_MODEL: optionalString,
  GOOGLE_MAPS_API_KEY: optionalString,
  AMADEUS_CLIENT_ID: optionalString,
  AMADEUS_CLIENT_SECRET: optionalString,
  HOTEL_API_KEY: optionalString,
  FX_API_KEY: optionalString,
  WEATHER_API_KEY: optionalString,
  AMADEUS_API_KEY: optionalString,
  AMADEUS_API_SECRET: optionalString,
  AMADEUS_BASE_URL: optionalString,
  ADMIN_ACCESS_TOKEN: optionalString,
  NEXT_PUBLIC_USE_MOCK_DATA: publicMockModeSchema,
  DATABASE_URL: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().url().optional(),
  ),
  NEXTAUTH_SECRET: optionalString,
  NEXTAUTH_URL: optionalString,
  GOOGLE_CLIENT_ID: optionalString,
  GOOGLE_CLIENT_SECRET: optionalString,
  NEXT_PUBLIC_APP_URL: optionalString,
  POSTHOG_API_KEY: optionalString,
  POSTHOG_HOST: optionalString,
  RESEND_API_KEY: optionalString,
  RESEND_FROM_EMAIL: optionalString,
  STRIPE_SECRET_KEY: optionalString,
  STRIPE_WEBHOOK_SECRET: optionalString,
  STRIPE_PRO_PRICE_ID: optionalString,
  STRIPE_PREMIUM_PRICE_ID: optionalString,
  UPSTASH_REDIS_REST_URL: optionalString,
  UPSTASH_REDIS_REST_TOKEN: optionalString,
  AFFILIATE_ID: optionalString,
  CRON_SECRET: optionalString,
  FEATURE_AI_ENABLED: optionalString,
  FEATURE_PAYMENTS_ENABLED: optionalString,
  FEATURE_AFFILIATE_LINKS_ENABLED: optionalString,
  WAITLIST_MODE: optionalString,
  MAINTENANCE_MODE: optionalString,
  NEXT_PUBLIC_ONBOARDING_MODE: optionalString,
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cachedEnv: ServerEnv | null = null;
let mockModeLogged = false;
let productionMockWarningLogged = false;

export function getServerEnv() {
  if (cachedEnv) return cachedEnv;

  cachedEnv = serverEnvSchema.parse({
    NODE_ENV: process.env.NODE_ENV,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    AI_API_KEY: process.env.AI_API_KEY,
    OPENAI_MODEL: process.env.OPENAI_MODEL,
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
    AMADEUS_CLIENT_ID: process.env.AMADEUS_CLIENT_ID,
    AMADEUS_CLIENT_SECRET: process.env.AMADEUS_CLIENT_SECRET,
    HOTEL_API_KEY: process.env.HOTEL_API_KEY,
    FX_API_KEY: process.env.FX_API_KEY,
    WEATHER_API_KEY: process.env.WEATHER_API_KEY,
    AMADEUS_API_KEY: process.env.AMADEUS_API_KEY,
    AMADEUS_API_SECRET: process.env.AMADEUS_API_SECRET,
    AMADEUS_BASE_URL: process.env.AMADEUS_BASE_URL,
    ADMIN_ACCESS_TOKEN: process.env.ADMIN_ACCESS_TOKEN,
    NEXT_PUBLIC_USE_MOCK_DATA: process.env.NEXT_PUBLIC_USE_MOCK_DATA,
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    POSTHOG_API_KEY: process.env.POSTHOG_API_KEY,
    POSTHOG_HOST: process.env.POSTHOG_HOST,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_PRO_PRICE_ID: process.env.STRIPE_PRO_PRICE_ID,
    STRIPE_PREMIUM_PRICE_ID: process.env.STRIPE_PREMIUM_PRICE_ID,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    AFFILIATE_ID: process.env.AFFILIATE_ID,
    CRON_SECRET: process.env.CRON_SECRET,
    FEATURE_AI_ENABLED: process.env.FEATURE_AI_ENABLED,
    FEATURE_PAYMENTS_ENABLED: process.env.FEATURE_PAYMENTS_ENABLED,
    FEATURE_AFFILIATE_LINKS_ENABLED: process.env.FEATURE_AFFILIATE_LINKS_ENABLED,
    WAITLIST_MODE: process.env.WAITLIST_MODE,
    MAINTENANCE_MODE: process.env.MAINTENANCE_MODE,
    NEXT_PUBLIC_ONBOARDING_MODE: process.env.NEXT_PUBLIC_ONBOARDING_MODE,
  });

  return cachedEnv;
}

export function isProduction() {
  return getServerEnv().NODE_ENV === "production";
}

export function isMockMode() {
  const value = getServerEnv().NEXT_PUBLIC_USE_MOCK_DATA;

  if (value === undefined) {
    return !isProduction();
  }

  return value !== "false";
}

export function hasOpenAI() {
  const env = getServerEnv();
  return Boolean(env.OPENAI_API_KEY || env.AI_API_KEY);
}

export function getOpenAIKey() {
  const env = getServerEnv();
  return env.OPENAI_API_KEY || env.AI_API_KEY || "";
}

export function hasGoogleMaps() {
  return Boolean(getServerEnv().GOOGLE_MAPS_API_KEY);
}

export function hasAmadeus() {
  const env = getServerEnv();
  return Boolean(
    (env.AMADEUS_CLIENT_ID || env.AMADEUS_API_KEY) &&
      (env.AMADEUS_CLIENT_SECRET || env.AMADEUS_API_SECRET),
  );
}

export function hasHotelProvider() {
  const env = getServerEnv();
  return hasAmadeus() || Boolean(env.HOTEL_API_KEY);
}

export function hasFxProvider() {
  return Boolean(getServerEnv().FX_API_KEY);
}

export function hasWeatherProvider() {
  return Boolean(getServerEnv().WEATHER_API_KEY);
}

export function getAmadeusCredentials() {
  const env = getServerEnv();

  return {
    clientId: env.AMADEUS_CLIENT_ID || env.AMADEUS_API_KEY || "",
    clientSecret: env.AMADEUS_CLIENT_SECRET || env.AMADEUS_API_SECRET || "",
  };
}

export function getAmadeusBaseUrl() {
  return getServerEnv().AMADEUS_BASE_URL || "https://test.api.amadeus.com";
}

export function getAdminAccessToken() {
  return getServerEnv().ADMIN_ACCESS_TOKEN || "";
}

export function getGoogleMapsApiKey() {
  return getServerEnv().GOOGLE_MAPS_API_KEY || "";
}

export function getHotelApiKey() {
  return getServerEnv().HOTEL_API_KEY || "";
}

export function getFxApiKey() {
  return getServerEnv().FX_API_KEY || "";
}

export function getWeatherApiKey() {
  return getServerEnv().WEATHER_API_KEY || "";
}

export function getOpenAIModel() {
  return getServerEnv().OPENAI_MODEL || "gpt-4.1-mini";
}

export function getAppUrl() {
  return getServerEnv().NEXT_PUBLIC_APP_URL || "http://localhost:3001";
}

export function getCronSecret() {
  return getServerEnv().CRON_SECRET || "";
}

export function getAffiliateId() {
  return getServerEnv().AFFILIATE_ID || "";
}

export function getStripeSecretKey() {
  return getServerEnv().STRIPE_SECRET_KEY || "";
}

export function getStripeWebhookSecret() {
  return getServerEnv().STRIPE_WEBHOOK_SECRET || "";
}

export function getStripePriceId(plan: "pro" | "premium") {
  const env = getServerEnv();
  return plan === "pro" ? env.STRIPE_PRO_PRICE_ID : env.STRIPE_PREMIUM_PRICE_ID;
}

export function getRedisEnv() {
  const env = getServerEnv();
  return {
    url: env.UPSTASH_REDIS_REST_URL || "",
    token: env.UPSTASH_REDIS_REST_TOKEN || "",
  };
}

export function getPostHogEnv() {
  const env = getServerEnv();
  return {
    apiKey: env.POSTHOG_API_KEY || "",
    host: env.POSTHOG_HOST || "",
  };
}

export function getEmailEnv() {
  const env = getServerEnv();
  return {
    resendApiKey: env.RESEND_API_KEY || "",
    resendFromEmail: env.RESEND_FROM_EMAIL || "",
  };
}

export function getFeatureEnv() {
  const env = getServerEnv();
  return {
    ai: env.FEATURE_AI_ENABLED,
    payments: env.FEATURE_PAYMENTS_ENABLED,
    affiliateLinks: env.FEATURE_AFFILIATE_LINKS_ENABLED,
    waitlistMode: env.WAITLIST_MODE,
    maintenanceMode: env.MAINTENANCE_MODE,
    onboardingMode: env.NEXT_PUBLIC_ONBOARDING_MODE,
  };
}

export function logMockMode(reason: string) {
  if (mockModeLogged) return;
  mockModeLogged = true;
  console.warn(`[env] Mock data active: ${reason}`);
}

export function warnIfProductionMockMode() {
  if (!isProduction() || !isMockMode() || productionMockWarningLogged) return;
  productionMockWarningLogged = true;
  console.warn(
    "[env] WARNING: NODE_ENV=production with NEXT_PUBLIC_USE_MOCK_DATA=true. Real providers are disabled.",
  );
}

export function validateProductionEnv(requiredVariables: string[]) {
  warnIfProductionMockMode();

  if (!isProduction()) return;

  const missing = requiredVariables.filter((key) => {
    const value = process.env[key];
    return !value || value.trim() === "";
  });

  if (missing.length) {
    throw new Error(
      `Missing required production environment variables: ${missing.join(", ")}`,
    );
  }
}

export function validateProductionRuntimeEnv() {
  validateProductionEnv(["ADMIN_ACCESS_TOKEN"]);

  if (!isProduction() || isMockMode()) return;

  validateProductionEnv([
    "OPENAI_API_KEY",
    "GOOGLE_MAPS_API_KEY",
    "AMADEUS_CLIENT_ID",
    "AMADEUS_CLIENT_SECRET",
    "FX_API_KEY",
    "WEATHER_API_KEY",
  ]);
}

export function getEnvironmentStatus() {
  const env = getServerEnv();

  return {
    isProduction: isProduction(),
    isMockMode: isMockMode(),
    hasDatabase: Boolean(env.DATABASE_URL),
    hasGoogleAuth: Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
    hasNextAuthSecret: Boolean(env.NEXTAUTH_SECRET),
    hasAmadeus: hasAmadeus(),
    hasHotelProvider: hasHotelProvider(),
    hasFxProvider: hasFxProvider(),
    hasWeatherProvider: hasWeatherProvider(),
    hasOpenAI: hasOpenAI(),
    hasGoogleMaps: hasGoogleMaps(),
    hasAdminAccessToken: Boolean(env.ADMIN_ACCESS_TOKEN),
  };
}
