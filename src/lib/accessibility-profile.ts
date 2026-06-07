// Accessibility profile onboarding (Task #1).
//
// Pure, framework-free helpers for the captured accessibility profile: parsing,
// localStorage persistence, and the mappers that pre-fill the existing search
// form, hero planner, and itinerary questionnaire from a saved profile.
//
// This is the onboarding *profile* (what the traveler tells us about themselves),
// NOT the verified accessibility data model (Task #2). It only reads/writes
// localStorage and maps onto fields that already exist elsewhere — it does not
// touch the Amadeus/Zod search contract.

import type { AccessibilityProfile } from "@/types/travel-marketplace";
import type { DietaryPreference, MobilityLevel } from "@/lib/travel-options";

export const A11Y_PROFILE_STORAGE_KEY = "trippilot:a11y-profile";

/** Mobility device the traveler uses day to day. */
export type MobilityDevice =
  | "none"
  | "manual"
  | "powered"
  | "walker"
  | "handbike";

export type AccessibilityOnboardingProfile = {
  mobilityDevice: MobilityDevice;
  /** Comfortable walking/rolling time per day, in minutes (matches TravelFormData.maxWalkingTimePerDay). */
  maxWalkingMinutes: number;
  avoidStairs: boolean;
  accessibleRestroomRequired: boolean;
  frequentRestBreaks: boolean;
  serviceAnimal: boolean;
  dietary: DietaryPreference;
};

const MOBILITY_DEVICES: readonly MobilityDevice[] = [
  "none",
  "manual",
  "powered",
  "walker",
  "handbike",
];

const DIETARY_VALUES: readonly DietaryPreference[] = [
  "none",
  "kosher",
  "vegetarian",
  "vegan",
  "gluten_free",
];

export const defaultAccessibilityProfile: AccessibilityOnboardingProfile = {
  mobilityDevice: "none",
  maxWalkingMinutes: 90,
  avoidStairs: false,
  accessibleRestroomRequired: false,
  frequentRestBreaks: false,
  serviceAnimal: false,
  dietary: "none",
};

function clampWalkingMinutes(value: unknown): number {
  const parsed =
    typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return defaultAccessibilityProfile.maxWalkingMinutes;
  return Math.min(240, Math.max(0, Math.round(parsed)));
}

/** Coerce arbitrary stored/posted input into a valid profile, never throwing. */
export function parseAccessibilityProfile(
  input: unknown,
): AccessibilityOnboardingProfile {
  if (!input || typeof input !== "object") {
    return { ...defaultAccessibilityProfile };
  }

  const raw = input as Record<string, unknown>;
  const device = MOBILITY_DEVICES.includes(raw.mobilityDevice as MobilityDevice)
    ? (raw.mobilityDevice as MobilityDevice)
    : defaultAccessibilityProfile.mobilityDevice;
  const dietary = DIETARY_VALUES.includes(raw.dietary as DietaryPreference)
    ? (raw.dietary as DietaryPreference)
    : defaultAccessibilityProfile.dietary;

  return {
    mobilityDevice: device,
    maxWalkingMinutes: clampWalkingMinutes(raw.maxWalkingMinutes),
    avoidStairs: raw.avoidStairs === true,
    accessibleRestroomRequired: raw.accessibleRestroomRequired === true,
    frequentRestBreaks: raw.frequentRestBreaks === true,
    serviceAnimal: raw.serviceAnimal === true,
    dietary,
  };
}

/** Read the saved profile from localStorage. Returns null when none is stored or unavailable. */
export function loadAccessibilityProfile(): AccessibilityOnboardingProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(A11Y_PROFILE_STORAGE_KEY);
    if (!raw) return null;
    return parseAccessibilityProfile(JSON.parse(raw));
  } catch {
    return null;
  }
}

/** Persist the profile to localStorage. Best-effort; never throws. */
export function saveAccessibilityProfile(
  profile: AccessibilityOnboardingProfile,
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      A11Y_PROFILE_STORAGE_KEY,
      JSON.stringify(parseAccessibilityProfile(profile)),
    );
  } catch {
    // Storage may be unavailable (private mode / quota) — degrade silently.
  }
}

function usesWheelchair(device: MobilityDevice): boolean {
  return device === "manual" || device === "powered" || device === "handbike";
}

/** Map a profile onto the search form's AccessibilityProfile + filter keys. */
export function deriveSearchPrefill(profile: AccessibilityOnboardingProfile): {
  accessibilityProfile: AccessibilityProfile;
  accessibilityFilters: string[];
} {
  let accessibilityProfile: AccessibilityProfile = "none";
  if (profile.mobilityDevice === "walker") {
    accessibilityProfile = "walker";
  } else if (profile.mobilityDevice === "handbike") {
    accessibilityProfile = "handbike";
  } else if (usesWheelchair(profile.mobilityDevice)) {
    accessibilityProfile = "wheelchair";
  }

  const filters = new Set<string>();
  if (usesWheelchair(profile.mobilityDevice)) {
    filters.add("wheelchair-accessible");
    filters.add("step-free-access");
    filters.add("elevator-required");
  }
  if (profile.mobilityDevice === "walker") {
    filters.add("walker-friendly");
    filters.add("step-free-access");
  }
  if (profile.avoidStairs) {
    filters.add("step-free-access");
    filters.add("elevator-required");
  }
  if (profile.accessibleRestroomRequired) {
    filters.add("accessible-bathroom");
    filters.add("accessible-toilet");
  }
  if (profile.frequentRestBreaks || profile.maxWalkingMinutes <= 30) {
    filters.add("short-walking-distances");
  }

  return {
    accessibilityProfile,
    accessibilityFilters: Array.from(filters),
  };
}

/** Map a profile onto the hero planner's accessibility option labels. */
export function deriveHeroAccessibility(
  profile: AccessibilityOnboardingProfile,
): string[] {
  const selected = new Set<string>();
  if (usesWheelchair(profile.mobilityDevice)) {
    selected.add("Wheelchair user");
    selected.add("Step-free hotels");
    selected.add("Accessible transport");
  }
  if (profile.mobilityDevice === "walker" || profile.maxWalkingMinutes <= 30) {
    selected.add("Limited walking");
  }
  if (profile.avoidStairs) {
    selected.add("Step-free hotels");
  }
  if (profile.frequentRestBreaks) {
    selected.add("Relaxed pace");
  }
  return Array.from(selected);
}

/** Map the onboarding mobility device onto a TravelFormData mobility level. */
export function deriveMobilityLevel(
  profile: AccessibilityOnboardingProfile,
): MobilityLevel {
  if (usesWheelchair(profile.mobilityDevice)) return "wheelchair";
  if (profile.mobilityDevice === "walker") return "limited_walking";
  return "full";
}
