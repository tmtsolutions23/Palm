# OPERATIONS.md

Operational runbook for Palm Reader. Read this when something is on fire, before paging anyone.

## Dashboards (bookmark all five)

| What | Where |
|---|---|
| Live errors | Sentry → palmreader-mobile, palmreader-backend |
| User behavior | PostHog → "Palm Reader" project |
| Subscription state | RevenueCat dashboard → Charts + Customer Lookup |
| API health + cron | Vercel dashboard → Functions + Cron logs |
| Database health | Supabase dashboard → Reports + Logs |

## Standard incident triage (5 minutes)

1. **Sentry**: any error spike in the last hour? Group by release.
2. **Vercel**: any function with >1% error rate or >P95 latency spike?
3. **Supabase**: any DB connection saturation or slow queries (`pg_stat_activity`)?
4. **RevenueCat**: webhook delivery success rate? (Bad webhooks = subscription state drift.)
5. **Anthropic status**: status.anthropic.com — vision API outage means readings 5xx.

## Common incidents and runbooks

### "Readings are 5xx-ing"
1. Check Sentry for the error code surfacing.
2. If `ai_parse_error`: Claude returned malformed JSON. Likely a prompt regression; revert the most recent `backend/lib/prompts/reading.ts` change.
3. If `storage_error`: photo download from Supabase Storage failing. Check Supabase status + bucket existence.
4. If 504 / timeout: vision call exceeded `maxDuration = 60`. Either Anthropic is slow or photo is too large. Check Anthropic status.
5. **Mitigation lever**: temporarily lower `ANTHROPIC_MODEL_VISION` to `claude-haiku-4-5-20251001` via env (faster, cheaper, lower quality). Re-deploy.

### "Subscription state is wrong for a user"
Truth lives in **two places**: RevenueCat (canonical) and `profiles.subscription_status` (cache).
1. Look up user in RevenueCat dashboard by Supabase `user.id`.
2. If RC shows correct state but our DB is wrong → webhook didn't land. Re-fire from RevenueCat dashboard ("Resend last event") or replay from `subscription_events`.
3. If RC also shows wrong state → user dispute. Refund via App Store Connect / Play Console. Document.

### "Cron stopped firing"
1. Vercel dashboard → Crons. Confirm last run timestamp.
2. If last run was an error: open the function log. Most common: Anthropic API rate limit on the daily-insight loop.
3. Re-run manually: `curl -X GET https://api.palmreader.app/api/cron/daily-insights -H "Authorization: Bearer $CRON_SECRET"`.

### "Apple Sign In broken"
1. Check Supabase dashboard → Auth → Providers → Apple. Has the .p8 key expired? (Apple keys live 6 months max.)
2. Check Apple Developer → Certificates, IDs & Profiles → Keys. Generate a new one if expired.
3. If Apple itself is down (rare): check status.apple.com. Email sign-in still works.

### "User can't restore purchases"
1. Confirm they're signed in with the same Apple ID / Google account that bought the subscription.
2. RevenueCat → "Restore" call. If RC shows the entitlement, our DB will be updated on next webhook tick.
3. Manual override: update `profiles.subscription_status` in Supabase SQL editor. Note in `subscription_events` with `event_type = 'manual_override'`.

### "Spike in Claude costs"
1. Query: `select date_trunc('day', created_at) d, sum(cost_usd) from readings group by 1 order by 1 desc limit 14;`
2. Identify the spike day. Was there an organic content moment (TikTok virality)?
3. If a single user is the cause (abuse): add their `user_id` to a temporary deny list in code, deploy, then DM them.
4. **Sustained mitigation**: enable prompt caching (already on), shorten max_tokens, swap to Haiku for low-LTV cohorts.

### "Database connections exhausted"
Supabase Postgres has connection limits per plan. Symptoms: API 5xx with "too many connections".
1. Use the Supabase **pooler URL** (`db.YOUR_PROJECT.pooler.supabase.com`) in `SUPABASE_URL` — the standard URL is direct connections.
2. Reduce concurrency by lowering `maxDuration` on long-running routes.
3. Upgrade Supabase plan.

## Deploys

### Backend (Vercel)
- **Preview**: every push to a PR → preview URL automatically.
- **Production**: merge to `main` → auto-deploy. Or `vercel --prod` from local.
- **Rollback**: Vercel dashboard → Deployments → "Promote to Production" on a known-good deploy. Takes ~10s.

### Mobile (EAS)
- **OTA update (JS-only changes)**: `eas update --branch production --message "..."` ships to all installed users in <5 min, no review.
- **Native binary update**: `eas build --profile production --platform all`, then `eas submit -p ios -p android`. App Store: ~24h review. Play: ~2h.
- **Rollback an OTA update**: `eas update --branch production --rollback-to-embedded` reverts to the binary version.
- **Rollback a binary**: re-submit the previous binary's version with a higher build number.

## On-call rotation

For a solo founder: you are on-call. Set up alerts:
- Sentry: page on >10 events/min in production.
- Vercel: page on production deployment failure.
- RevenueCat: email on webhook failures.
- UptimeRobot (or BetterStack) hitting `/api/health` every minute.

When you scale to a team: rotate weekly via Opsgenie or PagerDuty.

## Capacity planning checkpoints

| Active paying users | Required upgrade |
|---|---|
| ~1,000 | Move rate limiter to Upstash (env vars). Verify Vercel Pro. |
| ~5,000 | Daily-insight cron → queue (Inngest/QStash) for parallelism. Per-timezone scheduling. |
| ~10,000 | Supabase Pro + connection pooler. Photo storage TTL job. CDN for share-card images. |
| ~50,000 | Multi-region read replicas. Background workers for share-card generation. Cost telemetry dashboard. |
| ~100,000 | Dedicated DBA review. Real DR + multi-region failover. Internal admin dashboard. |

## Backups & recovery

- Supabase: daily automated PITR backups on Pro plan. Retention 7 days (Pro) or 14 days (Team).
- Practice a recovery: `supabase db dump` once a quarter. Verify the dump restores into a scratch project.
- App: source of truth is the GitHub repo. EAS retains all built binaries for 30 days; export important release manifests yourself.

## Data deletion (GDPR / CCPA)

- Self-serve: Settings → Delete account → calls `DELETE /api/account`. Hard-deletes auth user (cascades to all owned rows) plus storage bytes.
- Manual: same effect via Supabase admin → delete user.
- Subscription cancellation is the user's job (App Store / Play Store), per platform policy. Document this in the deletion confirmation copy.

## Customer support

- Inbox: hello@palmreader.app — forward to founder for MVP.
- For "I can't restore" issues, ask for the email associated with the App Store / Play account. Cross-reference in RevenueCat by `app_user_id` (= Supabase `user.id`).
- For "my reading is wrong" complaints: it's entertainment. Apologize, offer a free reading credit by manually decrementing `free_readings_used` to 0 in Supabase.

## Secrets rotation

| Secret | Rotation cadence | How |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yearly or on incident | Anthropic console → new key → update Vercel env → redeploy → revoke old |
| `SUPABASE_SERVICE_ROLE_KEY` | Yearly | Supabase dashboard → reset → update Vercel env → redeploy |
| `CRON_SECRET` | On any team change | Generate via `openssl rand -hex 32` → update Vercel env → redeploy |
| `REVENUECAT_WEBHOOK_AUTH` | On incident | RevenueCat dashboard → set new auth → update Vercel env |
| Apple `.p8` key | Apple forces 6-month rotation | Apple Developer → Keys → new → update Supabase Auth provider config |
