# Security Checklist

## Before Public Beta

- [ ] Set `NEXTAUTH_SECRET` to a strong production-only value.
- [ ] Set `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to the production domain.
- [ ] Store all secrets in Vercel/Railway environment variables, never in Git.
- [ ] Enable Google OAuth production redirect URLs.
- [ ] Configure Stripe webhook signing with `STRIPE_WEBHOOK_SECRET`.
- [ ] Configure Sentry DSN and alerts for API failures.
- [ ] Configure PostHog privacy settings and data retention.
- [ ] Keep `WAITLIST_MODE=true` until payments, auth and monitoring are verified.
- [ ] Use `FEATURE_AI_ENABLED=false` if OpenAI budget controls are not ready.
- [ ] Use `FEATURE_PAYMENTS_ENABLED=false` until Stripe live mode is tested.
- [ ] Use `FEATURE_AFFILIATE_LINKS_ENABLED=false` until provider terms are approved.

## API Protection

- [ ] Keep CSRF origin checks enabled in `src/middleware.ts`.
- [ ] Keep AI bot protection enabled.
- [ ] Review rate limits for `/api/search`, `/api/ai/*`, billing and affiliate routes.
- [ ] Do not expose OpenAI, Stripe, Amadeus or database credentials to client bundles.
- [ ] Validate all request bodies with Zod before calling external providers.

## Data Protection

- [ ] Confirm Prisma models do not store raw payment card data.
- [ ] Store only required affiliate metadata.
- [ ] Add a user data export/delete workflow before a larger EU launch.
- [ ] Run database backups daily during beta and before each migration.
- [ ] Test restore from backup at least once before launch.

## Operational Checks

- [ ] Run `npm run verify:production`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Confirm `/api/health` returns `ok` or expected `skipped` checks.
- [ ] Confirm `/api/health/db`, `/api/health/ai`, `/api/health/payments`.
- [ ] Confirm maintenance mode returns a friendly page.
- [ ] Confirm waitlist mode blocks app routes and accepts emails.
