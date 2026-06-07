# Accessible Travel Product Plan — AI Travel Planner

_Last updated: 2026-06-06 • Status: direction-setting document (no app code changed)._

> **This is not a generic travel website.** It is an **accessibility-first AI travel planner for people with disabilities** — wheelchair users, disabled veterans, elderly travelers, handbike riders, and anyone with limited walking ability. Accessibility is the product, not a filter bolted on at the end.

---

## 0. Non-negotiable data-integrity rule

The same principle we just enforced for prices (never show fake prices; show a clear unavailable state) applies — **even more strictly** — to accessibility.

- **Never present unverified accessibility as verified.**
- When accessibility data is missing, stale, or low-confidence, the UI must show:
  > **נגישות לא מאומתת — מומלץ לבדוק מול המקום**
  > _("Accessibility not verified — we recommend checking with the venue.")_
- Every accessibility claim must carry: **source**, **last-checked timestamp**, and a **confidence level** (`verified` / `reported` / `unverified`).
- "Verified" is reserved for first-party/official data or a recent on-the-ground confirmation. Crowd/AI-inferred data is at most `reported`.

This rule mirrors the flights/hotels cleanup already shipped: `src/lib/amadeus.ts` now returns real offers only, otherwise an explicit Hebrew "unavailable" state — no fabricated prices, provider + `lastChecked` on every real offer.

---

## 1. Product mission

Enable a person with a disability to **independently plan and book a complete, realistic, accessible trip** end-to-end — flights, accessible lodging, day-by-day itinerary, accessible attractions and food, and accessible transport between them — with **honest accessibility information** at every step and **clear warnings wherever accessibility is uncertain**.

Success = a wheelchair user (or elderly traveler, or handbike rider) can go from "I want to travel" to a saved, bookable, confidence-rated accessible plan **without phoning ten venues first** — and where calls are still needed, the app tells them exactly which ones and why.

**Flagship trip types:** city breaks, multi-destination tours, nature/outdoor trips, **and accessible caravan / RV (campervan) travel** — the last is a first-class trip type, not an afterthought (see the dedicated section below). A disabled traveler should be able to plan a wheelchair-accessible RV road trip across Europe — accessible RV rental, accessible campsites with step-free showers/toilets, hookups, accessible pitches, and handbike/wheelchair-friendly trails nearby — with the same honesty guarantees as every other trip type.

---

## 2. Target users

| Persona | Core needs | Hard constraints |
|---|---|---|
| **Wheelchair users** (manual/powered) | Step-free everything, roll-in showers, accessible transit, door widths, ramp gradients | Hard-blocked by stairs, curbs, narrow doors, no accessible WC |
| **Disabled veterans** | Often powered chairs/prosthetics, PTSD-aware pacing, service-animal friendliness, reliable equipment repair | Equipment charging, predictable routes, quiet/rest options |
| **Elderly travelers** | Short walking distances, frequent rest breaks, elevators over stairs, slower pace, medical proximity | Fatigue limits, heat/incline sensitivity |
| **Handbike travelers (Europe)** | Paved/low-incline cycle routes, surface quality, bike-accessible trains, secure storage, repair shops | Steep gradients, cobblestone, gravel, no bike-on-train |
| **Limited-walking travelers** | Max walking/rolling distance per day, drop-off proximity, seating availability | Distance ceilings, stairs |
| **Caregivers / families with a disabled member** | Plan *for someone else*, shared rooms, companion seating, predictability | Mixed-ability pacing |
| **Accessible caravan / RV / campervan travelers** | Wheelchair-accessible RV (lift/ramp, hand controls, securement, transfer space, roll-in interior), accessible campsites (step-free shower/toilet, accessible pitch, hookups), low-effort road-trip pacing, handbike/wheelchair trails near pitches | RV interior not roll-in, campsite not step-free, no accessible service point, height/length route limits |

The codebase already encodes most of these. `AccessibilityProfile` (`src/types/travel-marketplace.ts`) = `none | wheelchair | walker | mobility-scooter | senior | young-children`; `MobilityLevel` (`src/lib/travel-options.ts` / `itinerary-types.ts`) = `independent | mobility-aid | wheelchair | caregiver-dependent`. **Add `handbike` and `disabled-veteran` context** to these.

---

## 3. Accessibility requirements (the data model)

Every place, stay, route, and leg should be describable by a shared **Accessibility Profile** object. Proposed canonical shape (new `src/types/accessibility.ts`):

