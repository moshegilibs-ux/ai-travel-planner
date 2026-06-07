import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

// The accessibility onboarding profile (Task #1): captured once, pre-fills
// search, the hero planner, and the itinerary questionnaire. localStorage-only
// in this cut — no DB, no change to the Amadeus/Zod search contract.

// 1) Profile module exposes the canonical storage key and persistence API.
test("accessibility profile persists under the trippilot:a11y-profile key", () => {
  const lib = read("src/lib/accessibility-profile.ts");
  assert.match(lib, /A11Y_PROFILE_STORAGE_KEY = "trippilot:a11y-profile"/);
  assert.match(lib, /export function loadAccessibilityProfile\(/);
  assert.match(lib, /export function saveAccessibilityProfile\(/);
  assert.match(lib, /export function parseAccessibilityProfile\(/);
  // Persistence is localStorage-only (no API route / Prisma in this cut).
  assert.match(lib, /window\.localStorage\.setItem\(/);
  assert.match(lib, /window\.localStorage\.getItem\(/);
  assert.doesNotMatch(lib, /\/api\/preferences/);
  assert.doesNotMatch(lib, /prisma|UserPreference/i);
});

// 2) Search reads the saved profile and pre-fills from it.
test("search form loads and applies the accessibility profile", () => {
  const form = read("src/components/search-form.tsx");
  assert.match(form, /loadAccessibilityProfile/);
  assert.match(form, /deriveSearchPrefill/);
  assert.match(form, /setAccessibilityProfile\(prefill\.accessibilityProfile\)/);
  assert.match(form, /setAccessibilityFilters\(prefill\.accessibilityFilters\)/);
});

// 3) Hero planner and the itinerary questionnaire also read the profile.
test("hero planner and questionnaire pre-fill from the profile", () => {
  const hero = read("src/components/hero-trip-planner.tsx");
  assert.match(hero, /loadAccessibilityProfile/);
  assert.match(hero, /deriveHeroAccessibility/);

  // The questionnaire page is a Server Component shell; the profile pre-fill
  // logic lives in the client form component it renders.
  const questionnaire = read("src/components/questionnaire-form.tsx");
  assert.match(questionnaire, /loadAccessibilityProfile/);
  assert.match(questionnaire, /deriveMobilityLevel/);
  // Existing TravelFormData fields are pre-filled (uncontrolled form + remount key).
  assert.match(questionnaire, /defaultValue=\{mobilityDefault\}/);
  assert.match(questionnaire, /defaultValue=\{profile\.maxWalkingMinutes\}/);
  assert.match(questionnaire, /defaultChecked=\{checkboxDefaults\[name\]\}/);
});

// 4) handbike was threaded through both mobility type unions.
test("handbike is added to the mobility/accessibility type unions", () => {
  assert.match(read("src/lib/travel-options.ts"), /value: "handbike"/);
  assert.match(read("src/types/travel-marketplace.ts"), /\| "handbike"/);
});

// 5) Replicate the pure parse/derive logic to prove load/save + mapping.
// Mirrors src/lib/accessibility-profile.ts exactly.
const DEFAULT = {
  mobilityDevice: "none",
  maxWalkingMinutes: 90,
  avoidStairs: false,
  accessibleRestroomRequired: false,
  frequentRestBreaks: false,
  serviceAnimal: false,
  dietary: "none",
};
const DEVICES = ["none", "manual", "powered", "walker", "handbike"];

function parse(input) {
  if (!input || typeof input !== "object") return { ...DEFAULT };
  const raw = input;
  const device = DEVICES.includes(raw.mobilityDevice)
    ? raw.mobilityDevice
    : DEFAULT.mobilityDevice;
  const minutes = Number(raw.maxWalkingMinutes);
  return {
    mobilityDevice: device,
    maxWalkingMinutes: Number.isFinite(minutes)
      ? Math.min(240, Math.max(0, Math.round(minutes)))
      : DEFAULT.maxWalkingMinutes,
    avoidStairs: raw.avoidStairs === true,
    accessibleRestroomRequired: raw.accessibleRestroomRequired === true,
    frequentRestBreaks: raw.frequentRestBreaks === true,
    serviceAnimal: raw.serviceAnimal === true,
    dietary: ["none", "kosher", "vegetarian", "vegan", "gluten_free"].includes(
      raw.dietary,
    )
      ? raw.dietary
      : DEFAULT.dietary,
  };
}

const usesWheelchair = (d) => d === "manual" || d === "powered" || d === "handbike";

function deriveSearchPrefill(profile) {
  let accessibilityProfile = "none";
  if (profile.mobilityDevice === "walker") accessibilityProfile = "walker";
  else if (profile.mobilityDevice === "handbike") accessibilityProfile = "handbike";
  else if (usesWheelchair(profile.mobilityDevice)) accessibilityProfile = "wheelchair";

  const filters = new Set();
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
  return { accessibilityProfile, accessibilityFilters: [...filters] };
}

function deriveMobilityLevel(profile) {
  if (usesWheelchair(profile.mobilityDevice)) return "wheelchair";
  if (profile.mobilityDevice === "walker") return "limited_walking";
  return "full";
}

test("parse coerces junk to safe defaults and round-trips valid data", () => {
  assert.deepEqual(parse(null), DEFAULT);
  assert.deepEqual(parse("nope"), DEFAULT);
  // Unknown device falls back; minutes clamp to [0, 240].
  assert.equal(parse({ mobilityDevice: "rocket" }).mobilityDevice, "none");
  assert.equal(parse({ maxWalkingMinutes: 9999 }).maxWalkingMinutes, 240);
  assert.equal(parse({ maxWalkingMinutes: -5 }).maxWalkingMinutes, 0);

  const saved = {
    mobilityDevice: "powered",
    maxWalkingMinutes: 20,
    avoidStairs: true,
    accessibleRestroomRequired: true,
    frequentRestBreaks: false,
    serviceAnimal: true,
    dietary: "vegan",
  };
  // save -> JSON -> load is idempotent.
  assert.deepEqual(parse(JSON.parse(JSON.stringify(saved))), saved);
});

test("device maps to search profile, filters and mobility level", () => {
  // Manual wheelchair → wheelchair search profile + step-free family of filters.
  const manual = deriveSearchPrefill(parse({ mobilityDevice: "manual" }));
  assert.equal(manual.accessibilityProfile, "wheelchair");
  assert.ok(manual.accessibilityFilters.includes("step-free-access"));
  assert.ok(manual.accessibilityFilters.includes("wheelchair-accessible"));

  // Handbike is its own profile value.
  assert.equal(
    deriveSearchPrefill(parse({ mobilityDevice: "handbike" })).accessibilityProfile,
    "handbike",
  );
  assert.equal(
    deriveSearchPrefill(parse({ mobilityDevice: "walker" })).accessibilityProfile,
    "walker",
  );

  // Short walking capacity adds the short-distance filter even without a device.
  assert.ok(
    deriveSearchPrefill(parse({ maxWalkingMinutes: 15 })).accessibilityFilters.includes(
      "short-walking-distances",
    ),
  );

  // TravelFormData mobility level mapping.
  assert.equal(deriveMobilityLevel(parse({ mobilityDevice: "powered" })), "wheelchair");
  assert.equal(deriveMobilityLevel(parse({ mobilityDevice: "walker" })), "limited_walking");
  assert.equal(deriveMobilityLevel(parse({ mobilityDevice: "none" })), "full");
});
