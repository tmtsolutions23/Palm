     1|File unchanged since last read. The content from the earlier read_file result in this conversation is still current — refer to that instead of re-reading.
     2|
     3|## GLM branch additions (scalability & manageability)
     4|
     5|### shared/ package
     6|Type-safe API contract layer. Both mobile + backend import Zod schemas from `shared/src/schemas.ts`:
     7|- `CreateReadingRequest`, `ReadingResponse`, `ReadingListResponse`
     8|- `CreateCompatibilityRequest`
     9|- `UpdateProfileRequest`
    10|- `DailyInsightResponse`, `ErrorResponse`
    11|
    12|**Rule**: never define API request/response shapes in mobile or backend directly — always import from `@palm/shared`. This prevents type drift as the app scales.
    13|
    14|### Rate limiting
    15|Production uses **Upstash Redis** (`UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`). Falls back to in-memory limiter in dev (when env vars are missing). If Upstash is down, the limiter fails open (logs error, allows request) — never block users on infra failure.
    16|
    17|### Env validation
    18|- Backend: `lib/env/backend.ts` — `validateBackendEnv()` fails fast on missing required vars
    19|- Mobile: `lib/env/mobile.ts` — `validateMobileEnv()` warns but doesn't throw (dev-friendly)
    20|
    21|### Error Boundary
    22|`mobile/components/ErrorBoundary.tsx` wraps the entire app root. Catches rendering crashes → friendly "Try again" screen instead of red box of death. Reports to PostHog + Sentry.
    23|
    24|### Daily insight cron pagination
    25|Batches of 100 users via cursor-based pagination. Caps at 5000 users per run. If you exceed 5K subs, migrate to a queue fan-out (Inngest, QStash).
    26|
    27|### Performance indexes
    28|Migration `20260427000008_performance_indexes.sql` adds indexes for:
    29|- `daily_insights(user_id, for_date)`
    30|- `compatibility_readings(owner_user_id, created_at desc)`
    31|- `readings(user_id, reading_type, created_at desc)`
    32|- `palm_photos(user_id, uploaded_at desc)`
    33|