# Accessible Travel Roadmap — AI Travel Planner

_Last updated: 2026-06-06 • Companion to `ACCESSIBLE_TRAVEL_PRODUCT_PLAN.md`. Direction-setting only — no application code changed._

Goal: turn this app into an **accessibility-first AI travel planner** for people with disabilities (wheelchair users, disabled veterans, elderly travelers, handbike riders, limited-walking travelers), delivered in four phases.

### Legend

- **Business value** — why it matters to disabled travelers and/or the business.
- **Technical complexity** — `Low` / `Medium` / `High` (engineering difficulty + unknowns).
- **Dependencies** — what must exist first.
- **Effort** — `S` (≈1–3 days) · `M` (≈1–2 weeks) · `L` (≈3+ weeks / multi-sprint).

### Standing integrity rule (applies to every phase)

Never present unverified accessibility (or prices) as verified. Missing/low-confidence data shows **"נגישות לא מאומתת — מומלץ לבדוק מול המקום"** with source + last-checked + confidence. Already enforced for prices (`src/lib/amadeus.ts`, `deal-cards.tsx`); extended to all accessibility data.

### Current baseline (already in the codebase)

- Real flights via Amadeus with honest "unavailable" state, no fake prices/booking links **(shipped this cycle)**.
- Multi-destination AI itinerary engine (`generate-itinerary.ts` / `openai-itinerary.ts`), RTL PDF export, i18n (he/en), saved trips, `PublicTrip`/`AffiliateEvent` data models in Prisma.
- Accessibility primitives: `AccessibilityProfile` type, `MobilityLevel`/`RouteDifficulty` enums, accessibility filters in `search-form`/`hero-trip-planner`.

---

## Phase 1 — MVP

_Goal: a wheelchair user can build a multi-destination trip with real flights, accessible hotels, and accessible attractions, with honest confidence labeling._

| Feature | Business value | Complexity | Dependencies | Effort |
|---|---|---|---|---|
| **Accessibility profile (intake)** | Foundation of the whole product — personalizes every result; without it the app is just a generic planner | Low–Medium | Extends `search-form` + `TravelFormData` | **M** |
| **Wheelchair support** | Serves the core audience; encodes hard constraints (step-free, door width, roll-in WC) so unusable options are excluded, not surfaced | Medium | Accessibility profile, accessibility data model | **M** |
| **Accessibility filters** | Lets users filter by step-free / elevator / accessible WC / accessible parking; turns data into decisions | Low–Medium | Data model, accessibility profile | **M** |
| **Multi-destination itineraries** | Key differentiator; already largely built — needs accessibility tagging + distance/rest-break awareness | Medium (engine exists) | Accessibility data model | **S–M** |
| **Accessible attractions** | Real per-POI accessibility (entrance/restroom/parking/seating) from Google Places `accessibilityOptions` — verified-ish data available now | Medium | Google Places integration, data model | **M** |
| **Accessible hotels** | Lodging is make-or-break; needs step-free/elevator/roll-in-shower/accessible-WC flags + confidence | Medium–High | Hotel provider, data model | **M–L** |
| **Real flights integration** | Trust + real prices; **shipped** (real-only, unavailable state). Remaining: assistance labeling (WCHR/WCHS/WCHC), live keys | Medium (mostly done) | Amadeus keys | **S** |
| **Real hotels integration** | Real lodging inventory/prices; Amadeus hotels is coarse, so affiliate (Booking/Expedia) likely needed for depth | High | Provider keys/affiliate, data model | **L** |

---

## Phase 2 — Private Beta

_Goal: the accessibility data is trustworthy — sourced, scored, and warned-on — and the user can move between places accessibly._

| Feature | Business value | Complexity | Dependencies | Effort |
|---|---|---|---|---|
| **Verified accessibility data** | The core promise — distinguishes `verified` vs `reported` vs `unverified` from multiple sources; the trust engine of the product | High | Data model, providers (Places/OSM/Wheelmap), confidence merge logic | **L** |
| **Accessible transport** | Closes the gap between bookings — step-free transit, drop-off proximity, accessible rail; trips become actually doable | High | Routing provider, accessibility data, verified data | **L** |
| **Museum accessibility** | High-demand accessible activity; ramps, lifts, audio/tactile guides, accessible WC | Medium | Places/OSM data, data model | **M** |
| **Beach accessibility** | High emotional value for wheelchair users — access mats, amphibious chairs, boardwalks; data is sparse so warnings matter | Medium | Data sources + user reports, data model | **M** |
| **Accessible route warnings** | Safety/trust — flags uncertain or blocked accessibility on any leg before the user commits | Medium | Confidence model, routing, verified data | **M** |
| **Accessibility confidence scores** | Trip-level trust signal + "verify before you go" checklist; the visible output of the verification engine | Medium | Data model, confidence merge logic | **M** |

---

## Phase 3 — Public Beta

_Goal: open up new accessible trip types (caravan/RV, nature, handbike) and make plans shareable/printable._

