# Incident Response

## Severity Levels

| Severity | Example | Response |
| --- | --- | --- |
| SEV1 | App unavailable, auth broken, payment charge failures | Enable maintenance mode, page owner, update users |
| SEV2 | AI route failing, Amadeus outage, degraded search | Disable feature flag, use fallback, monitor |
| SEV3 | Email delays, affiliate tracking delay, analytics issue | Log issue, fix during business hours |

## First 10 Minutes

1. Check `/api/health`.
2. Check provider dashboards: Vercel/Railway, Postgres, Upstash, OpenAI, Stripe, Amadeus.
3. Check Sentry for the first error and release version.
4. If user impact is high, set `MAINTENANCE_MODE=true`.
5. If only one system fails, use feature flags:
   - `FEATURE_AI_ENABLED=false`
   - `FEATURE_PAYMENTS_ENABLED=false`
   - `FEATURE_AFFILIATE_LINKS_ENABLED=false`

## Communication

- Public beta users: short email/status note within 30 minutes for SEV1.
- Internal note should include:
  - start time
  - affected routes
  - affected users
  - mitigation
  - owner

## Recovery

1. Confirm health checks are green.
2. Re-enable feature flags one by one.
3. Review Sentry for recurring errors.
4. Confirm Stripe webhooks if payments were affected.
5. Write a short post-incident summary.

## Rollback

- Revert to the previous Vercel deployment.
- Keep `WAITLIST_MODE=true` if signup volume is unsafe.
- Restore database only if data corruption is confirmed.

## Database Backup And Restore

Create a backup:

```bash
npm run backup:db
```

Linux/macOS alternative:

```bash
sh scripts/backup-database.sh
```

Restore with PostgreSQL tools:

```bash
pg_restore --clean --if-exists --no-owner --dbname "$DATABASE_URL" backups/trippilot-YYYYMMDD-HHMMSS.dump
```

Always test restore on a staging database before touching production.