```ts
type AccessibilityConfidence = "verified" | "reported" | "unverified";

type AccessibilityFact<T> = {
  value: T;                     // e.g. true / "step-free" / 90 (cm)
  confidence: AccessibilityConfidence;
  source: string;               // "Google Places" | "OSM/Wheelmap" | "Venue site" | "AI-inferred"
  lastChecked: string;          // ISO timestamp
};

type AccessibilityProfileData = {
  stepFreeEntrance?: AccessibilityFact<boolean>;
  elevator?: AccessibilityFact<boolean>;
  rampGradient?: AccessibilityFact<"none" | "gentle" | "steep">;
  doorWidthCm?: AccessibilityFact<number>;
  accessibleRestroom?: AccessibilityFact<boolean>;
  rollInShower?: AccessibilityFact<boolean>;        // lodging
  accessibleParking?: AccessibilityFact<boolean>;
  accessibleSeating?: AccessibilityFact<boolean>;   // venues/restaurants
  serviceAnimalFriendly?: AccessibilityFact<boolean>;
  surfaceQuality?: AccessibilityFact<"smooth" | "mixed" | "rough">; // routes/handbike
  maxInclinePercent?: AccessibilityFact<number>;    // routes/handbike
  restPoints?: AccessibilityFact<number>;           // seating/benches along route
  notes?: string;                                   // free text, always shown
  overall: AccessibilityConfidence;                 // worst-case roll-up
};
```

**Caravan / RV / campsite extension** (new fields, same `AccessibilityFact` wrapper):

```ts
type RvAccessibilityData = {
  wheelchairLiftOrRamp?: AccessibilityFact<boolean>;   // RV boarding
  rollInInterior?: AccessibilityFact<boolean>;         // turning space, no internal steps
  handControls?: AccessibilityFact<boolean>;           // adapted driving
  wheelchairSecurement?: AccessibilityFact<boolean>;   // tie-downs / docking
  accessibleRvBathroom?: AccessibilityFact<boolean>;   // roll-in wet room onboard
  transferSpaceCm?: AccessibilityFact<number>;
};

type CampsiteAccessibilityData = {
  stepFreeShower?: AccessibilityFact<boolean>;
  accessibleToilet?: AccessibilityFact<boolean>;       // step-free + grab bars
  accessiblePitch?: AccessibilityFact<boolean>;        // hard/level, near facilities
  accessibleParking?: AccessibilityFact<boolean>;
  electricityHookup?: AccessibilityFact<boolean>;
  waterHookup?: AccessibilityFact<boolean>;
  wasteServicePointAccessible?: AccessibilityFact<boolean>; // grey/black water reachable
  pathSurface?: AccessibilityFact<"smooth" | "mixed" | "rough">; // pitch ↔ facilities
  nearbyAccessibleTrail?: AccessibilityFact<boolean>;  // wheelchair/handbike trail
};
```

Requirements that flow into the itinerary (already partially modeled in `itinerary-types.ts`):
- **Walking/rolling distance per day** (cap + per-activity distance) and **rest-break frequency**.
- **Step-free access, elevators, ramps, accessible bathrooms** as first-class flags, not amenity strings.
- **Accessible transport legs** (drop-off proximity, low-floor transit, accessible rail station).
- **Handbike-friendly routing** (paved, low incline, bike-on-train, storage).
- **Warnings** whenever any leg/stay/place has `confidence !== "verified"` → render the Hebrew unverified notice.

---

## 4. Trip planning flow (accessibility-first)

The existing flow (`hero-trip-planner` → `/search` → `search-results-view` → `/trip/[id]` / itinerary builder) stays, re-centered on accessibility:

1. **Accessibility intake (first, not last).** Capture profile up front: mobility level, device (manual/powered/handbike), max daily distance, stairs tolerance, rest-break needs, restroom requirement, service animal, dietary. (Today these live in `search-form` filters + `TravelFormData` — promote to a guided first step.)
2. **Destination & dates.** With accessibility caveats per destination (terrain, transit maturity).
3. **Flights (real, Amadeus).** Show special-assistance availability (IATA SSR `WCHR`/`WCHS`/`WCHC`) where the provider exposes it; otherwise mark assistance as "request at booking". No fake offers — unavailable state when unconfigured.
4. **Accessible lodging.** Filter and rank by step-free, elevator, roll-in shower, accessible WC. Each stay shows confidence + source; unverified → Hebrew notice + "verify with property" CTA.
5. **Daily itinerary generation (AI).** Build day-by-day with morning/noon/evening, **distance/rest-break aware**, each activity carrying its accessibility profile and confidence. (Engine exists: `generate-itinerary.ts` + `openai-itinerary.ts`.)
6. **Accessible attractions / beaches / museums / restaurants.** Pulled from Places/OSM with accessibility fields; sortable by verified-first.
7. **Accessible transport between legs.** Routing that prefers step-free transit and (for handbikes) paved low-incline paths with bike-on-train.
8. **Review & confidence summary.** A trip-level "accessibility confidence score" + an explicit list of **"items to verify before you go"** (everything not `verified`).
9. **Save / export / book.** Save trip, export PDF (RTL, exists), deep-link to provider booking; never invent a booking link — show "no booking link" clearly (already implemented in `deal-cards`).

