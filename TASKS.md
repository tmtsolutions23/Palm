# TASKS.md — Week-by-Week Build Plan

Each week ends with a deployable milestone. Day estimates are conservative for a single full-time founder/dev.

---

## Week 1 — Foundations & Skeleton (Deployable: Internal TestFlight)

### Day 1 — Tooling
- [ ] Create Apple Developer + Google Play Console accounts (allow 2 days for Apple verification)
- [ ] Create Supabase project (region: us-east-1)
- [ ] Create Vercel project, link GitHub repo
- [ ] Provision Anthropic API key, RevenueCat, Sentry, PostHog, Resend accounts
- [ ] Initialize Expo project in `mobile/`, EAS configured

### Day 2 — Database
- [ ] Apply all migrations in `supabase/migrations/` to project
- [ ] Verify RLS policies in Supabase dashboard (`profiles`, `readings`, etc.)
- [ ] Generate typed schema: `npx supabase gen types typescript --linked > backend/lib/database.types.ts`
- [ ] Create `palms` storage bucket (private)

### Day 3 — Auth (mobile + backend)
- [ ] Apple Sign In configured in Apple Developer + Supabase
- [ ] `mobile/app/onboarding/auth.tsx` working: Apple + email magic link
- [ ] Backend `/api/auth/apple` verifying Apple identity token
- [ ] Test session persistence via `expo-secure-store`

### Day 4 — Camera & upload
- [ ] `mobile/app/reading/capture.tsx` with `expo-camera` + palm overlay
- [ ] Photo upload to Supabase Storage with signed URL flow
- [ ] Photo quality gate (rough: file size + Claude pre-check)

### Day 5 — Reading endpoint (hardcoded result)
- [ ] `POST /api/readings` returns canned reading (no Claude yet)
- [ ] Mobile result screen renders 4 line cards + summary
- [ ] Reading saved to `readings` table

### Day 6 — Home & navigation
- [ ] Tab layout: Home, History, Settings
- [ ] Home shows last reading + "New Reading" CTA
- [ ] Onboarding 3-card swipe flow

### Day 7 — Polish + TestFlight
- [ ] App icons, splash screen
- [ ] EAS build → TestFlight internal
- [ ] **MILESTONE**: invite 3 people to TestFlight; they can sign up + take a reading

---

## Week 2 — Real AI + Paywall (Deployable: Closed beta with sandbox subscriptions)

### Day 8–9 — Claude integration
- [ ] `backend/lib/claude.ts` calling Sonnet 4.6 vision
- [ ] System prompt with prompt caching enabled
- [ ] Structured output via Vercel AI SDK `generateObject` with reading schema
- [ ] Iterate prompt with 20+ test palm photos until reading quality is consistently strong
- [ ] Cost telemetry per reading logged

### Day 10 — Photo quality gate
- [ ] Reject photos missing palm (separate cheap Claude call returning yes/no)
- [ ] Mobile retry flow with examples of good/bad photos

### Day 11 — RevenueCat
- [ ] Create products in App Store Connect: weekly $7.99, annual $39.99, lifetime $79.99
- [ ] Mirror in Google Play Console
- [ ] RevenueCat offerings configured
- [ ] Mobile paywall screen built (`mobile/app/paywall.tsx`) — annual selected by default, restore button visible
- [ ] Free user gating: server-side 402 on 2nd reading
- [ ] Webhook `/api/webhooks/revenuecat` updating `profiles.subscription_status`

### Day 12 — History
- [ ] `GET /api/readings` paginated
- [ ] History list screen
- [ ] History detail screen
- [ ] Delete reading with photo cleanup

### Day 13 — Observability
- [ ] Sentry RN + Next.js wired with sourcemaps
- [ ] PostHog SDK on both, event taxonomy implemented (see `mobile/lib/analytics.ts`)
- [ ] Error states tested (network down, Claude failure, expired session)

### Day 14 — Deploy
- [ ] EAS production build → TestFlight
- [ ] Backend deployed to Vercel production
- [ ] **MILESTONE**: 5 beta testers complete trial → paid in sandbox; cost-per-reading measured

---

## Week 3 — Engagement & Moat Features (Deployable: Open beta + ASO ready)

### Day 15–16 — Compatibility
- [ ] `mobile/app/compatibility/capture.tsx` — two-photo flow
- [ ] `POST /api/compatibility` with combined Claude prompt
- [ ] Result screen with shareable two-person card
- [ ] Pro-only gating

### Day 17 — Daily insights
- [ ] Vercel Cron `/api/cron/daily-insights` running nightly at 03:00 UTC
- [ ] Per-user insight generation via Haiku 4.5
- [ ] `daily_insights` rows inserted with delivery time
- [ ] Expo Push delivery at user's local `daily_insight_time`

