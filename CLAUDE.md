# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Palm Reader — a paid mobile app (iOS + Android) that uses AI vision to analyze palm photos and deliver personalized palmistry readings, daily insights, and compatibility readings. Subscription monetization via RevenueCat. See `APP_BLUEPRINT.md` for the full product spec.

## Repository layout

This is a multi-package monorepo (no workspace tooling — packages are independent installs):

- `mobile/` — Expo React Native app (SDK 51+, TypeScript, Expo Router file-based routing)
- `backend/` — Next.js 16 API (App Router, deployed to Vercel) with Anthropic Claude vision integration
- `shared/` — Zod schemas for type-safe API contracts between mobile and backend (`@palm/shared`)
- `supabase/migrations/` — SQL migrations (timestamped). Apply with the Supabase CLI; never edit applied migrations.
- `APP_BLUEPRINT.md` — product/business/architecture spec; the source of truth when scope decisions arise
- `TASKS.md` — week-by-week build plan with deployable milestones

## Commands

### Mobile (`cd mobile`)
- `npm install` — install deps
- `npx expo start` — dev server (Expo Go for quick iteration; use a dev build for camera/IAP testing)
- `npx expo run:ios` / `npx expo run:android` — native builds locally
- `eas build --profile development --platform ios` — cloud dev build (required for RevenueCat + camera in production-mode)
- `eas build --profile production --platform all` — store-ready build
- `eas submit -p ios` / `eas submit -p android` — submit to stores
- `npx tsc --noEmit` — type-check
- `npm test` — Jest smoke tests

### Backend (`cd backend`)
- `npm install`
- `npm run dev` — Next.js dev server on :3000
- `npm run build && npm start` — production-mode locally
- `npm run lint` — ESLint
- `npx tsc --noEmit` — type-check
- `npm test` — Vitest smoke tests
- `vercel --prod` — deploy production (preview is automatic via Vercel GitHub integration)

### Supabase (root)
- `npx supabase start` — local Supabase (Docker required)
- `npx supabase db push` — apply migrations to linked project
- `npx supabase db reset` — recreate local DB from migrations + seed
- `npx supabase gen types typescript --linked > backend/lib/database.types.ts` — regenerate typed schema after migration changes

## Architecture (the parts that need multiple files to understand)

### Reading generation pipeline
1. Mobile captures palm photo via `expo-camera` with overlay-guided composition (`mobile/app/reading/capture.tsx`)
2. Photo uploads to Supabase Storage `palms` bucket via signed upload (`mobile/lib/api.ts:uploadPalmPhoto`)
3. Mobile calls `POST /api/readings` with `photo_id` + `hand`
4. Backend (`backend/app/api/readings/route.ts`):
   - Verifies Supabase JWT → loads user
   - Checks subscription_status — gates 2nd+ free reading with HTTP 402
   - Loads photo from Storage as base64
   - Calls Claude Sonnet 4.6 vision via Vercel AI SDK with the prompt in `backend/lib/prompts/reading.ts` (uses prompt caching on the system prompt)
   - Persists `readings` row with structured `lines_jsonb` + `summary`
   - Triggers shareable image generation
5. Mobile renders 4-section result card

The Claude prompt is structured with `<system>` + `<user>` parts where the system prompt is cacheable (saves ~40% on cost/latency for repeat readings). Update prompts only in `backend/lib/prompts/` — never inline.

### Auth flow
Supabase Auth handles sessions. Apple Sign In is required by App Store policy when other social logins exist. The `/api/auth/apple` endpoint server-side verifies the Apple identity token, exchanges it for a Supabase session, and the mobile client stores the JWT via `expo-secure-store`. Email magic link is the fallback for Android primary use.

### Subscription gating
Source of truth: `profiles.subscription_status` updated by RevenueCat webhook (`/api/webhooks/revenuecat`). Mobile reads it via `useSubscription` hook + RevenueCat SDK as a secondary check. Always verify server-side — never trust the mobile RC SDK alone for paid feature gating.

Free tier: exactly 1 lifetime full reading, plus the ability to view past readings. Paywall fires server-side on the 2nd POST to `/api/readings` if `subscription_status` is `free`.