---

## ★ Major trip type — Accessible caravan / RV (campervan) travel

A first-class, parallel trip type to "fly + hotel". The traveler chooses **caravan/RV** at the trip-type step and the flow adapts: instead of flights+hotel, it plans **accessible RV rental → campervan route → accessible campsites → daily stops with accessible attractions/trails**. Europe-first (dense campsite + EuroVelo + rail networks).

**RV/caravan flow**
1. **Accessibility intake** (shared with other trip types) + RV-specific needs: needs wheelchair lift/ramp, roll-in interior, hand controls, onboard accessible bathroom, securement.
2. **Accessible RV rental.** Surface adapted/wheelchair-accessible RVs where a provider exposes them; every listing shows the RV accessibility profile + confidence. If adapted-RV availability can't be verified → **"נגישות לא מאומתת — מומלץ לבדוק מול המקום"**, never a fake "accessible" claim.
3. **Campervan route (Europe).** Route respecting RV **height/length/weight** limits, with **accessible service points**, fuel/charging, and overnight stops; flag low-bridge/restricted segments.
4. **Accessible campsites** along the route, filtered/ranked by: **step-free shower, accessible toilet, accessible pitch, electricity + water hookup, accessible waste service point, accessible parking, smooth path pitch↔facilities**. Confidence + source on each; unverified → Hebrew notice + "verify with campsite" CTA.
5. **Per-stop daily plan**: nearby **wheelchair-accessible nature trails**, **handbike-friendly routes near the campsite**, accessible attractions/beaches/restaurants — same Places/OSM accessibility data + confidence.
6. **Review & confidence summary**: RV + every campsite + every trail rolls up into the trip confidence score and the "verify before you go" checklist.
7. **Save / export / book**: save the RV road trip; deep-link to RV-rental and campsite providers; never invent a booking link.

**Caravan/RV-specific requirements (all `AccessibilityFact`, see §3 extension)**
- **RV:** wheelchair lift/ramp, roll-in interior (turning space, no internal steps), hand controls, securement/tie-downs, onboard roll-in wet room, transfer space.
- **Campsite:** step-free showers and toilets, accessible pitch (hard/level, near facilities), electricity & water hookup, accessible grey/black-water service point, accessible parking, smooth surface between pitch and amenities.
- **Routing:** RV dimension-aware routing **and** handbike/wheelchair trail routing near each pitch (low incline, paved/firm surface, rest points).
- **Nature:** wheelchair-accessible trails (surface, gradient, boardwalks, accessible viewpoints, accessible WC at trailhead).

**Verification warnings (non-negotiable):** campsite and RV accessibility is frequently self-reported and inconsistent across Europe. Any RV/campsite/trail field that is not `verified` must render the Hebrew unverified notice and appear in the pre-trip "verify" checklist. Confidence is never silently upgraded from `reported`/`unverified` to `verified`.

---

## 5. Data needed for accessible hotels / flights / attractions

**Flights**
- Real schedule/price/currency/provider/timestamp (✅ via Amadeus today).
- Special assistance: wheelchair service codes (WCHR/WCHS/WCHC), onboard accessible lavatory (wide-body), pre-boarding — mostly **booking-time / airline-dependent**; surface as "request at booking" unless verified.

**Hotels / lodging**
- Step-free entrance, elevator, **roll-in shower**, grab bars, accessible WC, door width, accessible parking, bed height, visual/hearing aids, accessible pool/beach access.
- Sources: Amadeus hotel amenities (coarse), **Booking.com/Expedia accessibility facilities** (rich, via affiliate), property website, guest reports.

**Attractions / beaches / museums / restaurants**
- Step-free entrance, accessible restroom, accessible parking/seating, audio guides, tactile/Braille, beach access mats/amphibious chairs, quiet hours.
- Sources: **Google Places `accessibilityOptions`** (wheelchairAccessibleEntrance/Parking/Restroom/Seating — REAL now), **OpenStreetMap/Wheelmap** wheelchair tags, **Euan's Guide / AXS Map / AccessNow** reviews.

