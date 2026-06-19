import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

// ---------------------------------------------------------------------------
// The engine is TypeScript and node:test cannot import it directly, so we (a)
// assert the real module enforces the integrity rules via source checks, and
// (b) re-implement the exact scoring algorithm here to prove its behaviour.
// ---------------------------------------------------------------------------

const SOURCE_CONFIDENCE = {
  user_review: 1.0,
  manual_audit: 1.0,
  api: 0.6,
  hotel_claim: 0.4,
  none: 0.0,
};
const CRITICAL_WEIGHT_THRESHOLD = 7;

function statusValue(status) {
  if (status === "verified" || status === "declared") return 1;
  if (status === "absent") return 0;
  return null; // unknown
}

// Faithful replica of calculateAccessibilityScore (incl. the hardening tweak).
function score(weights, facts) {
  const factByReq = new Map(facts.map((f) => [f.requirement, f]));
  let weightedSum = 0;
  let weightTotal = 0;
  let criticalChecked = 0;
  let criticalTotal = 0;
  let hasCriticalUnknowns = false;

  for (const reqId of Object.keys(weights)) {
    const weight = weights[reqId] ?? 0;
    if (weight <= 0) continue;
    const isCritical = weight >= CRITICAL_WEIGHT_THRESHOLD;
    if (isCritical) criticalTotal++;

    const fact = factByReq.get(reqId);
    let status = fact?.status ?? "unknown";
    const src = fact?.source ?? "none";
    const confidence = SOURCE_CONFIDENCE[src];
    // hardening: verified/declared with no real source is not real knowledge
    if ((status === "verified" || status === "declared") && confidence === 0) {
      status = "unknown";
    }
    const value = statusValue(status);
    if (value === null) {
      if (isCritical) hasCriticalUnknowns = true;
      continue;
    }
    if (isCritical) criticalChecked++;
    weightedSum += weight * value * confidence;
    weightTotal += weight;
  }

  const final = weightTotal === 0 ? 0 : Math.round((weightedSum / weightTotal) * 100);
  return {
    score: final,
    coverage: { checked: criticalChecked, total: criticalTotal },
    hasCriticalUnknowns,
  };
}

// Small wheelchair-ish weight map for the algorithm tests.
const W = { step_free_access: 10, elevator: 9, ramp: 7, short_walking: 4 };

test("unknown facts never inflate the score and always hurt coverage", () => {
  const r = score(W, []); // nothing known
  assert.equal(r.score, 0);
  assert.equal(r.coverage.checked, 0);
  assert.equal(r.coverage.total, 3); // step_free(10), elevator(9), ramp(7) are critical
  assert.equal(r.hasCriticalUnknowns, true);
});

test("verified facts from a human source produce a high, fully-covered score", () => {
  const facts = [
    { requirement: "step_free_access", status: "verified", source: "user_review" },
    { requirement: "elevator", status: "verified", source: "manual_audit" },
    { requirement: "ramp", status: "verified", source: "user_review" },
    { requirement: "short_walking", status: "verified", source: "api" },
  ];
  const r = score(W, facts);
  // 10*1*1 + 9*1*1 + 7*1*1 + 4*1*0.6 = 28.4 over weightTotal 30 → round(94.67) = 95.
  // (short_walking is api-sourced = 0.6 confidence, so the score is 95, not 100.)
  assert.equal(r.score, 95);
  assert.deepEqual(r.coverage, { checked: 3, total: 3 });
  assert.equal(r.hasCriticalUnknowns, false);
});

test("a hotel self-claim is discounted vs a verified human source", () => {
  const claim = score(W, [{ requirement: "step_free_access", status: "declared", source: "hotel_claim" }]);
  const verified = score(W, [{ requirement: "step_free_access", status: "verified", source: "user_review" }]);
  // single requirement → score = value * confidence * 100
  assert.equal(claim.score, 40); // 1 * 0.4
  assert.equal(verified.score, 100); // 1 * 1.0
  assert.ok(claim.score < verified.score);
});

test("an explicitly absent requirement drags the score down", () => {
  const r = score(W, [
    { requirement: "step_free_access", status: "verified", source: "user_review" }, // w10, val1
    { requirement: "elevator", status: "absent", source: "manual_audit" }, // w9, val0
  ]);
  // weightedSum = 10*1*1 + 9*0*1 = 10 ; weightTotal = 19 ; round(10/19*100)=53
  assert.equal(r.score, 53);
  assert.equal(r.coverage.checked, 2);
});

test("HARDENING: verified/declared with source 'none' is demoted to unknown", () => {
  const r = score(W, [{ requirement: "step_free_access", status: "verified", source: "none" }]);
  assert.equal(r.score, 0); // demoted to unknown → not counted
  assert.equal(r.coverage.checked, 0);
  assert.equal(r.hasCriticalUnknowns, true);
});

// ---- Source-level guarantees on the real engine ----

