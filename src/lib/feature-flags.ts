export type FeatureFlags = {
  ai: boolean;
  payments: boolean;
  affiliateLinks: boolean;
  waitlistMode: boolean;
  maintenanceMode: boolean;
  onboardingMode: boolean;
};

function isEnabled(value: string | undefined, defaultValue = true) {
  if (value === undefined || value === "") {
    return defaultValue;
  }

  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

export function getFeatureFlags(): FeatureFlags {
  const env = getFeatureEnv();

  return {
    ai: isEnabled(env.ai),
    payments: isEnabled(env.payments),
    affiliateLinks: isEnabled(env.affiliateLinks),
    waitlistMode: isEnabled(env.waitlistMode, false),
    maintenanceMode: isEnabled(env.maintenanceMode, false),
    onboardingMode: isEnabled(env.onboardingMode, true),
  };
}

export function getPublicFeatureFlags() {
  const flags = getFeatureFlags();

  return {
    ai: flags.ai,
    payments: flags.payments,
    affiliateLinks: flags.affiliateLinks,
    waitlistMode: flags.waitlistMode,
    maintenanceMode: flags.maintenanceMode,
    onboardingMode: flags.onboardingMode,
  };
}
import { getFeatureEnv } from "@/lib/env";
