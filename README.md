# טיולים וחלומות

AI-powered accessible family travel planner for families, seniors, and travelers with disabilities.

Tagline: **מטיילים יחד, בלי גבולות**

## Project Overview

`ai-travel-planner` is a production-oriented Next.js travel platform focused on accessible, calm, family-friendly trip planning. It supports AI itinerary generation, flight search, place recommendations, maps/photos, saved trips, admin status checks, and mock fallback for development.

The app is built to run on Vercel with server-side API routes for sensitive providers. API keys are never exposed to the client bundle.

## Features

- Hebrew RTL homepage and accessible family travel branding.
- AI itinerary generation with OpenAI, schema validation, and mock fallback.
- Google Places / Maps integration through server-side API routes.
- Google place photo proxy route that keeps API keys server-side.
- Amadeus flight search through a server-side API route.
- Mock mode for development and preview environments.
- Personalized itinerary cards with images, ratings, costs, opening hours, maps, and replacement options.
- Flight cards with filtering, sorting, selection, itinerary integration, and PDF export compatibility.
- Admin status dashboard protected by `ADMIN_ACCESS_TOKEN`.
- API status endpoint with provider readiness and no secret exposure.
- Saved trips and price tracking APIs prepared for authenticated users and database persistence.
- Production docs, deployment guide, and smoke test plan.

## Tech Stack

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- OpenAI SDK
- Google Places / Maps API
- Amadeus API
- NextAuth
- Prisma + PostgreSQL
- Stripe-ready billing routes
- Resend-ready email layer
- PostHog/Sentry-ready observability

## Local Development

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev -- -p 3001
```

Quality checks:

```bash
npm run lint
npm run build
```

Open:

```text
http://localhost:3001
```

## ENV Setup

Use `.env.example` as the safe template. Do not commit `.env.local`.

Required production-oriented variables:

```env
OPENAI_API_KEY=
GOOGLE_MAPS_API_KEY=
AMADEUS_CLIENT_ID=
AMADEUS_CLIENT_SECRET=
ADMIN_ACCESS_TOKEN=
NEXT_PUBLIC_USE_MOCK_DATA=false
NODE_ENV=development
```

Local development can use mock mode:

```env
NEXT_PUBLIC_USE_MOCK_DATA=true
ADMIN_ACCESS_TOKEN=dev-token
```

Production should use real mode:

```env
NODE_ENV=production
NEXT_PUBLIC_USE_MOCK_DATA=false
```

## Environment Architecture

Server-side ENV is centralized in:

```text
src/lib/env.ts
```

Client-safe public ENV helpers are isolated in:

```text
src/lib/public-env.ts
```

Important helpers:

- `isProduction`
- `isMockMode`
- `hasOpenAI`
- `hasGoogleMaps`
- `hasAmadeus`
- `validateProductionRuntimeEnv`

In production, missing critical ENV values fail clearly instead of silently pretending real providers are available.

## Deployment

Vercel settings:

- Root Directory: `ai-travel-planner`
- Framework Preset: `Next.js`
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: `.next`

Deployment steps:

1. Push this project to GitHub.
2. Import the repo into Vercel.
3. Set Root Directory to `ai-travel-planner`.
4. Add Environment Variables in Vercel.
5. Deploy Preview.
6. Run `SMOKE_TESTS.md`.
7. Promote or deploy Production.
8. Run `SMOKE_TESTS.md` again against Production.

Full details:

```text
DEPLOYMENT.md
```

## Smoke Tests

Manual post-deploy tests live in:

```text
SMOKE_TESTS.md
```

They cover:

- `/`
- `/admin`
- `/api/status`
- AI itinerary generation
- Google Places search
- Place photo proxy
- Amadeus flights search
- Saved trips
- Price tracking
- Secret exposure checks

## Production Ready Checklist

- [x] `.env.local` ignored by Git.
- [x] `.env.example` safe to commit.
- [x] Vercel build command documented.
- [x] Production ENV list documented.
- [x] Admin status route protected by token.
- [x] Basic rate limiting added to sensitive admin/status routes.
- [x] Real provider routes keep API keys server-side.
- [x] Mock fallback available for development and preview.
- [x] Smoke test plan included.
- [x] `npm run lint` passes.
- [x] `npm run build` passes.
- [ ] Replace query-token admin auth with secure session/cookie before broader public launch.
- [ ] Add Redis-backed rate limiting for multi-instance production.
- [ ] Run smoke tests on the real Vercel Preview and Production URLs.
- [ ] Verify provider billing/quota limits before opening to real users.

## Security Notes

- Never commit `.env.local`, `.env`, `.env.production`, or `.env*.local`.
- Only `.env.example` should be committed.
- Do not prefix secret keys with `NEXT_PUBLIC_`.
- `ADMIN_ACCESS_TOKEN` is a temporary hardening layer. Replace it with secure session/cookie auth for production administration.
- Check browser DevTools after deployment to verify secrets are not present in network responses or client bundles.

## Useful Commands

```bash
npm install
npm run dev -- -p 3001
npm run lint
npm run build
```

## Key Files

```text
.env.example
DEPLOYMENT.md
SMOKE_TESTS.md
src/lib/env.ts
src/lib/public-env.ts
src/app/api/status/route.ts
src/app/api/flights/search/route.ts
src/app/api/places/search/route.ts
src/app/api/ai/itinerary/route.ts
```