| Feature | Business value | Complexity | Dependencies | Effort |
|---|---|---|---|---|
| **Caravan / RV travel** | Major new trip type for an underserved audience; high differentiation and stickiness | High | RV rental + dimension routing + campsites + accessibility data | **L** |
| **Accessible campsites** | Enables RV/nature trips — step-free shower/toilet, accessible pitch, hookups, accessible parking | Medium–High | Campsite providers, data model | **L** |
| **Handbike routes** | Niche but passionate, loyal audience (esp. Europe); strong word-of-mouth differentiation | High | Wheelchair/handbike routing (surface + incline) | **L** |
| **Accessible nature trails** | Outdoor access for wheelchair/handbike users — surface, gradient, boardwalks, rest points | Medium | OSM/AllTrails + routing, data model | **M** |
| **Route sharing** | Virality + caregiver collaboration; reuses existing `PublicTrip` model | Low–Medium | Saved trips, `PublicTrip` | **M** |
| **PDF exports** | Offline accessible day sheets (distances, restrooms, rest points, medical proximity); exporter already exists | Low | Itinerary | **S** |

---

## Phase 4 — Production Launch

_Goal: real bookings, real partnerships, and a community that keeps accessibility data fresh._

| Feature | Business value | Complexity | Dependencies | Effort |
|---|---|---|---|---|
| **Live booking integrations** | End-to-end conversion + revenue; the business model | High | Providers, auth (real), payments (Stripe wired), error handling | **L** |
| **Booking / Amadeus integrations** | Real inventory + commission revenue; deeper hotel accessibility facilities | High | Provider contracts/keys, affiliate model | **L** |
| **Accessibility partner network** | Verified data at scale + credibility (orgs, venues, tourism boards); turns `reported` into `verified` | High | BD/partnerships, data model, ingestion | **L** |
| **Reviews from disabled travelers** | Trust, authentic UGC, SEO, retention; lived-experience credibility | Medium | Real auth, moderation | **M** |
| **Community accessibility reports** | Coverage growth + network effect; users improve the map for each other | Medium–High | Real auth, moderation, data model, confidence rules | **L** |

---

## Top 20 features ranked by impact

Impact = (mission fit: accessibility-first) × (audience reach) × (differentiation), discounted by how blocked it is by missing prerequisites. Foundational/trust items rank highest because everything else depends on them.

| # | Feature | Phase | Why it ranks here | Effort |
|---|---|---|---|---|
| 1 | **Accessibility profile (intake)** | 1 | Nothing is "accessibility-first" without it; gates every other feature | M |
| 2 | **Verified accessibility data** | 2 | The core trust promise; converts a planner into *the* accessible planner | L |
| 3 | **Accessible hotels** | 1 | Lodging is the most common trip-blocker for wheelchair users | M–L |
| 4 | **Wheelchair support** | 1 | Core audience; hard-constraint filtering prevents unusable plans | M |
| 5 | **Accessibility confidence scores** | 2 | Makes the honesty rule visible and actionable ("verify before you go") | M |
| 6 | **Accessible attractions** | 1 | Real, available-now Places data; fills the day with usable stops | M |
| 7 | **Accessibility filters** | 1 | Turns data into decisions; low cost, high daily utility | M |
| 8 | **Real flights integration** | 1 | Trust anchor; mostly shipped — finish assistance labeling | S |
| 9 | **Accessible route warnings** | 2 | Safety/trust; prevents stranding users mid-trip | M |
| 10 | **Accessible transport** | 2 | Connects bookings into a doable end-to-end trip | L |
| 11 | **Multi-destination itineraries** | 1 | Differentiator; engine exists, needs accessibility tagging | S–M |
| 12 | **Real hotels integration** | 1 | Real inventory/prices; unlocks booking revenue later | L |
| 13 | **Caravan / RV travel** | 3 | Big differentiated trip type for an underserved audience | L |
| 14 | **Community accessibility reports** | 4 | Network effect that compounds coverage over time | L |
| 15 | **Accessibility partner network** | 4 | Scales `verified` data + credibility | L |
| 16 | **Live booking integrations** | 4 | Revenue + true end-to-end; depends on trust + auth first | L |
| 17 | **Accessible campsites** | 3 | Enables RV/nature trips; high value where data exists | L |
| 18 | **Reviews from disabled travelers** | 4 | Lived-experience trust + SEO + retention | M |
| 19 | **Handbike routes** | 3 | Loyal niche, strong word-of-mouth, clear differentiation | L |
| 20 | **Route sharing** | 3 | Virality + caregiver collaboration; cheap via existing `PublicTrip` | M |

_Just below the top 20: museum accessibility, beach accessibility, accessible nature trails, PDF exports (a quick win — exporter already exists), Booking/Amadeus deep integrations._

---

### Sequencing notes
- **Phase 1 critical path:** Accessibility profile → data model → wheelchair support/filters → accessible attractions (Places) → accessible hotels. Real flights are essentially done.
- **Phase 2 is the trust phase:** verified data + confidence scores + route warnings are what make the brand defensible; ship them before opening new trip types.
- **Phase 3** rides on Phase 2's data model — caravan/RV, handbike, and trails all reuse the routing + confidence infrastructure.
- **Phase 4** needs real auth (currently stubbed), live provider keys/contracts, and moderation before launch.

_This document sets direction only. No application code was modified._
