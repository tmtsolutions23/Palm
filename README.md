# Palm Reader

Palm Reader is an AI-powered mobile product that turns a palm photo into a personalized reading, recurring daily insights, and premium compatibility reports.

This repo is now staged so the **next major phase is mobile app implementation**. The backend, pricing, legal surface, and production guardrails are in place first.

## Core docs
- [`APP_BLUEPRINT.md`](./APP_BLUEPRINT.md) — full product + architecture spec
- [`TASKS.md`](./TASKS.md) — working task list
- [`OPERATIONS.md`](./OPERATIONS.md) — runbook for incidents and deploys
- [`docs/production-sprint.md`](./docs/production-sprint.md) — what was finished before mobile build-out

## Current launch posture
- **Free:** 1 curated demo reading, no free-tier AI cost
- **Paid:** real AI readings, compatibility, recurring insights
- **Weekly:** $7.99/week, no trial
- **Annual:** $39.99/year, 3-day trial, default selected
- **Lifetime:** $99.99 one-time

## Stack
- **Mobile:** Expo + React Native + TypeScript + Expo Router
- **Backend:** Next.js on Vercel
- **AI:** Anthropic Claude Sonnet 4.6 (vision) + Claude Haiku 4.5 (daily insights)
- **Database / Auth / Storage:** Supabase
- **Billing:** RevenueCat
- **Analytics:** PostHog
- **Errors:** Sentry
- **Push:** Expo Push
- **Email:** Resend

## Production-ready backend pieces
- account deletion API for App Store compliance
- reading + compatibility generation endpoints
- list/detail/delete APIs for reading history
- daily insight cron with 2-day cache logic
- health endpoint at `/api/health`
- RevenueCat webhook receiver
- support, privacy, terms, and refund pages on the backend domain

## Repo structure
```text
.
├── backend/                   # Next.js backend + lightweight marketing/legal pages
├── mobile/                    # Expo React Native app (not the current sprint focus)
├── shared/                    # Shared schemas/types
├── supabase/                  # SQL migrations
├── docs/production-sprint.md  # handoff to mobile-build phase
├── APP_BLUEPRINT.md
├── TASKS.md
└── OPERATIONS.md
```

## Local setup

### 1) Infrastructure
```bash
npx supabase link --project-ref <your-ref>
npx supabase db push
```

### 2) Backend
```bash
cd backend
npm install
npm run dev
```

### 3) Mobile
```bash
cd mobile
npm install
npx expo start
```

## Required backend env
Minimum server env expected by the production backend:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`
- `REVENUECAT_WEBHOOK_AUTH`
- `CRON_SECRET`

Optional but recommended:
- `REVENUECAT_LIFETIME_PRODUCT_IDS` — comma-separated exact SKU allowlist for lifetime purchases
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `SENTRY_*`
- `RESEND_*`

## Deploy targets
- **Backend:** Vercel
- **Database/Auth/Storage:** Supabase
- **Purchases:** RevenueCat + App Store / Play Console

## What remains before launch
Mostly mobile:
- build the native app flows
- wire purchase UX and restore purchases
- wire camera/upload UX
- wire notifications + store submission assets

Everything else should now be much closer to production shape.