**Routes / transport (incl. handbike)**
- Surface, incline/gradient, curb cuts, rest points, low-floor transit, **bike-on-train** rules, step-free stations.
- Sources: OSM routing (BRouter/GraphHopper/Komoot) with surface+incline; national rail step-free data; EuroVelo.

**Caravan / RV rental, campsites & accessible nature trails**
- **RV:** wheelchair lift/ramp, roll-in interior, hand controls, securement, onboard accessible bathroom, transfer space, plus vehicle **height/length/weight** for routing.
- **Campsite:** step-free shower, accessible toilet, accessible pitch, electricity/water hookup, accessible waste service point, accessible parking, surface pitch↔facilities, on-site accessibility notes.
- **Nature trails:** surface, gradient, length/rolling-distance, boardwalks, accessible viewpoints, trailhead accessible WC/parking.
- Sources: RV-rental marketplaces (Outdoorsy, RVshare, Indie Campers, McRent, Roadsurfer, Yescapa, Goboony) + specialist adapted-RV rentals (mostly affiliate/deep-link, manual verification); campsite directories (ACSI, Campercontact, Park4Night, Pitchup, Eurocampings, ADAC); OSM/Wheelmap + AllTrails (wheelchair filter) + national-park accessibility data for trails.

Every field stored as an `AccessibilityFact` (value + confidence + source + lastChecked).

---

## 6. What can be real now vs. future provider integrations

**Real now (with keys already wired in `src/lib/env.ts`)**
- ✅ **Flights** — Amadeus (`AMADEUS_CLIENT_ID/SECRET`), real-only with unavailable fallback (shipped).
- ✅ **Places & basic accessibility** — Google Places API `accessibilityOptions` (`GOOGLE_MAPS_API_KEY`) for attractions/restaurants — **genuinely verified-ish first-party data**, available immediately.
- ✅ **Maps / geocoding / distance** — Google Maps; rolling-distance estimates.
- ✅ **Weather / FX** — already integrated (heat warnings matter for accessibility).
- ✅ **AI itinerary** — OpenAI; must label AI-inferred accessibility as `unverified`.

**Needs integration (future)**
- 🔜 Hotel accessibility depth → Booking.com/Expedia affiliate accessibility facilities; Amadeus hotels is coarse.
- 🔜 Crowd accessibility → Wheelmap/OSM, Euan's Guide, AXS Map, AccessNow.
- 🔜 Handbike/wheelchair routing → BRouter/GraphHopper/Komoot/OpenRouteService with surface+incline; rail step-free APIs.
- 🔜 Airline special-assistance confirmation → airline/GDS SSR at booking time.
- 🔜 **Accessible RV rental** → Outdoorsy/RVshare/Indie Campers/McRent/Roadsurfer/Yescapa + specialist adapted-RV rentals (affiliate/deep-link; adapted availability needs manual verification — never auto-claim "accessible").
- 🔜 **Accessible campsites** → ACSI / Campercontact / Park4Night / Pitchup / Eurocampings / ADAC (accessibility fields vary; default to `reported`/`unverified`).
- 🔜 **RV dimension-aware routing** → HERE/Google truck routing (height/length/weight) for campervan legs.
- 🔜 **Accessible nature trails** → OSM/Wheelmap + AllTrails (wheelchair filter) + national-park accessibility datasets.

**Until a real accessibility source is connected for a field, that field is `unverified` and shows the Hebrew notice. No exceptions.**

---

## 7. MVP features

1. **Accessibility intake step** (mobility level, device incl. handbike, max daily distance, stairs/rest/restroom needs, service animal).
2. **Real flights** (Amadeus) with assistance-at-booking labeling; honest unavailable state. _(done)_
3. **Lodging list** with accessibility flags from available sources + **confidence badges** + Hebrew unverified notice.
4. **AI daily itinerary** that respects max distance + rest breaks, every activity tagged with accessibility + confidence.
5. **Accessible attractions/restaurants** via Google Places `accessibilityOptions` (verified-first sorting).
6. **Distance/rolling-distance + rest-break display** per day.
7. **Trip-level accessibility confidence summary** + "verify before you go" checklist.
8. **Save trip + RTL PDF export** _(export exists)_.
9. **Hebrew + English, RTL-correct** _(i18n restored)_.
10. **No-fake-data guarantees** across prices and accessibility.
11. **Trip-type selector** including **caravan / RV** — RV trips planned from free data available now (OSM/Places campsites + accessible trails, confidence-badged); RV rental shown as **deep-link only** (no fabricated adapted-RV inventory), with the Hebrew unverified notice wherever campsite/RV/trail data isn't `verified`.

