# טיולים וחלומות Public Beta Launch

## Public Beta Goal

Ship a stable AI travel SaaS for early real users with monitored search, AI planning, subscriptions, affiliate tracking and core legal coverage.

## Launch Checklist

- [ ] Configure production `DATABASE_URL`.
- [ ] Run `npm run prisma:migrate`.
- [ ] Configure `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, Google OAuth credentials.
- [ ] Configure Amadeus production or test credentials.
- [ ] Configure `OPENAI_API_KEY`.
- [ ] Configure Sentry DSN.
- [ ] Configure PostHog keys.
- [ ] Configure Resend sender domain.
- [ ] Configure Stripe products and price IDs.
- [ ] Configure Stripe webhook endpoint: `/api/billing/webhook`.
- [ ] Configure `CRON_SECRET` and scheduled price re-check job.
- [ ] Run `npm run verify:production`.
- [ ] Check `/api/health`, `/api/health/db`, `/api/health/ai`, `/api/health/payments`.
- [ ] Confirm feature flags are set for launch mode.
- [ ] Review `/privacy` and `/terms` with legal counsel.
- [ ] Test checkout, login, search, AI chat and affiliate redirects.
- [ ] Verify mobile PWA install prompt.
- [ ] Verify `http://localhost:3001` locally before deploy.

## Investor Demo Mode

Use the app without production keys:

- Search uses Amadeus when configured, otherwise mock fallback.
- AI agent uses OpenAI when configured, otherwise deterministic fallback.
- Billing page shows plans and checkout returns to pricing if Stripe is not configured.
- Saved trips use localStorage unless auth + database are configured.

Suggested demo flow:

1. Open `/`.
2. Ask the AI assistant: `I want a cheap 5-day trip to Greece in August`.
3. Go to `/search`.
4. Use filters and click `Optimize my trip`.
5. Save a trip and click `Track Price`.
6. Open `/pricing`.
7. Open `/dashboard` and `/admin`.

## Sample Demo Accounts

Create these accounts in Google OAuth / database for demos:

- `demo-free@trippilot.ai` - Free plan traveler.
- `demo-pro@trippilot.ai` - Pro plan traveler with saved trips.
- `demo-admin@trippilot.ai` - Internal operator demo.

## Production Env Checklist

```env
DATABASE_URL=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
AMADEUS_API_KEY=
AMADEUS_API_SECRET=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRO_PRICE_ID=
STRIPE_PREMIUM_PRICE_ID=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_DSN=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
POSTHOG_API_KEY=
POSTHOG_HOST=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
CRON_SECRET=
NEXT_PUBLIC_APP_URL=
AFFILIATE_ID=
FEATURE_AI_ENABLED=true
FEATURE_PAYMENTS_ENABLED=true
FEATURE_AFFILIATE_LINKS_ENABLED=true
WAITLIST_MODE=false
MAINTENANCE_MODE=false
NEXT_PUBLIC_ONBOARDING_MODE=true
```

## Final Go/No-Go Commands

```bash
npm run verify:production
npm run lint
npm run build
```

## Estimated Monthly Infrastructure Costs

Small public beta, 1k-5k monthly active users:

- Vercel Pro: $20/month.
- Vercel Postgres / Neon starter: $0-$25/month.
- Upstash Redis starter: $0-$10/month.
- Sentry team starter: $0-$26/month.
- PostHog: $0-$50/month depending event volume.
- Resend: $0-$20/month for early email volume.
- OpenAI: $20-$200/month depending AI chat usage.
- Amadeus: usually free/test until production/commercial agreement.
- Stripe: no monthly fee, transaction/subscription processing fees.

Estimated beta total: **$40-$350/month** before meaningful traffic.

## Weak Points To Watch

- Legal pages are structured but need lawyer review.
- Admin authorization should be restricted by role before public admin access.
- Email queues are architected but not backed by a worker yet.
- Price re-check is a scheduled endpoint scaffold; production needs a cron runner.
- Usage limits are modeled but enforcement should be expanded per plan.