### Day 18 — Share cards
- [ ] `POST /api/share-card` generating PNG (Vercel OG image route)
- [ ] One-tap share from reading result
- [ ] Watermark + brand styling

### Day 19 — Settings & legal
- [ ] Settings: subscription mgmt deeplink (Apple/Google), notification time, signout, support email
- [ ] In-app links to ToS, Privacy, Refund Policy hosted on landing
- [ ] Account deletion flow (App Store guideline 5.1.1(v) requires this)

### Day 20 — Onboarding polish
- [ ] Onboarding animations + copy iteration
- [ ] First-reading CTA prominence tested
- [ ] Permission prompts framed for high acceptance

### Day 21 — Soft launch prep
- [ ] App Store screenshots (6 sizes), preview video
- [ ] Google Play assets
- [ ] Keywords + listing copy iterated
- [ ] **MILESTONE**: app approved + soft-launched in NZ/AU/CA

---

## Week 4 — Launch (Milestone: public launch)

### Day 22–23 — Soft launch iteration
- [ ] Run TikTok ads to NZ/AU/CA → measure paywall conversion
- [ ] Iterate paywall copy/pricing based on data
- [ ] Fix bugs surfaced from real users

### Day 24 — Distribution prep
- [ ] 30 days of TikTok content batched
- [ ] Instagram Reels mirror queued
- [ ] Product Hunt launch scheduled
- [ ] Indie Hackers + X build-in-public threads drafted
- [ ] Reddit value-posts drafted (r/Palmistry, r/Astrology)

### Day 25 — Launch infrastructure
- [ ] Landing page live at palmreader.app with App Store + Play Store badges
- [ ] Transactional emails: welcome, receipt, trial-ending, churn-save
- [ ] Customer support routing: hello@palmreader.app
- [ ] DNS verified: apex, api., cdn.

### Day 26 — Final QA
- [ ] Full regression on iOS (3 devices) + Android (3 devices)
- [ ] Apple Sign In edge cases (existing Apple account, hidden email relay)
- [ ] Subscription flows: trial start, trial-to-paid, restore, cancel, billing issue
- [ ] Photo edge cases: no palm, dark, blurry, hand-back, two hands

### Day 27 — Public launch
- [ ] Push to App Store + Play Store production
- [ ] Product Hunt go-live (Tuesday)
- [ ] X / IH threads posted
- [ ] TikTok content live
- [ ] Monitor PostHog / Sentry / RevenueCat dashboards in real time

### Day 28 — Post-launch
- [ ] Respond to reviews (App Store + Play)
- [ ] Capture feedback into prioritized backlog
- [ ] Plan Week 5+ based on conversion data
- [ ] **MILESTONE**: live in App Store + Play Store, paying users on production

---

## Week 5 — Operational Hardening (after first 100 paying users)

When you cross ~$1K MRR, spend a week making the app boring to operate:

- [ ] Provision Upstash Redis (free tier is enough at this stage); set `UPSTASH_REDIS_REST_URL` + `_TOKEN` in Vercel. Confirm rate limiter is using Redis (logs).
- [ ] Set up UptimeRobot or BetterStack hitting `/api/health` every minute. Page on outage.
- [ ] Sentry: configure release tracking + sourcemap upload in EAS post-build hook.
- [ ] PostHog: build the 4 dashboards that matter — D1/D7/D30 retention, paywall conversion, reading completion rate, daily insight open rate.
- [ ] RevenueCat: enable webhook retry alerts to email.
- [ ] Anthropic: set monthly spend cap as hard ceiling (account settings).
- [ ] Read [OPERATIONS.md](./OPERATIONS.md) end-to-end and run through one incident scenario as a drill.
- [ ] Backup recovery drill: `supabase db dump` from prod → restore to a scratch project → confirm row counts.
- [ ] Document support email response templates (restore failure, refund, content complaint).

## Scale milestones (when to upgrade infrastructure)

| Trigger | Action |
|---|---|
| 1,000 paying users | Upstash for rate limiter (already wired, just env vars). Vercel Pro plan. |
| 5,000 paying users | Daily-insight cron → queue (Inngest/QStash). Per-timezone delivery. |
| 10,000 paying users | Supabase Pro + connection pooler URL. Photo retention TTL job. CDN for share cards. |
| 50,000 paying users | Multi-region replicas. Background workers. Cost telemetry dashboard. |

See [OPERATIONS.md](./OPERATIONS.md) for the full runbook.

---

## Post-launch backlog (not in V1)
- Localization (Spanish, Portuguese first — high spiritual app demand)
- Tarot or numerology side feature (only if data shows users asking)
- Web app
- Live psychic chat marketplace (different business — re-evaluate after $50K MRR)
- Apple Watch widget
- Referral mechanic (give-1-month, get-1-month)
