# Accessible Travel — Next Sprint (10 tasks)

_Last updated: 2026-06-06 • Companion to `ACCESSIBLE_TRAVEL_PRODUCT_PLAN.md` and `ACCESSIBLE_TRAVEL_ROADMAP.md`. Planning only — no application code changed._

The next 10 practical implementation tasks, in priority order. Effort: **S** (≈1–3 days) · **M** (≈1–2 weeks) · **L** (≈3+ weeks / multi-sprint).

**Sprint invariant (applies to all tasks):** never present unverified accessibility (or prices) as verified. Missing/low-confidence data renders **"נגישות לא מאומתת — מומלץ לבדוק מול המקום"** with source + last-checked + confidence. Mirrors the shipped flights/hotels cleanup in `src/lib/amadeus.ts` + `src/components/deal-cards.tsx`.

**Recommended order:** Tasks 1–2 are foundational and unblock the rest; 3–5 deliver visible accessibility data; 6 is a spike that informs 7–9; 10 can start as a design spike in parallel.

---

## 1. Accessibility profile onboarding

- **Why it matters:** Nothing downstream is "accessibility-first" without a captured profile. It personalizes search, ranking, and the AI itinerary, and lets us exclude unusable options instead of surfacing them.
- **Technical approach:** Add a guided first-step component (`src/components/accessibility-onboarding.tsx`) collecting: mobility device (`manual` / `powered` / `walker` / `handbike` / `none`), max daily walking/rolling distance, stairs tolerance, accessible-restroom requirement, rest-break frequency, service animal, dietary. Persist to `localStorage` (`trippilot:a11y-profile`) and, for signed-in users, to Prisma `UserPreference.memory`. Extend `AccessibilityProfile`/`MobilityLevel` (add `handbike`); pre-fill `search-form` + `hero-trip-planner` + `TravelFormData` from the profile. Add he/en i18n keys.
- **Dependencies:** None (foundation). Optional DB write needs a real session (auth currently stubbed) — degrade to localStorage-only.
- **Effort:** **M**
- **Success criteria:** A new user can set a profile in ≤6 fields; it persists across reloads, pre-fills search and the itinerary builder, and changes which results are shown/ranked. Covered by a test asserting profile load/save + that search reads it.

## 2. Verified accessibility data model

- **Why it matters:** The shared contract that makes the honesty rule enforceable and lets multiple sources be merged with a single confidence story.
- **Technical approach:** Add `src/types/accessibility.ts` with `AccessibilityConfidence` (`verified|reported|unverified`), `AccessibilityFact<T>` (`{value, confidence, source, lastChecked}`), `AccessibilityProfileData`, and the `RvAccessibilityData` / `CampsiteAccessibilityData` extensions (per the product plan §3). Add a pure `mergeAccessibility(...sources)` util: confidence resolves downward (a conflict or any `unverified` source caps the field at the lower confidence), with a worst-case `overall` roll-up. Keep the util framework-free so it's unit-testable.
- **Dependencies:** None.
- **Effort:** **M**
- **Success criteria:** Types compile and are imported by hotels/places. `mergeAccessibility` has unit tests proving: verified+reported→reported on conflict, any unverified caps overall, missing field → `unverified`. Confidence is never silently upgraded.

## 3. Accessible hotel metadata

- **Why it matters:** Lodging is the most common trip-blocker for wheelchair users; honest hotel accessibility is the highest-trust signal in Phase 1.
- **Technical approach:** Extend `HotelDeal` with optional `accessibility: AccessibilityProfileData`. In `normalizeHotelOffer` (`src/lib/amadeus.ts`), map Amadeus amenity/description hints → `AccessibilityFact` at `confidence: "reported"` (or `unverified` when only inferred). Render badges + the unverified notice in `HotelCard` (`deal-cards.tsx`); add a "verify with property" CTA. Verified-first sort option in `search-results-view`.
- **Dependencies:** #2 (data model).
- **Effort:** **M**
- **Success criteria:** Every hotel card shows accessibility badges **or** the Hebrew unverified notice — no hotel ever claims "step-free/roll-in shower" without a source + timestamp. Test asserts no hotel renders a verified accessibility claim without a `source`.

## 4. Accessible attraction metadata

