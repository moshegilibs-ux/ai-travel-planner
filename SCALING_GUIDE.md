# Scaling Guide

## Current Beta Architecture

```text
Browser / PWA
  -> Next.js App Router
  -> API Routes
      -> OpenAI
      -> Amadeus
      -> Stripe
      -> Resend
      -> PostHog
      -> Sentry
  -> Prisma
  -> PostgreSQL
  -> Upstash Redis
```

## First Scaling Targets

1. **Search APIs**
   - Cache repeated Amadeus searches in Redis.
   - Keep mock fallback enabled for provider downtime.
   - Add stricter rate limits for anonymous users.

2. **AI Assistant**
   - Cache repeated prompts.
   - Cap prompt length and history length.
   - Use `FEATURE_AI_ENABLED=false` during budget incidents.
   - Track token usage per user before expanding free limits.

3. **Database**
   - Add indexes for high-volume reads:
     - `SavedTrip.userId`
     - `SearchHistory.userId`
     - `FavoriteHotel.userId`
     - `FavoriteFlight.userId`
   - Run daily backups and weekly restore drills.
   - Move long-running analytics to a warehouse after beta.

4. **Background Jobs**
   - Move `/jobs/price-recheck` to a scheduled queue.
   - Use Redis-backed queues for price alerts and emails.
   - Keep idempotency keys for all notifications.

5. **Deployment**
   - Start with Vercel + managed Postgres + Upstash.
   - Move API-heavy workloads to Railway/Fly workers if search volume grows.
   - Split AI tooling into a dedicated service only after clear latency pressure.

## Cache Policy

- SEO destination pages: `s-maxage=3600`, `stale-while-revalidate=86400`.
- Health checks: `no-store`.
- Search responses: short Redis TTL, usually 5-15 minutes.
- AI responses: prompt hash cache for repeated demo queries.

## Capacity Milestones

| Stage | Users | Action |
| --- | ---: | --- |
| Private beta | 0-100 | Logs, health checks, manual alerts |
| Public beta | 100-1,000 | Redis cache, Sentry alerts, daily backups |
| Growth | 1,000-10,000 | Queue workers, stronger rate limits, DB indexes |
| Scale | 10,000+ | Separate AI/search services, warehouse analytics |