test("engine module enforces the integrity rules in source", () => {
  const src = read("src/lib/accessibility-score.ts");
  assert.match(src, /export function calculateAccessibilityScore/);
  assert.match(src, /export function mergeWeights/);
  // hardening tweak present
  assert.match(src, /status === "verified" \|\| status === "declared"\) && confidence === 0/);
  // unknown returns null (never counts toward the score)
  assert.match(src, /case "unknown":\s*\n\s*return null;/);
  // source-confidence ladder: human = 1.0, api = 0.6, hotel_claim = 0.4, none = 0.0
  assert.match(src, /user_review:\s*1\.0/);
  assert.match(src, /api:\s*0\.6/);
  assert.match(src, /hotel_claim:\s*0\.4/);
  assert.match(src, /none:\s*0\.0/);
});

// ---------------------------------------------------------------------------
// factsFromPlaceAccessibility adapter (Google Places → scoring facts).
// Google data is REPORTED → "declared"/"api", never "verified". A negative flag
// → "absent". "unknown" → no fact. Parking/seating are not mapped yet.
// ---------------------------------------------------------------------------

// Faithful replica of the TS adapter for behavioural tests.
function factsFromPlaceAccessibility(a) {
  const facts = [];
  if (a.wheelchairAccessibleEntrance === "available")
    facts.push({ requirement: "step_free_access", status: "declared", source: "api" });
  else if (a.wheelchairAccessibleEntrance === "unavailable")
    facts.push({ requirement: "step_free_access", status: "absent", source: "api" });
  if (a.wheelchairAccessibleRestroom === "available")
    facts.push({ requirement: "accessible_toilet", status: "declared", source: "api" });
  else if (a.wheelchairAccessibleRestroom === "unavailable")
    facts.push({ requirement: "accessible_toilet", status: "absent", source: "api" });
  return facts;
}

function placeA11y(overrides = {}) {
  return {
    wheelchairAccessibleEntrance: "unknown",
    wheelchairAccessibleRestroom: "unknown",
    wheelchairAccessibleParking: "unknown",
    wheelchairAccessibleSeating: "unknown",
    source: "google_places",
    lastChecked: "2026-06-19T00:00:00.000Z",
    ...overrides,
  };
}

test("adapter: available entrance/restroom → declared facts from api source", () => {
  const facts = factsFromPlaceAccessibility(
    placeA11y({
      wheelchairAccessibleEntrance: "available",
      wheelchairAccessibleRestroom: "available",
    }),
  );
  assert.deepEqual(facts, [
    { requirement: "step_free_access", status: "declared", source: "api" },
    { requirement: "accessible_toilet", status: "declared", source: "api" },
  ]);
  // Google data is reported, never verified.
  assert.ok(facts.every((f) => f.status !== "verified"));
  assert.ok(facts.every((f) => f.source === "api"));
});

test("adapter: unavailable entrance/restroom → absent facts from api source", () => {
  const facts = factsFromPlaceAccessibility(
    placeA11y({
      wheelchairAccessibleEntrance: "unavailable",
      wheelchairAccessibleRestroom: "unavailable",
    }),
  );
  assert.deepEqual(facts, [
    { requirement: "step_free_access", status: "absent", source: "api" },
    { requirement: "accessible_toilet", status: "absent", source: "api" },
  ]);
});

test("adapter: unknown fields create no facts (no positive signal from missing data)", () => {
  assert.deepEqual(factsFromPlaceAccessibility(placeA11y()), []);
});

test("adapter: parking and seating are ignored for the score", () => {
  const facts = factsFromPlaceAccessibility(
    placeA11y({
      wheelchairAccessibleParking: "available",
      wheelchairAccessibleSeating: "available",
    }),
  );
  assert.deepEqual(facts, []);
});

test("adapter: a declared api fact is discounted vs a verified human source", () => {
  const facts = factsFromPlaceAccessibility(
    placeA11y({ wheelchairAccessibleEntrance: "available" }),
  );
  const r = score({ step_free_access: 10 }, facts);
  // single requirement, declared + api → 1 * 0.6 * 100 = 60 (not 100).
  assert.equal(r.score, 60);
});

test("engine source maps Google Places fields to declared/absent api facts, never verified", () => {
  const src = read("src/lib/accessibility-score.ts");
  assert.match(src, /export function factsFromPlaceAccessibility/);
  assert.match(src, /wheelchairAccessibleEntrance === "available"/);
  assert.match(
    src,
    /requirement: "step_free_access", status: "declared", source: "api"/,
  );
  assert.match(
    src,
    /requirement: "step_free_access", status: "absent", source: "api"/,
  );
  assert.match(
    src,
    /requirement: "accessible_toilet", status: "declared", source: "api"/,
  );
  assert.match(
    src,
    /requirement: "accessible_toilet", status: "absent", source: "api"/,
  );
  // The adapter maps positives to "declared" (the assertions above fail if that
  // ever becomes "verified"). parking/seating are not mapped to a requirement.
  assert.doesNotMatch(src, /wheelchairAccessibleParking[\s\S]*?requirement:/);
});