- **Why it matters:** Fills the daily itinerary with stops a wheelchair/handbike user can actually enter and use.
- **Technical approach:** Add `accessibility: AccessibilityProfileData` to the place result type in `services/api/places.ts`. Populate it from the Google Places integration (#5) and, later, Wheelmap/OSM (#6). Render accessibility badges + notice on attraction cards and in `custom-itinerary-section` day stops; sort verified-first.
- **Dependencies:** #2, #5.
- **Effort:** **M**
- **Success criteria:** Attraction/restaurant cards show accessibility + confidence; unverified attractions show the notice; verified-first ordering is observable. Test asserts the place type carries `AccessibilityFact`-shaped data.

## 5. Google Places accessibility integration

- **Why it matters:** The strongest verified-ish accessibility source available **right now** with the existing `GOOGLE_MAPS_API_KEY` — real first-party data, not crowd-sourced.
- **Technical approach:** In `src/app/api/places/search/route.ts`, call Places API v1 `places:searchText` / Place Details with a field mask including `accessibilityOptions` (`wheelchairAccessibleEntrance`, `wheelchairAccessibleParking`, `wheelchairAccessibleRestroom`, `wheelchairAccessibleSeating`). Map each to `AccessibilityFact` with `source: "Google Places"`, `confidence: "reported"`, `lastChecked: now`. When the key is missing or the field is absent → `unverified` (never fabricate `true`).
- **Dependencies:** #2; `GOOGLE_MAPS_API_KEY`.
- **Effort:** **M**
- **Success criteria:** With a key, real Places accessibility flags appear on attractions; without a key, fields are `unverified` and the notice shows — no fabricated flags. Test asserts the route maps `accessibilityOptions` and defaults to `unverified` when absent.

## 6. Wheelmap / OpenStreetMap integration evaluation (spike)

- **Why it matters:** Free, high-coverage crowd accessibility (esp. EU cities) to fill gaps where Google has no data — but licensing, rate limits, and confidence semantics need a decision before we build on it.
- **Technical approach:** Spike: query Wheelmap API and/or OSM Overpass for `wheelchair=yes|limited|no`, `toilets:wheelchair`, `ramp`, `wheelchair:description` for a sample city (e.g., Barcelona). Prototype an adapter mapping tags → `AccessibilityFact` at `confidence: "reported"`. Produce a short ADR (`docs/adr/0001-osm-wheelmap.md`) covering coverage, freshness, rate limits, attribution/licensing, and a merge recommendation with #5.
- **Dependencies:** #2.
- **Effort:** **S** (spike)
- **Success criteria:** An ADR with a go/no-go recommendation + a working prototype fetch for one city, mapping tags to confidence-tagged facts. No production wiring yet.

## 7. Handbike route support

- **Why it matters:** A loyal, underserved audience (esp. Europe) and a clear differentiator; surface/incline are make-or-break for handbikes.
- **Technical approach:** Integrate a routing provider with surface + incline (OpenRouteService **wheelchair profile** as primary; BRouter as fallback). Add a `handbike` route type; request surface, gradient, and length; render per-segment surface/incline with warnings (steep/rough/unpaved). Flag bike-on-train where rail data is available; mark unknown surfaces `unverified`. Start as a spike to confirm provider quality, then MVP for point-to-point.
- **Dependencies:** Routing API key; #2.
- **Effort:** **L**
- **Success criteria:** A handbike route between two points returns surface + incline + length; steep/rough segments are flagged; segments with unknown surface show the unverified notice. Test asserts steep/rough segments produce a warning.

## 8. Accessible transportation planning

- **Why it matters:** Connects bookings into a trip that's actually doable; getting between stops is where accessible trips most often fail.
- **Technical approach:** For each itinerary leg, compute an accessible transport suggestion using Google routing (transit + walking/rolling) plus heuristics: prefer step-free transit, minimize rolling distance, flag legs exceeding the user's max distance. Where step-free status is unknown, show an explicit warning rather than asserting accessibility. Render legs in `custom-itinerary-section` / the daily view.
- **Dependencies:** #2; Google Maps (wired); the accessibility profile (#1) for distance limits.
- **Effort:** **L**
- **Success criteria:** Each leg shows an accessible transport suggestion or an explicit "accessibility unverified" warning; legs over the user's distance cap are flagged. Test asserts an over-cap leg yields a warning.

## 9. Caravan / RV accessibility support

- **Why it matters:** A flagship new trip type for an underserved audience (per the product plan) — accessible RV + accessible campsites + nearby accessible trails.
- **Technical approach:** Add a trip-type selector value `caravan-rv` that branches the flow. Add `RvAccessibilityData` + `CampsiteAccessibilityData` (from #2). MVP: list candidate **accessible campsites** from a free source (OSM/Overpass) with confidence + notice; show **RV rental as deep-link only** (Outdoorsy/Indie Campers/etc.) with "adapted availability not verified" — never fabricated adapted inventory. Defer dimension-aware routing to the roadmap's Phase 3.
- **Dependencies:** #2; trip-type selector; #6 (OSM evaluation informs campsite/trail sourcing).
- **Effort:** **L**
- **Success criteria:** Selecting caravan/RV shows accessible-campsite candidates with confidence/notice and RV-rental deep-links; no fake adapted-RV inventory and no unverified "accessible" campsite claims. Test asserts campsite results carry confidence and RV listings are deep-link only.

## 10. Real booking architecture

- **Why it matters:** Unlocks conversion/revenue and a true end-to-end trip — but must be designed so we never show fake confirmations or invent booking links.
- **Technical approach:** Design spike + scaffolding (not full integration). Define a `BookingProvider` interface distinguishing **deep-link** (affiliate redirect) vs **API booking** (future). Wire one deep-link provider through the existing Prisma `AffiliateEvent` model + `/api/affiliate/click`. Identify the auth/payment touchpoints (auth is currently stubbed; Stripe is wired) and document the path to live booking. Produce an ADR (`docs/adr/0002-booking-architecture.md`).
- **Dependencies:** Real auth (currently stubbed in `src/lib/auth.ts`/`next-auth.ts`); provider keys/affiliate IDs; payments (Stripe wired).
- **Effort:** **L** (design **S**, full impl **L**)
- **Success criteria:** An ADR + a `BookingProvider` interface + one deep-link provider stub recording an `AffiliateEvent` on click. No booking ever shows a fabricated confirmation or invented link; missing provider → clear "no booking link".

---

### Dependency summary

```
1 (profile) ─┐
2 (data model) ─┬─> 3 (hotels), 4 (attractions), 8 (transport), 9 (caravan/RV)
5 (Google Places) ─> 4
6 (OSM spike) ─> 7 (handbike), 9 (campsites/trails)
1 ─> 8 (distance limits)
10 (booking) — design in parallel; impl after real auth
```

### Effort tally
S: 1 (Task 6) · M: 4 (Tasks 1–5 except where noted) · L: 4 (Tasks 7, 8, 9, 10). Tasks 3,4,5 are M; 1,2 are M; 6 is S; 7,8,9,10 are L.

_This document sets direction only. No application code was modified, and nothing was committed._