### Daily insights generation
Vercel Cron runs `/api/cron/daily-insights` at 03:00 UTC nightly. It paginates active subscribers, generates a personalized insight via Claude Haiku 4.5 (cheaper for this volume), inserts into `daily_insights`, and queues an Expo push at the user's `daily_insight_time` in their `timezone`. Failures are logged to Sentry but never block other users.

### Row-Level Security
Every table has RLS enabled. The pattern: user JWT → `auth.uid()` matches `user_id` on the row. Backend uses the `service_role` key to bypass RLS for cross-user operations (webhooks, cron). **Never expose the service_role key to the mobile client.**

## Conventions

- TypeScript strict mode on both packages
- Prompts live in `backend/lib/prompts/`. Never inline a Claude prompt in a route handler
- API routes return `{ error: 'snake_case_code', message: 'human readable' }` on failure
- All times stored as `timestamptz` in Postgres; convert to user `timezone` only at render time
- Photos in Supabase Storage are private; mobile fetches via signed URLs (max 1h TTL)
- Mobile screens use Expo Router; do not introduce React Navigation manually
- Theme tokens live in `mobile/constants/theme.ts` — no hardcoded colors in components

## Scaling guardrails

These are the design choices that make the app survive growth without rewrites. Don't break them without thinking carefully.

- **Rate limiter is pluggable.** `backend/lib/rate-limit.ts` uses Upstash Redis when `UPSTASH_REDIS_REST_URL` + `_TOKEN` are set, otherwise falls back to per-instance memory. The fallback exists for dev only — production must run with Upstash configured. Per-instance memory does not work across Vercel function instances.
- **Cron is paginated, not single-shot.** The daily-insights cron iterates `profiles` in pages of 200 and pushes in chunks of 100. Beyond ~5K paying users, replace the in-line for-loop with a queue (Inngest / QStash / Supabase Edge cron + workers) for parallel fan-out. Architecture is intentionally stop-and-replace at that threshold rather than gradually scaled.
- **Writes are CAS-guarded.** The free-quota increment in `POST /api/readings` uses optimistic concurrency (`.eq("free_readings_used", current_value)`) so concurrent reads can't both increment past the limit.
- **Backend is stateless.** No in-memory caches that affect correctness. Anything stateful goes in Supabase or Upstash.
- **Photos are private.** Always served via signed URLs with short TTL. The `palms` bucket has RLS enforcing folder-prefix-by-user-id.
- **Cost is logged per row.** `readings.cost_usd` and `readings.input_tokens` / `output_tokens` exist for cost forecasting and abuse detection. Always populate these.
- **Subscription state has a single source of truth (RevenueCat) and a derived cache (`profiles.subscription_status`).** Update the cache only via the webhook. Never let the mobile RC SDK be the only check for paid features — backend always re-checks.
- **Push tokens that fail with `DeviceNotRegistered` are auto-cleared.** Don't accumulate dead tokens; the cron handles this.
- **CI runs on every PR.** `.github/workflows/ci.yml` runs typecheck on backend + mobile and SQL lint on migrations. Do not merge red.
- **Account deletion is wired (Apple guideline 5.1.1(v)).** `DELETE /api/account` cascades through auth.users → all owned tables → storage bytes. Verify ON DELETE CASCADE on every new FK.

## Capacity checkpoints

See [OPERATIONS.md](./OPERATIONS.md#capacity-planning-checkpoints) for the table of "what to upgrade when". Summary: in-memory limiter dies at ~1K paying users, single-shot cron dies at ~5K, single-region DB starts to feel hot at ~10K.

## Things to be careful about

- **App Store guideline 4.8**: if you add Google Sign In, Apple Sign In must be visually equal/prior. Currently we ship Apple + email only.
- **App Store guideline 1.4.1**: palm reading is "fortune-telling" — keep marketing copy framed as entertainment; ensure ToS disclaims medical/financial/legal advice.
- **Photo retention**: users expect that deleting a reading deletes the photo. Storage cleanup is wired into the `DELETE /api/readings/:id` route.
- **Costs**: Claude vision calls are the dominant cost. Always use prompt caching, prefer Haiku for daily insights, and keep the `model_version` column populated for cost analytics.
