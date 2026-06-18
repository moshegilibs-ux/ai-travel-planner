# PROJECT STATUS — AI Travel Planner

---

## ✅ Checkpoint — 2026-06-18 (caravan/handbike cards + WhatsApp sharing)

- **Branch:** `work/2026-06-07-accessibility-flights-hotels`
- **Last commit:** `6e19b2c` — feat: add caravan handbike cards and whatsapp sharing
- **Verified green:** `npm run build` ✅ · `tsc --noEmit` ✅ 0 errors · `npm test` ✅ 35/35.
- **Completed in this commit:**
  - 🚐 **Caravan trip cards** — `טיול קרוואנים` is now a visible trip card on the home page (`travel-type-section.tsx` ← `destinations-data.ts`).
  - 🚴 **Handbike trip cards** — `טיול אופני ידיים` is now a visible trip card on the home page (`travel-type-section.tsx` ← `destinations-data.ts`).
  - 💬 **WhatsApp sharing** (`https://wa.me/?text=`) — on route cards + trip summary (`custom-itinerary-section.tsx`) and the final itinerary page `/results` (`results-view.tsx`); new reusable `whatsapp-share-button.tsx`.

---

## 🔋 Emergency Checkpoint — 2026-06-15 (low battery)

- **Branch:** `work/2026-06-07-accessibility-flights-hotels`
- **Last commit:** `7ec9510` — Add session handoff note (battery stop 2026-06-15)
- **Prev commit:** `ab3eda5` — Add accessible handcycle and caravan trip options
- **Working tree:** clean as of last commit (this status edit is the only new change).
- **Verified green today:** `npm run build` ✅ · `tsc --noEmit` ✅ 0 errors · `npm test` ✅ 35/35.
- **Done:** 🚴 handcycle + 🚐 accessible caravan trip types + 🚶 walker (`walkerUser`) — complete.
- **Still missing:** Amadeus API keys ❌ · OpenAI key ❌.
- **OneDrive gotcha:** if build/tsc fails with `TS6053` on `.next/types` or `EINVAL readlink` in `.next`, it's a stale `.next` on OneDrive — `Remove-Item -Recurse -Force .next ; npm run build`. Not a code bug.
- **Backup:** full copy (incl. `.git`, excl. `node_modules`/`.next`) at `C:\Users\moshe\Desktop\ai-travel-planner-backup-latest`.
- **Resume from:** `HANDOFF_להמשך.md`. Next options: Amadeus keys / voice+chat MVP (`ACCESSIBLE_VOICE_CHAT_PLAN.md` §9).

---

## ⏸️ End-of-Day Checkpoint — 2026-06-07

> Checkpoint only. No code changes in this entry. Git is still broken (cannot commit). Dev server may be running on port 3001.

### 1. Completed today
- **Removed mock flight prices from the planner** — the planner's flight search now returns real Amadeus offers or an explicit unavailable state only; no mock flights, no `$ NaN`.
- **Enriched itinerary days** — each day now shows **transportation tips**, **accessibility notes** (always ending with "נגישות לא מאומתת — מומלץ לבדוק מול המקום"), **rest breaks**, and **estimated daily cost** (labeled "הערכה בלבד"). Hotel-budget and transfer costs are marked as estimates.
- **Added a hotel search section inside the planner** — real Amadeus hotels with filters (price, rating, stars, accessibility, area); unavailable-only without keys; reuses the marketplace `HotelCard`.
- **Added selected-hotel support** — `selectedHotel` state + persistence in saved itineraries (parity with `selectedFlight`).
- **Added a flight + hotel Trip Summary** — shows the selected flight + selected hotel + a combined estimate (clearly labeled estimate).
- **Wired prefill** — destination + derived dates now prefill both the flight and hotel search sections from the planner.
- **Fixed the `/he/questionnaire` runtime error** — root cause: a Client Component rendered the server-only `AppHeader` (`getTranslations`). Split into a Server Component page + a client `QuestionnaireForm`. Page now loads and generates itineraries.
- **Verification:** `tsc` → 0 errors · `npm test` → 29/29 pass · `npm run build` → ✓ compiled successfully.
- **Full product verification pass** — home planner, route options, day details, flight/hotel sections, and the questionnaire all confirmed working in the browser; no fake prices anywhere; honest "demo engine" / "unavailable" labels.

