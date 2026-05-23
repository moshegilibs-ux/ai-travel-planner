# טיולים וחלומות Deployment Guide

## Local Public Beta Check

```bash
npm install
npm run prisma:generate
npm run lint
npm run build
npm run dev -- -p 3001
```

Open:

```text
http://localhost:3001
```

## Production Verification

Before switching traffic to public beta, run:

```bash
npm run verify:production
```

Then verify the public health endpoints:

```bash
curl https://YOUR_DOMAIN.com/api/health
curl https://YOUR_DOMAIN.com/api/health/db
curl https://YOUR_DOMAIN.com/api/health/ai
curl https://YOUR_DOMAIN.com/api/health/payments
```

If a third-party system is not ready, disable the feature without redeploying:

```bash
FEATURE_AI_ENABLED=false
FEATURE_PAYMENTS_ENABLED=false
FEATURE_AFFILIATE_LINKS_ENABLED=false
WAITLIST_MODE=true
MAINTENANCE_MODE=false
```

## Database Backups

Create a manual backup before every migration:

```bash
npm run backup:db
```

On Linux-based CI or servers:

```bash
sh scripts/backup-database.sh
```

## Vercel Deployment

### Vercel Project Settings

- Project root / root directory: `ai-travel-planner`
- Framework preset: `Next.js`
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `.next`
- Local dev command: `npm run dev -- -p 3001`

### Deploy Steps

1. Push only the `ai-travel-planner` project to the selected repository, or set Vercel root directory to `ai-travel-planner`.
2. Add PostgreSQL provider such as Vercel Postgres, Neon or Supabase Postgres.
3. Add all production env vars from `.env.example` and `PUBLIC_LAUNCH.md`.
4. Run migrations before or during release:

```bash
npm run prisma:migrate
```

5. Deploy with build command `npm run build`.
6. Configure Stripe webhook:

```text
https://YOUR_DOMAIN/api/billing/webhook
```

7. Configure cron for:

```text
GET /jobs/price-recheck
Authorization: Bearer CRON_SECRET
```

## Railway Deployment

1. Create Railway project.
2. Add PostgreSQL.
3. Add Redis.
4. Use Dockerfile deployment.
5. Set env vars.
6. Run migrations:

```bash
npm run prisma:migrate
```

## Docker Compose

```bash
docker compose up --build
```

Services:

- `web` on `3001`.
- `postgres` on `5432`.
- `redis` on `6379`.

## Production Architecture Diagram

```text
Browser / PWA
  |
  v
Next.js 15 App Router
  |-- UI: Search, AI Agent, Pricing, Dashboard, Admin
  |-- API: /api/search, /api/ai/*, /api/billing/*, /api/affiliate/*
  |
  +--> Amadeus API
  +--> OpenAI API
  +--> Stripe
  +--> Resend
  +--> Sentry
  +--> PostHog
  |
  v
Prisma ORM
  |
  v
PostgreSQL
  |
  v
Redis / Queue-ready layer
```

## Rollback

1. Revert latest deployment in Vercel/Railway.
2. Disable Stripe webhook if payment events are failing.
3. Set `OPENAI_API_KEY` empty to force AI fallback.
4. Set Amadeus env empty to force mock search fallback.
5. Keep `DATABASE_URL` untouched unless database migration caused the incident.
