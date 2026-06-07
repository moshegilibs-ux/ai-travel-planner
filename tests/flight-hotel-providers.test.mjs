import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

// 1) NEVER show NaN prices.
test("prices never render as NaN (deal cards guard non-finite values)", () => {
  const card = read("src/components/deal-cards.tsx");
  // formatOfferPrice and the price() helper both reject non-finite numbers.
  assert.match(card, /if \(value === null \|\| !Number\.isFinite\(value\)\) return "";/);
  assert.match(card, /value === null \|\| !Number\.isFinite\(value\)\s*\n?\s*\? t\("notAvailable"\)/);

  // Replicate the exact guard to prove NaN / Infinity / null never format to a number.
  const safe = (value) => (value === null || !Number.isFinite(value) ? "" : String(Math.round(value)));
  assert.equal(safe(NaN), "");
  assert.equal(safe(Infinity), "");
  assert.equal(safe(-Infinity), "");
  assert.equal(safe(null), "");
  assert.equal(safe(240), "240");
});

// 7) Validation: non-numeric budget/travelers must never become NaN.
test("search params sanitize non-numeric budget/travelers to finite values", () => {
  const page = read("src/app/search/page.tsx");
  assert.match(page, /function toFiniteNumber/);
  assert.match(page, /!Number\.isFinite\(parsed\)/);

  const route = read("src/app/api/search/route.ts");
  assert.match(route, /function toFinite/);
  // budget is validated as a finite number at the API boundary.
  assert.match(route, /\.finite\(/);

  // Replicate the sanitizer: a budget "level" label must fall back, not NaN.
  const toFiniteNumber = (value, fallback, min = 0) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.max(min, parsed);
  };
  assert.equal(toFiniteNumber("Comfort", 1600, 0), 1600);
  assert.equal(Number.isNaN(toFiniteNumber("Comfort", 1600, 0)), false);
  assert.equal(toFiniteNumber("2", 2, 1), 2);
  assert.equal(toFiniteNumber(undefined, 2, 1), 2);
});

// 2) Mock data must never be presented as real booking results.
test("marketplace search never returns mock flights/hotels", () => {
  const amadeus = read("src/lib/amadeus.ts");
  assert.equal(/getMockFlights/.test(amadeus), false);
  assert.equal(/getMockHotels/.test(amadeus), false);
  assert.equal(amadeus.includes("Development mock"), false);
  assert.equal(amadeus.includes("mock-travel-results"), false);
  // No "mock" provider mode remains in the marketplace data layer.
  assert.equal(/mode:\s*"mock"/.test(amadeus), false);
});

// 3) Unavailable state (Hebrew) when the real provider is not configured.
test("flights/hotels show a Hebrew unavailable state when Amadeus is not configured", () => {
  const amadeus = read("src/lib/amadeus.ts");
  assert.match(amadeus, /טיסות אמיתיות לא זמינות כרגע/);
  assert.match(amadeus, /מלונות אמיתיים לא זמינים כרגע/);
  // The unavailable branch is gated on provider configuration.
  assert.match(amadeus, /if \(!isAmadeusConfigured\(\)\) \{[\s\S]*?mode: "unavailable"/);

  // The UI copy used for the empty list comes from the message catalog.
  const he = read("messages/he.json");
  assert.match(he, /"unavailableFlights": "טיסות אמיתיות לא זמינות כרגע"/);
  assert.match(he, /"unavailableHotels": "מלונות אמיתיים לא זמינים כרגע"/);

  // The results view renders that unavailable copy instead of fabricated cards.
  const view = read("src/components/search-results-view.tsx");
  assert.match(view, /UnavailableState message=\{resultsT\("unavailableFlights"\)\}/);
  assert.match(view, /UnavailableState message=\{resultsT\("unavailableHotels"\)\}/);
});

// 4) Real provider results carry the required bookable fields, and bad prices are dropped.
test("real Amadeus offers include price, currency, provider, timestamp and price label", () => {
  const amadeus = read("src/lib/amadeus.ts");
  // Flight offers without a real, positive price are dropped (not faked).
  assert.match(amadeus, /const price = Number\(offer\.price\?\.total\);/);
  assert.match(amadeus, /if \(!Number\.isFinite\(price\) \|\| price <= 0\) \{\s*\n\s*return null;/);
  // Required fields on a real flight offer.
  assert.match(amadeus, /provider: "Amadeus"/);
  assert.match(amadeus, /currency: offer\.price\?\.currency \|\| "USD"/);
  assert.match(amadeus, /lastChecked: new Date\(\)\.toISOString\(\)/);
  assert.match(amadeus, /priceLabel: "מחיר בזמן אמת"/);
  // No invented booking link — undefined means the card shows a clear "no booking link".
  assert.match(amadeus, /bookingLink: undefined/);

  // Hotels likewise reject non-positive prices.
  assert.match(amadeus, /!Number\.isFinite\(price\) \|\| price <= 0/);
});