---

## 8. Public beta features

1. **Handbike route planner (Europe)** — paved/low-incline routing, bike-on-train, storage/repair POIs.
2. **Booking.com/Expedia accessibility deep-links** with roll-in-shower / step-free filters.
3. **Crowd accessibility** (Wheelmap/OSM + user reports) to raise coverage; clearly `reported`, not `verified`.
4. **Beach accessibility** (access mats, amphibious chairs, boardwalks).
5. **User-submitted accessibility reports + photos** with moderation → upgrade confidence over time.
6. **Saved accessibility profile** reused across trips; share trip with caregiver.
7. **Airline assistance request guidance** (WCHR/WCHS/WCHC) and per-airline notes.
8. **Offline/printable accessible day sheets** (distances, restrooms, rest points, emergency/medical proximity).
9. **Heat/terrain warnings** (weather + incline) tied to fatigue limits.
10. **Accessibility confidence scoring model** refined from feedback.
11. **Accessible RV rental integration** (Outdoorsy / Indie Campers / McRent / Roadsurfer + specialist adapted rentals) with adapted-RV accessibility profiles and verification status.
12. **European campervan route planner** — RV height/length/weight-aware routing with accessible service points and overnight stops.
13. **Accessible campsite ranking** (step-free shower/toilet, accessible pitch, hookups, accessible parking, smooth surface) with confidence + source.
14. **Accessible nature-trail + handbike route planner near campsites** (surface/incline/length, boardwalks, rest points).

---

## 9. Data providers / API options

| Domain | Provider | Real now? | Notes |
|---|---|---|---|
| Flights | **Amadeus** | ✅ wired | Schedule/price; assistance is booking-time |
| Flights/hotels (affiliate) | Booking.com, Expedia, Kiwi, Agoda, Skyscanner | partial | Affiliate model already in schema (`AffiliateProvider`); rich hotel accessibility facilities |
| Places accessibility | **Google Places API v1** (`accessibilityOptions`) | ✅ wired | Entrance/parking/restroom/seating — strongest verified-ish source today |
| Crowd accessibility | **Wheelmap / OpenStreetMap** (`wheelchair=*`, `toilets:wheelchair`) | free API | High coverage in EU cities; `reported` confidence |
| Accessibility reviews | Euan's Guide, AXS Map, AccessNow | API/partnership | Qualitative, photos |
| Routing (wheelchair/handbike) | BRouter, GraphHopper, Komoot, OpenRouteService (wheelchair profile) | API | Surface + incline; OpenRouteService has a dedicated wheelchair profile |
| Rail step-free | National rail APIs (e.g. DB, SNCF, NS), EU rail | varies | Step-free stations, bike-on-train |
| **RV / campervan rental** | Outdoorsy, RVshare, Indie Campers, McRent, Roadsurfer, Yescapa, Goboony + adapted-RV specialists | affiliate/deep-link | Adapted/wheelchair RV availability needs manual verification — never auto-claim "accessible" |
| **Campsites** | ACSI, Campercontact, Park4Night, Pitchup, Eurocampings, ADAC | varies/affiliate | Accessibility fields inconsistent → default `reported`/`unverified` |
| **RV routing (dimensions)** | HERE / Google truck routing | API | Height/length/weight limits for campervan legs |
| **Accessible nature trails** | OSM/Wheelmap, AllTrails (wheelchair filter), national-park datasets | mixed | Surface/gradient/boardwalks; verified-first |
| Maps/geocode/distance | Google Maps | ✅ wired | Rolling-distance estimates |
| Weather | OpenWeather/WeatherAPI | ✅ wired | Heat warnings |
| AI | OpenAI | ✅ wired | Inferred data = `unverified` only |

**OpenRouteService wheelchair profile** and **Wheelmap/OSM** are the highest-leverage *free* additions for genuine accessibility coverage.

---

## 10. Development tasks (top 20 core + caravan/RV track)

> Ordered roughly by dependency/impact. None of these are started; this doc is direction only.

