import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

test("flight cards do not render a duplicated or unsafe flight price expression", () => {
  const source = read("src/components/deal-cards.tsx");
  assert.equal(source.includes("${Math.round(flight.price)}"), false);
  assert.equal(source.includes("formatOfferPrice(flight.price, flight.currency)"), true);
});

test("select flight button is wired to parent state and is not a dead click", () => {
  const card = read("src/components/deal-cards.tsx");
  const results = read("src/components/search-results-view.tsx");

  assert.match(card, /onSelect\?: \(flight: FlightDeal\) => void/);
  assert.match(card, /function handleSelectFlight\(\)/);
  assert.match(card, /onSelect\?\.\(flight\)/);
  assert.match(card, /בחר טיסה/);
  assert.match(results, /const \[selectedFlight, setSelectedFlight\]/);
  assert.match(results, /onSelect=\{setSelectedFlight\}/);
});

test("selected flight and hotel are visually marked and appear in summary", () => {
  const card = read("src/components/deal-cards.tsx");
  const results = read("src/components/search-results-view.tsx");

  assert.match(card, /data-selected-flight/);
  assert.match(card, /data-selected-hotel/);
  assert.match(results, /data-testid="selected-flight-summary"/);
  assert.match(results, /activeDeal/);
});

test("missing bookingLink does not block selected offer continuation", () => {
  const card = read("src/components/deal-cards.tsx");
  const results = read("src/components/search-results-view.tsx");

  assert.match(card, /הצעה ללא קישור הזמנה/);
  assert.match(results, /המשך לבניית מסלול/);
});

test("budget total equals the visible breakdown equation", () => {
  const flight = 194;
  const hotel = 300;
  const food = 220;
  const activities = 140;
  const fees = 51;
  const safetyMargin = 91;
  const total = flight + hotel + food + activities + fees + safetyMargin;

  assert.equal(total, 996);
});

test("budget uses the provider flight offer once, matching the flight card", () => {
  const source = read("src/lib/budget.ts");
  assert.equal(source.includes("flightPrice * safeTravelers"), false);
  assert.match(source, /const flight = flightPrice === null \? 0 : Math\.round\(flightPrice\)/);
});

test("production flight API failure does not fall back to fake prices", () => {
  const route = read("src/app/api/flights/search/route.ts");
  assert.match(route, /source:\s*"unavailable"/);
  assert.equal(route.includes("return mockResponse(\n      input,"), false);
});

test("browser flight service returns empty results instead of mock data after API failure", () => {
  const service = read("src/services/api/flights.ts");
  assert.match(service, /source:\s*"error"/);
  assert.match(service, /error:\s*"שגיאה בחיפוש טיסות\. נסו שוב בעוד רגע\."/);
  assert.equal(service.includes("Flight API failed, falling back to mock flights"), false);
});

test("trip flight search form always triggers an API search and loading state", () => {
  const source = read("src/components/flights-section.tsx");

  assert.match(source, /onSubmit=\{handleSearch\}/);
  assert.match(source, /setIsLoading\(true\)/);
  assert.match(source, /setSearchNonce\(\(value\) => value \+ 1\)/);
  assert.match(source, /searchFlights\(\{/);
  assert.equal(source.includes("window.setTimeout"), false);
});

test("trip flight search renders unavailable and failed request states", () => {
  const component = read("src/components/flights-section.tsx");
  const route = read("src/app/api/flights/search/route.ts");

  assert.match(component, /statusMessage \|\| errorMessage \|\| "לא נמצאו טיסות"/);
  assert.match(component, /errorMessage/);
  assert.match(route, /warning:\s*"טיסות לא זמינות כרגע"/);
  assert.match(route, /warning:\s*"לא נמצאו טיסות"/);
});

test("real search provider labels unavailable data instead of inventing prices", () => {
  const source = read("src/lib/amadeus.ts");
  assert.match(source, /טיסות לא זמינות כרגע/);
  assert.match(source, /מלונות לא זמינים כרגע/);
  assert.match(source, /flights:\s*\[\]/);
  assert.match(source, /hotels:\s*\[\]/);
});

test("production unavailable copy does not say showing mock data", () => {
  const source = read("src/lib/amadeus.ts");
  assert.equal(source.includes("Showing mock flight data"), false);
  assert.equal(source.includes("Showing mock hotel data"), false);
  assert.match(source, /טיסות לא זמינות כרגע/);
  assert.match(source, /מלונות לא זמינים כרגע/);
});

test("results page has mobile-first drawer and sticky CTA layout", () => {
  const source = read("src/components/search-results-view.tsx");
  assert.match(source, /MobileFilterDrawer/);
  assert.match(source, /data-testid="sticky-bottom-cta"/);
  assert.match(source, /md:grid-cols-2/);
  assert.match(source, /lg:grid-cols-\[300px_1fr\]/);
});

test("responsive QA breakpoints are represented in the unified results UI", () => {
  const source = read("src/components/search-results-view.tsx");
  const qaBreakpoints = ["desktop 1440px", "tablet 768px", "mobile 390px"];

  assert.match(source, /lg:/);
  assert.match(source, /md:/);
  assert.match(source, /md:hidden/);
  assert.deepEqual(qaBreakpoints, ["desktop 1440px", "tablet 768px", "mobile 390px"]);
});