### 2. Current blockers
- **Missing `AMADEUS_API_KEY`** — real flights/hotels show the unavailable state (keys provided earlier are not loaded in `.env.local`).
- **Missing `AMADEUS_API_SECRET`** — same.
- **Missing `OPENAI_API_KEY`** — the "AI" planner is a local deterministic generator (honestly labeled), not real AI.
- **Verified accessibility data model (Task #2) not implemented** — accessibility is still profile-based + keyword heuristics, not source-verified.
- **Google Places accessibility integration (Task #5) not implemented.**
- **Git repository still broken** — `.git/HEAD` + `.git/index` are corrupt OneDrive placeholders; cannot run git/commit until repaired.

### 3. Next priority tasks
1. **Add Amadeus credentials** to `.env.local`, restart, and verify real flights/hotels replace the unavailable state.
2. **Build the verified accessibility data model** (`AccessibilityFact` + confidence merge) — Task #2.
3. **Integrate Google Places accessibility data** (`accessibilityOptions`) onto attractions/hotels — Task #5.
4. **Repair the Git repository** and commit the (substantial) uncommitted work.
5. _(Optional)_ Add an OpenAI key so the planner is real AI, and make per-day estimated cost consistent across all days.

### 4. Modified / new files today

**New (4):**
- `src/app/api/hotels/search/route.ts`
- `src/services/api/hotels.ts`
- `src/components/hotels-section.tsx`
- `src/components/questionnaire-form.tsx`

**Modified (8):**
- `src/components/custom-itinerary-section.tsx` (day enrichment, hotel section, trip summary, selected-hotel + date/destination prefill)
- `src/lib/ui-translations.ts` (new he/en labels)
- `src/services/api/flights.ts` (removed client mock fallback)
- `src/app/api/flights/search/route.ts` (removed server mock branch)
- `src/components/flights-section.tsx` (honest unavailable copy + destination/date prefill props)
- `src/lib/saved-itineraries.ts` (added `selectedHotel`)
- `src/app/questionnaire/page.tsx` (converted to a Server Component)
- `tests/accessibility-profile.test.mjs` (point profile-prefill assertion at `questionnaire-form.tsx`)

_(All uncommitted — git is broken. The earlier marketplace provider cleanup + planning docs were committed previously as `0bdca7f`.)_

---

## ⏸️ End-of-Day Checkpoint — 2026-06-06

> Checkpoint only. Nothing committed or pushed for Task #1; no dev servers running; no merge/rebase/cherry-pick in progress.

### Snapshot
- **Current branch:** `fix/reconcile-gili-marketplace`
- **Last commit:** `0bdca7f` — _enforce real travel providers and document accessible travel roadmap_
- **Working tree:** uncommitted Task #1 changes (see below).

### Completed today
1. **Restart recovery** — verified state intact; repaired restart-corrupted `node_modules` (removed orphaned `@types/node-fetch`, ran `npm ci` + `prisma generate`).
2. **Committed** provider cleanup + accessible-travel planning docs as `0bdca7f` (fixed a malformed message via amend).
3. **Implemented Task #1 (Accessibility Profile Onboarding)** — not committed; all local checks green.

### Task #1 progress — Accessibility Profile Onboarding
**Status: implemented + verified locally; NOT committed. Browser QA still pending.**

Verification: `npx tsc --noEmit` → 0 errors · `npm run build` → passes (`/accessibility` route builds) · `npm test` → **29/29** (6 new).

**New (untracked):**
- `src/lib/accessibility-profile.ts` — pure module: `MobilityDevice`/profile types, `A11Y_PROFILE_STORAGE_KEY = "trippilot:a11y-profile"`, `parse`/`load`/`save`, mappers `deriveSearchPrefill`/`deriveHeroAccessibility`/`deriveMobilityLevel`. localStorage-only.
- `src/components/accessibility-onboarding.tsx` — guided form + home-page gate.
- `src/app/accessibility/page.tsx` — standalone `/accessibility` editor.
- `tests/accessibility-profile.test.mjs` — load/save + mapping + "consumers read profile" assertions.

**Modified (uncommitted):**
- `src/lib/travel-options.ts` (+`handbike` in `mobilityOptions`), `src/types/travel-marketplace.ts` (+`"handbike"` in `AccessibilityProfile`, type-only).
- `src/components/search-form.tsx`, `src/components/hero-trip-planner.tsx`, `src/app/questionnaire/page.tsx` — mount-time pre-fill from profile.
- `src/app/page.tsx` — renders the onboarding gate.
- `messages/en.json`, `messages/he.json` — `accessibilityOnboarding` namespace.

**Constraints honored:** localStorage-only (no `/api/preferences`, no Prisma/DB changes); did NOT touch `src/app/api/search/route.ts`, `src/lib/amadeus.ts`, or the Amadeus/Zod search contract; Task #2 not started.

### Remaining work for Task #1
- Browser QA (home gate → set profile → confirm pre-fill on `/search`, hero planner, `/questionnaire`; he + en, RTL/LTR; dark mode).
- Review, then commit on `fix/reconcile-gili-marketplace`.

### Exact next step for tomorrow
1. `git status` to reconfirm the uncommitted Task #1 file set.
2. Start dev server; run the browser QA pass above.
3. If QA passes, commit Task #1 (do not push unless asked).

**Recommended first task tomorrow:** manually QA Task #1 in the browser, then commit it — code is implemented and green; only real-browser verification remains.

---

_Last analyzed: 2026-06-06 • Originally audited on `main` • Priority-1 reconciliation done on branch `fix/reconcile-gili-marketplace`._

An accessibility-first, multilingual (Hebrew-RTL primary) AI travel-planning web app: it searches flights/hotels/rentals, generates day-by-day itineraries with OpenAI, and supports saving, price-tracking, payments and affiliate links. This document summarizes the current state of the codebase.

> ✅ **RESOLVED (2026-06-06):** The marketplace/search cluster has been reconciled. The gutted infrastructure modules were restored to their committed (HEAD) implementations — identical to the orphaned `*-gili` copies — so `searchTravel` / `getTripById` exist again and `/search`, `/trip/[id]`, and `/api/search` work. **Whole-project typecheck: 0 errors. `npm run build`: passes. `npm test`: 18/18 pass.** Today's multi-destination itinerary feature, localization, accessibility, and homepage were preserved. The orphaned `*-gili`/`*-moshe` files were moved out of the tree to a recoverable backup. See [Resolution](#resolution-2026-06-06) and [Current Known Bugs](#current-known-bugs).

---

## Resolution (2026-06-06)

**Root cause (confirmed):** the working tree had *gutted* a set of library/type modules to stubs, which transitively broke their committed consumers (`search/page.tsx`, `trip/[id]/page.tsx`, `api/search/route.ts`, `middleware.ts`, `language-switcher.tsx`, `health-checks.ts`, `openai-agent.ts`, …). The real implementations were intact in HEAD and byte-identical in the `*-gili` backups. A fresh `tsc` (cache disabled) showed **96 errors**; an earlier cached run had falsely reported clean.

**What was restored** (to committed/HEAD versions — these reconcile the `-gili` implementations back in):
`types/travel-marketplace.ts`, `lib/external-api.ts`, `lib/amadeus.ts` (`searchTravel`/`getTripById`/`getTripDeals(SearchParams)`), `lib/i18n.ts` (6 locales + RTL), `lib/ai-tools.ts`, `lib/feature-flags.ts`, `lib/user-trips.ts`, `lib/my-trip.ts` (verified compatible with today's itinerary code before restoring), `lib/prisma.ts` (real `PrismaClient`), `data/search-suggestions.ts`, `components/{deal-cards,trip-map,search-form,my-trips-view,voice-input-button,onboarding-panel}.tsx`, and `api/{favorites/flights,favorites/hotels,saved-trips}/route.ts` (re-added the `Prisma.InputJsonValue` casts).

**Targeted fixes (not blind restores):**
- `services/api/itinerary.ts` — added a `source: "ai" | "mock"` field so `api/ai/itinerary` compiles (today's itinerary subsystem bug); behavior unchanged.
- `package.json` — `openai` aligned to the installed/locked `^6.38.0`; re-added `@sentry/nextjs` and `isbot` (the active code imports them; the moshe variant had dropped them). Ran `npx prisma generate`.
- `tests/production-readiness.test.mjs` — updated 3 stale assertions (pre-existing failures at HEAD) that checked pre-i18n hardcoded Hebrew to instead verify the i18n keys (`t("selectFlight")`, `t("noBookingLink")`) and the locale-aware price helper. No behavior change.

**Preserved (untouched):** `lib/generate-itinerary.ts` (+multi-dest itinerary), `components/custom-itinerary-section.tsx`, `components/hero-trip-planner.tsx`, `components/search-route-option-card.tsx`, `lib/ui-translations.ts`, `i18n/request.ts`, `app/layout.tsx`, `messages/*.json`, and `language-switcher.tsx`.

**Orphans:** all 45 `*-gili`/`*-moshe` files + stray artifacts (logs, screenshot) moved to a recoverable sibling backup folder (`../orphan-backup-2026-06-06/`), not deleted.

---

## 1. Architecture

**Stack**
- **Next.js 15.3.3** (App Router) + **React 19.1** + **TypeScript 5.8** (strict). Note: `AGENTS.md` warns this Next.js may differ from training data — consult `node_modules/next/dist/docs/` before changing framework code.
- **Tailwind CSS v4** (`src/app/globals.css`), Lucide icons, Framer Motion, Sonner toasts.
- **next-intl 4.1** for i18n (wired in `next.config.ts` via `createNextIntlPlugin("./src/i18n/request.ts")`).
- **Prisma 6.8 / PostgreSQL** data layer; **Upstash Redis** optional cache.
- **NextAuth 4.24** (JWT strategy) for auth.
- **OpenAI SDK 4.103** for itinerary/agent generation; **Amadeus** for flights; **Google Places/Maps**; **Stripe** payments; **Resend** email; **Firebase** optional sync; **PostHog** analytics; **Sentry** monitoring.

**Layout**
```
src/
  app/            # App Router: pages + /api route handlers
  components/     # ~45 React components
  lib/            # business logic, integrations, env, auth, db
  services/api/   # client/server service wrappers (flights, places, maps, itinerary, images)
  data/           # static/mock data (suggestions, rentals, mock results, SEO)
  i18n/           # next-intl request config
  types/          # domain & next-auth types
messages/         # he, en, ar, ru, fr, es JSON translations
prisma/schema.prisma
```

**API routes (`src/app/api/*`)** — ~28 endpoints: `ai/itinerary`, `ai/agent`, `ai/optimize`, `generate-itinerary`, `flights/search`, `places/search`, `places/photo`, `autocomplete`, `search`, `weather`, `fx`, `saved-trips`, `price-tracking`, `favorites/{flights,hotels}`, `billing/{checkout,webhook}`, `email/send`, `notifications`, `affiliate/click`, `waitlist`, `auth/[...nextauth]`, `health` (+`/db`,`/ai`,`/payments`), `status`, and `jobs/price-recheck` (cron).

**Database models** (`prisma/schema.prisma`): User, Account, Session, SavedTrip, SearchHistory, FavoriteHotel, FavoriteFlight, TrackedFlight, Subscription (FREE/PRO/PREMIUM), UsageEvent, AffiliateEvent, Notification, Referral, PublicTrip, ErrorLog, UserPreference. `src/lib/prisma.ts` exposes a **Proxy that throws** if `DATABASE_URL` is unset, so DB-backed routes degrade rather than crash at import — but fail at call time.

**Middleware** (`src/middleware.ts`): locale detection + cookie persistence, maintenance-mode & waitlist-mode gating, CORS origin checks on API writes, bot blocking on AI endpoints, admin-route protection.

**Config & ops**: env validated with Zod in `src/lib/env.ts` (+ `public-env.ts` for client-safe vars); feature flags in `src/lib/feature-flags.ts`; health checks in `src/lib/health-checks.ts`; JSON logging in `src/lib/logger.ts`; Sentry in `src/lib/monitoring.ts`. Dockerfile (3-stage) + docker-compose (web/postgres/redis). Extensive docs: `DEPLOYMENT.md`, `DEPLOYMENT_GUIDE.md`, `SMOKE_TESTS.md`, `SECURITY_CHECKLIST.md`, `INCIDENT_RESPONSE.md`, `SCALING_GUIDE.md`, `PUBLIC_LAUNCH.md`.

---

## 2. Localization System

- **Library:** next-intl. Server config at `src/i18n/request.ts`.
- **Languages present:** 6 — `he` (primary, RTL), `en`, `ar`, `ru`, `fr`, `es` (in `messages/`).
- **Coverage is uneven:** `messages/he.json` is the source of truth (~277 lines, all keys); `en.json` is complete; **`ar/ru/fr/es` are stubs (~21 lines each)** missing many keys (notifications, results.summary, etc.).
- **Locale detection priority:** URL path → cookie (`trippilot-locale`, fallback `NEXT_LOCALE`) → `Accept-Language` → default `he`. Persisted in cookie + `localStorage`. `src/components/i18n-client-sync.tsx` keeps `<html lang/dir>` in sync on the client.
- **RTL:** `rtlLocales = {he, ar}`; a `getDirection()` helper exists — but **in the orphaned `src/lib/i18n-gili.ts`**, the fuller implementation.

**Conflicts / debt:**
- **Two i18n modules:** wired-in `src/lib/i18n.ts` (only 4 locales `he/en/es/fr`, basic path helpers, **no RTL, no `ar/ru`**) vs orphaned `src/lib/i18n-gili.ts` (6 locales + RTL + `detectLocale`). The richer one is not imported.
- `src/i18n/request.ts` and `src/app/layout.tsx` only load **he + en** and compute direction as `locale === "en" ? "ltr" : "rtl"` — so Arabic would render with English messages and Spanish/French would wrongly be treated as RTL if selected.
- `globals.css` body font stack covers Hebrew/Latin only (no Arabic/Cyrillic fallback fonts).
- Two language switchers: `language-switcher.tsx` (native `<select>`, active) vs orphaned `language-switcher-moshe.tsx` (ARIA tablist variant).

---

## 3. Accessibility Features

**Strengths**
- Accessibility is a first-class product concept: the itinerary/travel form types (`src/lib/itinerary-types.ts`, `travel-options.ts`) model mobility level (independent/mobility-aid/wheelchair/caregiver-dependent), elevator/step-free needs, max walking time, rest breaks, route difficulty, dietary/kosher/Shabbat constraints — and these flow into itinerary generation.
- Marketing/hero imagery is genuinely inclusive: `public/accessible-family-hero-v2.png` with rich Hebrew `alt` describing a multi-generational family with wheelchair/mobility-scooter users (`src/app/page.tsx`).
- **Voice input** via Web Speech API, localized to all 6 speech locales (`he-IL`, `en-US`, `ar-SA`, `ru-RU`, `fr-FR`, `es-ES`) — but the **full implementation is in the orphaned `voice-input-button-gili.tsx`**; the wired-in `voice-input-button.tsx` is a stub.
- Keyboard support on custom controls (Space/Enter activation + visible `focus-visible` outlines), `sr-only` labels, `aria-label` on icon buttons/modals/switchers, `aria-current` on route cards, `aria-selected`/`role="tablist"` in the moshe switcher variant. Dark mode honors `prefers-color-scheme`.

**Gaps**
- No `prefers-reduced-motion` handling for Framer Motion / CSS keyframe animations.
- No `aria-live` regions for toasts/dynamic results; limited `aria-expanded`/`aria-describedby`.
- No user-facing accessibility preferences (contrast, motion, font size) persisted.
- Wired-in `onboarding-panel.tsx` is a stub returning `null` (the real onboarding with demo trips is the orphaned `onboarding-panel-gili.tsx`).
- Sparse landmark structure (limited `<nav>`/`<footer>`/`<fieldset>`).

---

## 4. Itinerary Generation

**Providers:** OpenAI only. Default model `gpt-4.1-mini` (override via `OPENAI_MODEL`); key from `OPENAI_API_KEY` or `AI_API_KEY` (`src/lib/env.ts`). Uses OpenAI's **Responses API with strict `json_schema` structured output** — not function-calling.

**Entry points**
- `POST /api/generate-itinerary` → legacy questionnaire path. `src/lib/openai-itinerary.ts` builds a Hebrew system prompt + a deep strict JSON schema (days → activities → recommendations, with accessibility tags, travel times, costs, kosher/Chabad notes; explicit support for motorcycle/road-cycling/e-bike/MTB trips). Falls back to `generateMockItinerary` (`src/lib/mock-itinerary.ts`) when no key & non-production.
- `POST /api/ai/itinerary` → newer multi-destination path (Zod-validated input incl. Hebrew trip types/preferences and optional selected flight). Server generation in `src/services/api/itinerary.server.ts`.
- `POST /api/ai/agent` → chat assistant. Two-step: extract structured **travel intent** → run **local JS "tools"** (`src/lib/ai-tools-gili.ts`: flights, hotels, budget, itinerary, compare/optimize) to assemble context → produce a structured assistant response (summary, suggestions, pros/cons, risks, price prediction). **Streams** text word-by-word. Has a Hebrew fallback response on failure.
- `POST /api/ai/optimize` → deal optimization. **Note:** wired-in `src/lib/ai-tools.ts` `optimizeDeals()` is a **no-op stub**; the real scoring is in `ai-tools-gili.ts`.

**Mock vs real:** chosen via `isMockMode()` / `NEXT_PUBLIC_USE_MOCK_DATA` / presence of keys / `NODE_ENV`. `FEATURE_AI_ENABLED=false` → 503 + fallback UI.

**Caching & limits:** `src/lib/ai-cache.ts` is an **in-memory `Map` with 5-min TTL** (not Redis; per-instance only). Rate-limit calls exist on AI routes (10/20/30 per IP) but `src/lib/rate-limit.ts` is a **stub returning `{ok:true}`** — effectively disabled.

**Persistence:** primarily **browser `localStorage`** — `saved-itineraries.ts` (`travel-saved-itineraries`), `my-trip.ts` (`travel-my-trip`, dispatches `my-trip-updated` event). DB-backed `user-trips.ts` is stubbed and falls back to localStorage. PDF export via jsPDF with RTL (`export-itinerary-pdf.ts`).

---

## 5. Route Selection Flow

- **`search-route-option-card.tsx`** renders a `RouteOption` (name, duration, "why this route fits", accessibility summary, multi-city destinations with nights, and a budget breakdown of international flights / hotels / domestic transport). Clicking selects it and navigates to `/search…#daily-itinerary`, smooth-scrolling to the itinerary; shows a "נבחרה" (selected) badge with `aria-current`.
- **Maps:** `src/components/trip-map.tsx` is currently a **16-line placeholder** ("מפה" heading + destination label) — it ignores its `hotels`/`rentals` props. The real interactive map is the orphaned `trip-map-gili.tsx`. `src/services/api/maps.ts` only builds Google Maps **search URLs** (`getMapUrl`) used by "open in maps" links.
- There is no standalone "route selection" page; route options surface inside the itinerary/search context, and selecting a flight+hotel in search results leads to `/trip/[id]`.

---

## 6. Search Flow

**Path:** `search-form.tsx` (origin, destination, dates, travelers, budget, accessibility profile/filters; recent searches in `localStorage`; destination autocomplete via `/api/autocomplete`) → submits all fields as URL params to **`/app/search/page.tsx`** (server component) → calls `searchTravel(params)` → renders **`search-results-view.tsx`**.

**Results view** is a client-side 3-step funnel: (1) choose flight, (2) choose hotel/rental (tabbed), (3) summary with estimated total + booking links. Rich client-side filtering/sorting (price, rating, stars, nonstop, amenities, accessibility, kitchen/elevator/parking/kids). Cards live in `deal-cards.tsx`. `TripMap` is embedded (but is the stub).

**Data sources:** intended via `searchTravel` (flights from Amadeus or mock, hotels/rentals from mock JSON) + Google Places for attractions; `/api/search` also persists `SearchHistory` for authed users and is Zod-validated. Supporting APIs: `weather` (OpenWeather→WeatherAPI fallback), `fx` (exchangerate.host→ExchangeRate-API), `autocomplete` (Mapbox + local data). Mock flight generation in `src/lib/mock-flights.ts`; static suggestions in `src/data/search-suggestions.ts`.

> ✅ This flow was broken at the import level and is now **fixed** (bug #1, resolved 2026-06-06). `searchTravel` is restored; `TripMap` is now the real interactive map, not the stub.

---

## 7. Current Known Bugs

### ✅ Resolved on 2026-06-06 (Priority-1 reconciliation)
1. **~~Broken `searchTravel` / `getTripById` imports~~ → FIXED.** `src/lib/amadeus.ts` restored to the full implementation; `searchTravel`, `getTripById`, `getTripDeals(SearchParams)`, `isAmadeusConfigured` are exported again. `/search`, `/api/search`, and `/trip/[id]` build and run.
2. **~~~40 orphaned `*-gili`/`*-moshe` files~~ → REMOVED from tree.** All 45 moved to a recoverable sibling backup (`../orphan-backup-2026-06-06/`). No source file imported them; the real logic was folded back into the active files.
3. **Core stubbed modules → PARTIALLY restored.** Restored: `external-api.ts` (retry/timeout), `ai-tools.ts` (agent tools), `onboarding-panel.tsx`, `voice-input-button.tsx` (real voice input), `trip-map.tsx` (real map). **Still intentionally stubbed (out of this scope):** `rate-limit.ts` (`{ok:true}`) and `analytics.ts` (`trackServerEvent` no-op) — see open items below.
4. **Localization → COMPILES + RTL restored.** `lib/i18n.ts` restored (6 locales, RTL, `getDirection`/`detectLocale`/`localeCookieName`), fixing `middleware.ts`, `language-switcher.tsx`, `i18n-client-sync.tsx`. Note the app still loads only he/en in `layout.tsx`/`request.ts` (preserved today's), and `ar/ru/fr/es` message files remain incomplete — see open items.

**Verification:** whole-project `tsc --noEmit` = **0 errors**; `npm run build` = **passes**; `npm test` = **18/18 pass**.

### Still open (risks / debt — not in Priority-1 scope)
5. **Rate limiting is still a no-op** (`rate-limit.ts` returns `{ok:true}`); no real limiting on `/admin`, `/api/saved-trips`, `/api/ai/*`. Restore from the (now backed-up) implementation or add Redis-backed limiting.
6. **Server analytics is a no-op** (`analytics.ts` `trackServerEvent`); affiliate/analytics events are dropped.
7. **Auth not wired for real use.** `next-auth.ts` has empty `providers: []` + hardcoded fallback secret; `auth.ts` is a localStorage token model. No real sign-in / server session validation. (Unchanged by this work.)
8. **DB requires `DATABASE_URL` + generated client.** `prisma.ts` now instantiates a real `PrismaClient` and the client is generated, but persistence routes still need `DATABASE_URL` at runtime; failures surface at call time, not startup.
9. **Incomplete translations** for `ar/ru/fr/es`, and `layout.tsx`/`request.ts` only load he/en — full multi-locale UI is not yet wired end-to-end.
10. **Docs overstate readiness** (README/DEPLOYMENT claim rate limiting + session admin auth that aren't in place; admin still uses `?token=`).

---

## 8. Next Improvements

✅ **Done in this pass:** reconcile the gili/moshe fork for the marketplace cluster (was #1/#2), restore the search/trip imports, restore the real trip map (was #7), restore voice input + onboarding.

Remaining, in rough priority order:

1. **Implement real rate limiting** (Redis/Upstash-backed) on AI and write endpoints; `rate-limit.ts` is still a `{ok:true}` no-op.
2. **Restore server analytics** (`analytics.ts` `trackServerEvent`) so affiliate/analytics events aren't dropped.
3. **Make auth real:** register a NextAuth provider (Google OAuth and/or credentials), add the Prisma adapter, remove the hardcoded secret fallback (fail fast in prod), and drop the localStorage-token model / `?token=` admin auth in favor of sessions.
4. **Finish multi-locale UI:** load all 6 locales' messages in `request.ts`/`layout.tsx`, use `getDirection()` for `dir`, and **complete the `ar/ru/fr/es` translations** (plus Arabic/Cyrillic webfonts). The `i18n.ts` logic now supports this.
5. **Harden the DB story:** validate `DATABASE_URL` at startup with a clear error and gate persistence features behind a capability check instead of failing at call time.
6. **Add an accessibility-preferences layer:** `prefers-reduced-motion` support, `aria-live` for toasts/results, and a persisted user toggle for motion/contrast/font-size.
7. **Repo hygiene + CI:** `.gitignore` dev logs/screenshots; add a CI pipeline running `tsc`/`build`/`npm test` so a stale `.tsbuildinfo` can't mask broken imports again. Decide the fate of the backed-up orphan files (keep archived vs delete).
8. **Reconcile remaining gutted stubs** still on the moshe side if desired (`db.ts`, `next-auth.ts`, `saved-itineraries.ts`, `public-env.ts`) — currently compile but are thinner than HEAD.
9. **Align `package.json` deps deliberately:** the working set mixes moshe/gili version ranges; pick one coherent set and `npm ci` to match the lockfile.
10. **Verify Amadeus/OpenAI/Places live paths** end-to-end with real keys (the reconciled code is type/build-verified but external calls were not exercised here).

---

_Audited 2026-06-06. §1–§6 reflect the pre-fix snapshot for context; the [Resolution](#resolution-2026-06-06) section and §7 reflect the post-reconciliation state (typecheck 0 errors, build passing, 18/18 tests). Changes were made on branch `fix/reconcile-gili-marketplace`; no commit has been made._