1. Add canonical `src/types/accessibility.ts` (`AccessibilityFact`, `AccessibilityConfidence`, `AccessibilityProfileData`) and adopt it across hotels/places/routes/itinerary.
2. Add shared `<AccessibilityBadge>` + `<UnverifiedAccessibilityNotice>` components rendering **"נגישות לא מאומתת — מומלץ לבדוק מול המקום"** with source + lastChecked; add i18n keys (he/en).
3. Extend `AccessibilityProfile`/`MobilityLevel` with `handbike` and a `disabled-veteran` context; thread through `search-form`, `hero-trip-planner`, `TravelFormData`.
4. Build the **accessibility intake step** as the first screen of the planning flow (device, max distance, stairs/rest/restroom, service animal, dietary).
5. Integrate **Google Places `accessibilityOptions`** in `src/app/api/places/search` + `services/api/places.ts`; map to `AccessibilityFact` with `source: "Google Places"`, `confidence: "reported"`.
6. Integrate **Wheelmap/OSM** wheelchair tags as a second place-accessibility source; merge with confidence rules (conflict → lower confidence + notice).
7. Define the **confidence roll-up + merge** logic (multiple sources → overall confidence; unverified wins downward) with unit tests.
8. Surface **flight special-assistance** labeling (WCHR/WCHS/WCHC) in `normalizeFlightOffer`/`deal-cards`; "request at booking" when not confirmable.
9. Add **accessible-lodging filters** (step-free, elevator, roll-in shower, accessible WC, accessible parking) to results + ranking; verified-first sort.
10. Connect **Booking.com/Expedia affiliate** hotel accessibility facilities + deep-links (extend existing `AffiliateEvent` model); never invent links.
11. Make AI itinerary **distance/rest-break aware**: enforce max daily rolling distance and insert rest points; mark all AI accessibility as `unverified`.
12. Tag every itinerary activity with `AccessibilityProfileData` + render badges/notices in `custom-itinerary-section` and the daily view.
13. Build **accessible transport legs** (step-free transit preference, drop-off proximity) using Google routing.
14. Integrate **OpenRouteService wheelchair profile** for rolling-distance + incline-aware routing.
15. Build the **handbike route planner (EU)**: paved/low-incline routing, bike-on-train flags, storage/repair POIs.
16. Add a **trip-level accessibility confidence score** + **"verify before you go" checklist** (auto-collected from all non-`verified` items).
17. Add **user-submitted accessibility reports + photos** with moderation; reports raise coverage at `reported` confidence.
18. Add **beach/museum-specific accessibility** fields (access mats, amphibious chairs, audio/tactile guides) and rendering.
19. Add **heat + terrain warnings** (weather + incline) tied to the user's fatigue/distance limits.
20. **Tests + CI** for the data-integrity invariants: no fabricated accessibility, unverified always shows the Hebrew notice, confidence never silently upgraded, no fake prices/links (extend the existing `tests/*.test.mjs` suite; add CI running `tsc` + `build` + `npm test`).

#### Caravan / RV track (extends the above)

21. Add a **trip-type selector** (`city | multi-destination | nature | caravan-rv`) that branches the flow; thread the choice through `hero-trip-planner`, `/search`, and the itinerary builder.
22. Add `RvAccessibilityData` + `CampsiteAccessibilityData` types (§3) and `<RvAccessibilityBadges>` / `<CampsiteAccessibilityBadges>` with the same unverified-notice contract.
23. Integrate **campsite data** (ACSI/Campercontact/Park4Night/Eurocampings) → accessible-campsite listing ranked by step-free shower/toilet, accessible pitch, hookups, accessible parking; confidence + source; unverified → Hebrew notice.
24. Integrate **accessible RV rental** (affiliate/deep-link) — surface adapted-RV options only where verifiable; otherwise show generic RVs with explicit "adapted availability not verified" and never auto-tag "accessible".
25. Add **RV dimension-aware routing** (height/length/weight) for campervan legs + **accessible service-point** POIs along the route.
26. Add **accessible nature-trail + handbike route planner near each campsite** (OSM/Wheelchair routing: surface, gradient, length, boardwalks, rest points), feeding the per-stop daily plan and the trip confidence score.

---

### Guardrails carried from the current codebase
- **No fake prices, no invented booking links** — already enforced in `src/lib/amadeus.ts` + `src/components/deal-cards.tsx`. Accessibility follows the same contract.
- **Real providers or an honest unavailable state** — extend the flights/hotels pattern to accessibility data.
- **Hebrew-first, RTL-correct, multilingual** — i18n layer restored; all new accessibility copy must ship in `messages/he.json` + `en.json`.

_This document sets direction only. No application code was modified._
