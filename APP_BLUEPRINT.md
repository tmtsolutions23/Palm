# Palm Reader — APP_BLUEPRINT.md

## Concept
A premium mobile app (iOS + Android) that uses AI vision to analyze a photo of the user's palm and deliver personalized palmistry readings, daily insights, and relationship compatibility. Subscription-first monetization with a frictionless free first reading as the hook.

**Working name:** Palm Reader (placeholder — final brand TBD; suggested: "Palm.ai", "Lineage", "Palmist", "Mira Palm")

**Key assumption:** the user wants AI-driven palm photo analysis (not human psychics, not generic horoscopes). All sections below are written under that assumption — flag any to redirect.

---

## 1. MARKET VALIDATION

### Customer segments
1. **Spiritual / astrology native (primary)** — Gen Z and millennial women, 18–34, already pay for Co-Star, The Pattern, Nebula, Sanctuary. Buy crystals, tarot decks, journals. ~70% of revenue.
2. **Curious entertainment seekers** — broad mainstream users who'd never call themselves "spiritual" but love shareable, novelty experiences (think: face-aging filters, MyHeritage AI photos). Convert via TikTok virality. ~25%.
3. **Couples & friend groups** — buying compatibility readings together. Lowest CAC because they invite each other. ~5% direct, but drive viral coefficient.

### What they pay today
| Product | Price |
|---|---|
| Co-Star Plus | $4.99/mo |
| The Pattern Premium | $9.99/mo |
| Nebula Premium | $9.99/mo + $1–6 per psychic minute |
| Sanctuary | $19.99/mo |
| Purple Garden / Keen psychic call | $1.99–$9.99/min |
| In-person palm reading | $30–150/session |
| Existing "Palm Reader" App Store apps | $4.99/wk to $9.99/wk subscriptions |

### Why they switch
- Current "palm reader" apps on the stores are ad-spam shovelware with 3.0–3.5 star reviews; complaints center on identical generic readings, predatory paywalls, no real photo analysis.
- AI vision (Claude Sonnet 4.6, GPT-4o) is now capable enough to identify palm lines and produce readings that feel personalized — a credibility threshold that didn't exist 18 months ago.
- A single $7.99/wk subscription replaces the need to ever pay $30+ for an in-person reading.

### TAM / SAM / SOM
- **TAM:** Global astrology & spiritual apps market — **$12.8B (2023)**, projected $22.8B by 2031 (Allied Market Research). Broader divination/horoscope content market is larger.
- **SAM:** English-speaking mobile users (US/UK/CA/AU) interested in divination apps — ~$2.0B addressable.
- **SOM:** 0.05% capture in year 1 → **~$1M ARR** target. Reasonable based on Co-Star (~7M MAU) and Nebula (~$60M revenue) precedent.

---

## 2. COMPETITIVE LANDSCAPE

| # | Competitor | Pricing | Biggest weakness (from real reviews) |
|---|---|---|---|
| 1 | "Palm Reader & Astrology" (top App Store palm app) | Free + $9.99/wk IAP | Reviews complain of forced trial-to-paid, generic non-personalized readings, broken camera flow |
| 2 | Nebula | Free + $9.99/mo + per-minute psychic chats | Expensive psychic upsell, not photo-based, dated UI for younger demo |
| 3 | Co-Star | Free + $4.99/mo Plus | Not palm-focused, no photo experience, content is generic horoscope |
| 4 | The Pattern | Free + $9.99/mo | Vague "vibes" tone, no novelty hook, churn after 2 months is high |
| 5 | Sanctuary | $19.99/mo subscription | Heavy paywall, no AI, focused on text-readings-by-humans |

### Landing pages
- nebulahoroscope.com
- costarastrology.com
- thepattern.com
- sanctuaryworld.co

### The gap Palm Reader fills
**No premium-feeling app combines high-quality AI palm photo analysis + daily personalized content + production-grade design.** The category is dominated by either (a) cheap shovelware with terrible UX, or (b) generic horoscope apps with no palm focus, or (c) expensive human-psychic marketplaces. There is open space for a polished, AI-native palm app priced like a normal premium subscription.

---

## 3. MONETIZATION MODEL

### Pricing tiers
| Tier | Price | What you get |
|---|---|---|
| Free | $0 | 1 lifetime starter reading + locked daily insights |
| Weekly | **$7.99/wk** (3-day free trial) | Unlimited readings, daily insights, compatibility, history |
| Annual | **$39.99/yr** (3-day free trial, save 90%) | Same as weekly |
| Lifetime | **$79.99 one-time** | Same as weekly, no recurring |

Default selected tier in paywall: **Annual** (highest LTV / lowest churn).

### Revenue projections
Assuming blended ARPU of **~$50/yr** (mix of weekly churn-outs, annual, lifetime):

| Paying users | Monthly revenue | Annual run rate |
|---|---|---|
| 10 | $42 | $500 |
| 50 | $208 | $2,500 |
| 200 | $833 | $10,000 |
| 1,000 | $4,167 | $50,000 |
| 10,000 | $41,667 | $500,000 |

### Payment provider
**RevenueCat** wrapping Apple StoreKit 2 + Google Play Billing.
- Handles trial-to-paid, restore purchases, family sharing, refunds, webhooks
- Free up to $2.5K MTR; 1% of revenue above that
- Critical: Apple/Google take 15–30% — gross-to-net is real, model accordingly

### Free trial assumptions
- 3-day free trial on weekly + annual
- Industry baseline trial-to-paid conversion: 30–45% for spiritual apps with paywall after first reading
- Day-1 to month-1 retention target: ~40%
- Annual renewal target: 55%

---

## 4. MVP FEATURE SET (4 core features — nothing else)

### F1. Palm Capture & AI Reading
- **User story:** As a new user, I take a photo of my palm and receive a multi-section personalized reading within 15 seconds, so that I feel the magic on first use.
- **Acceptance criteria:** Guided photo capture (overlay outline, lighting check, retake option). Returns 4 sections: Life Line, Heart Line, Head Line, Fate Line, plus 1-paragraph summary. Result card is shareable with watermark.
- **Complexity:** High (vision pipeline, prompt engineering, photo quality validation)

### F2. Daily Insight
- **User story:** As a paying user, every morning I get a personalized palm-derived insight as a push notification + in-app card, so that I open the app daily.
- **Acceptance criteria:** Generated nightly per user from their saved palm reading. Push fires at user's selected time (default 8am local). Card has "Save to journal" + "Share" actions.
- **Complexity:** Medium (background job, push delivery, personalization)

### F3. Compatibility Reading
- **User story:** As a user, I scan a friend or partner's palm alongside mine and get a relationship-focused reading, so that I share it with them.
- **Acceptance criteria:** Two-photo flow (mine, theirs). Single combined reading covering communication, romance, conflict patterns. Generates a 2-person shareable card.
- **Complexity:** Medium (extends F1 with multi-image prompt)

### F4. Reading History
- **User story:** As a paying user, I see all my past readings, can re-share any of them, and search/filter by type.
- **Acceptance criteria:** List view, detail view, share button per reading, delete with confirm.
- **Complexity:** Low

### What we explicitly do NOT build in V1
- ❌ Live human psychic chat (different business, regulatory, ops burden)
- ❌ Video readings
- ❌ Social feed / community
- ❌ Web app
- ❌ Multi-language (English only at launch)
- ❌ Tarot, astrology, numerology side features (focus is the moat)
- ❌ Apple Watch app
- ❌ User-generated palm interpretation library

### The one feature that converts free → paid
**The 2nd reading.** The first reading is free and high-quality enough to feel real. The paywall fires the moment they tap "New Reading" again. Backed by the daily insight as the engagement hook that prevents churn after purchase.

---

## 5. TECH STACK DECISION

| Layer | Choice | Why over alternatives |
|---|---|---|
| Mobile framework | **React Native (Expo SDK 51+)** | One codebase iOS/Android, fast OTA updates, mature camera/IAP libs. Chosen over native Swift/Kotlin (2x dev time) and Flutter (smaller plugin ecosystem for IAP/RevenueCat). |
| Backend | **Next.js 16 API routes on Vercel** | Tight integration with Vercel Functions, Edge runtime for low-latency reads, AI SDK first-class. Chosen over standalone Node/Express (more infra) and Supabase Edge Functions (less mature). |
| Database | **Supabase Postgres** | Postgres + auth + storage + RLS in one managed service. Chosen over Firebase (no SQL, vendor lock-in) and bare RDS (more ops). |
| File storage | **Supabase Storage** | Palm photos stored with RLS; same provider as DB. |
| AI provider | **Anthropic Claude Sonnet 4.6** (vision + text) | Strong vision capability, lower cost than Opus, prompt caching for personalization templates. Fall back to Claude Haiku 4.5 for daily insights to control cost. |
| AI orchestration | **Vercel AI SDK** | Streaming, structured output, provider-agnostic if we ever swap. |
| IAP | **RevenueCat** | Industry standard, handles both stores, webhooks, analytics. Free tier covers MVP. |
| Auth | **Supabase Auth** with Apple Sign In + Email magic link | Apple Sign In required by App Store policy (since we use other social logins). Email magic link as fallback. |
| Push notifications | **Expo Push** (free) + **OneSignal** for advanced segmentation post-launch | Expo Push covers MVP for free. |
| Analytics | **PostHog** | Free tier, self-host option later, session replay |
| Error monitoring | **Sentry** | Standard, RN SDK is solid |
| Transactional email | **Resend** | Cleanest DX, generous free tier |

### Monthly cost breakdown
| Users | Vercel | Supabase | Claude API | RevenueCat | PostHog | Sentry | **Total** |
|---|---|---|---|---|---|---|---|
| 0 | $0 | $0 | $0 | $0 | $0 | $0 | **$0** |
| 100 | $0 | $0 | ~$30 | $0 | $0 | $0 | **~$30** |
| 1,000 | $20 | $25 | ~$300 | $0 | $0 | $26 | **~$370** |
| 10,000 | $200 | $100 | ~$2,800 | ~$200 | $50 | $80 | **~$3,400** |

(Cost dominated by Claude API per-reading. Aggressive prompt caching can cut this 40%.)

### Auth method
**Supabase Auth** with two providers:
1. **Sign in with Apple** — REQUIRED by App Store Review Guideline 4.8 because we offer other social logins
2. **Email magic link** — for Android primary + iOS fallback

(Defer Google Sign In until post-launch — not strictly necessary for MVP.)

---

## 6. DATABASE SCHEMA

```sql
-- users (managed by Supabase Auth, extended with profile)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  birth_date date,
  push_token text,
  daily_insight_time time default '08:00',
  timezone text default 'America/New_York',
  subscription_status text default 'free', -- 'free' | 'trialing' | 'active' | 'cancelled' | 'lifetime'
  subscription_product_id text,
  subscription_expires_at timestamptz,
  revenuecat_user_id text,
  created_at timestamptz default now()
);

create table palm_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  storage_path text not null, -- supabase storage path
  hand text check (hand in ('left','right')) not null,
  uploaded_at timestamptz default now()
);
create index palm_photos_user_idx on palm_photos(user_id);

create table readings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  photo_id uuid references palm_photos(id) on delete set null,
  reading_type text check (reading_type in ('full','daily','compatibility')) not null,
  lines_jsonb jsonb, -- {life: "...", heart: "...", head: "...", fate: "..."}
  summary text,
  share_card_url text,
  model_version text, -- 'claude-sonnet-4-6'
  created_at timestamptz default now()
);
create index readings_user_created_idx on readings(user_id, created_at desc);

create table compatibility_readings (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references profiles(id) on delete cascade,
  partner_label text, -- "Sarah", "Mom", etc — no second user account required
  photo_a_id uuid references palm_photos(id) on delete set null,
  photo_b_id uuid references palm_photos(id) on delete set null,
  reading_jsonb jsonb,
  created_at timestamptz default now()
);

create table daily_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  for_date date not null,
  content text not null,
  delivered_at timestamptz,
  opened_at timestamptz,
  unique(user_id, for_date)
);

create table subscription_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete set null,
  event_type text not null, -- INITIAL_PURCHASE, RENEWAL, CANCELLATION, BILLING_ISSUE, etc
  payload_jsonb jsonb not null,
  occurred_at timestamptz default now()
);
create index sub_events_user_idx on subscription_events(user_id, occurred_at desc);
```

### Row-Level Security
- All tables: `enable row level security`
- `profiles`: user can `select/update` their own row only
- `palm_photos`, `readings`, `compatibility_readings`, `daily_insights`: user can `select/insert/delete` only where `user_id = auth.uid()`
- `subscription_events`: insert via service role only (webhook); user can `select` their own
- Service role bypasses RLS for backend jobs

### Migrations structure
```
supabase/migrations/
  20260427000000_init_profiles.sql
  20260427000001_palm_photos.sql
  20260427000002_readings.sql
  20260427000003_compatibility.sql
  20260427000004_daily_insights.sql
  20260427000005_subscription_events.sql
  20260427000006_rls_policies.sql
```

---

## 7. API ENDPOINTS

All endpoints under `https://api.palmreader.app`. JSON body unless noted. Auth = Supabase JWT in `Authorization: Bearer …`.

| Method | Path | Auth | Rate limit | Description |
|---|---|---|---|---|
| POST | `/api/readings` | required | 10/day free, 100/day pro | Multipart upload palm photo, returns reading |
| GET | `/api/readings` | required | 60/min | List user's readings (paginated) |
| GET | `/api/readings/:id` | required | 60/min | Single reading detail |
| DELETE | `/api/readings/:id` | required | 30/min | Delete reading |
| POST | `/api/compatibility` | required (pro) | 5/day | Two photo IDs, returns compatibility reading |
| GET | `/api/insights/today` | required (pro) | 60/min | Today's daily insight (generates if missing) |
| POST | `/api/insights/mark-opened` | required | 60/min | Track open for daily insight |
| POST | `/api/profile` | required | 30/min | Update profile (push token, time, timezone) |
| POST | `/api/auth/apple` | none | 30/min | Apple Sign In server-side verify |
| POST | `/api/webhooks/revenuecat` | RevenueCat HMAC | unlimited | Subscription state events |
| POST | `/api/share-card` | required | 30/min | Generate shareable image, returns CDN URL |

### Request/response example — POST /api/readings
```jsonc
// Request: multipart/form-data
// fields: photo (file, jpg/png, ≤8MB), hand ("left"|"right")

// Response 200
{
  "reading_id": "uuid",
  "summary": "Your palm reveals…",
  "lines": {
    "life":  "Your life line is deep and unbroken…",
    "heart": "…",
    "head":  "…",
    "fate":  "…"
  },
  "share_card_url": "https://cdn.palmreader.app/cards/uuid.png",
  "created_at": "2026-04-26T20:55:00Z"
}

// Response 400 — bad photo
{ "error": "photo_quality_low", "message": "We couldn't see your palm clearly. Try better lighting." }

// Response 402 — paywalled (2nd+ free reading)
{ "error": "paywall_required", "message": "Upgrade to continue." }
```

### Webhook — POST /api/webhooks/revenuecat
Validates `X-RevenueCat-Signature` HMAC. Upserts `profiles.subscription_status`, `subscription_expires_at`. Records full payload in `subscription_events`.

---

## 8. USER FLOW & SCREENS

### Complete journey
```
Cold install
  → Onboarding (3 cards: "Your palm tells your story" → "Powered by AI" → "Your first reading is free")
  → Permissions prompt (camera, then notifications)
  → Auth (Apple / Email magic link) — single screen, Apple is default
  → Home: "Take your first reading" CTA
  → Reading capture flow (instructions → camera with overlay → review → analyzing… → result)
  → Share / save
  → Tap "New Reading" → Paywall
  → If subscribe → unlocked Pro experience
  → Daily push at 8am → opens to today's insight
```

### Screen inventory
| Screen | Purpose | Key components |
|---|---|---|
| Splash | Brand moment | Logo, tagline |
| Onboarding 1–3 | Education + value | Swipeable cards, "Continue" |
| Permissions | Camera + push | Native prompts |
| Auth | Sign in/up | Apple button, email field |
| Home | Hub | Recent reading card, "New Reading" CTA, Daily card |
| Reading instructions | Reduce bad photos | Hand outline diagram, lighting tips |
| Camera | Capture | Live overlay, capture button, retake |
| Reading processing | Magic moment | Animated palm scan, rotating phrases |
| Reading result | Payoff | 4 line cards, summary, share, save |
| Paywall | Convert | 3 plans, social proof, restore purchases, close-X (small) |
| Compatibility intro | Start 2-person flow | Two photo slots |
| Daily insight | Engagement | Single card, save, share |
| History list | Pro feature | Scrollable list, search |
| History detail | Re-engagement | Full reading, share |
| Settings | Account | Subscription mgmt, notification time, support, legal |

### Empty / loading / error states
- **Empty history**: "Your readings will live here" + CTA to take one
- **Loading reading**: full-screen animated palm scan, never blank
- **Bad photo**: "We need a clearer view" with examples of good/bad palms
- **Network error**: cached last reading + "Tap to retry" toast
- **Subscription expired**: gentle paywall surface with "Restore" prominent
- **AI failure**: "Our oracle is resting — try again in a moment" + Sentry log

---

## 9. LAUNCH CHECKLIST

- [ ] PostHog SDK installed; events: `app_open`, `signup`, `reading_started`, `reading_completed`, `reading_failed`, `paywall_view`, `purchase_started`, `purchase_completed`, `compatibility_started`, `daily_opened`
- [ ] Sentry RN SDK with sourcemap upload in EAS build pipeline
- [ ] App Store Connect listing: 6 screenshots × 6.7"/6.5"/iPad, app preview video, keywords ("palm reader", "palmistry", "ai fortune", "compatibility")
- [ ] Google Play listing: feature graphic, screenshots, short + full description
- [ ] Privacy nutrition labels filled (Apple) — disclose photos collected for AI processing
- [ ] OG image + landing page at palmreader.app (Next.js or Framer)
- [ ] Sitemap + robots.txt for landing
- [ ] Transactional emails via Resend: welcome, receipt, trial-ending-tomorrow, churn save
- [ ] Legal pages: Terms of Service, Privacy Policy, Refund Policy, Subscription Terms — hosted at /legal/* on landing
- [ ] DNS: palmreader.app (apex → Vercel), api.palmreader.app, cdn.palmreader.app
- [ ] App Store Apple Sign In configured + tested
- [ ] RevenueCat products created in App Store Connect + Google Play, IDs match config
- [ ] Crashlytics-equivalent dashboards bookmarked
- [ ] Customer support email: hello@palmreader.app forwards to founder

---

## 10. DISTRIBUTION STRATEGY

### First 100 users — exact tactics
1. **TikTok content (primary)** — 5 posts/day for 30 days. Format: "AI just read my palm and called me out 😳" reaction videos. Account converts at 1–3% to install.
2. **Instagram Reels mirror** — same content, cross-posted via Metricool.
3. **Reddit** — high-value (NOT promotional) posts in r/Palmistry, r/Palmreading, r/Astrology, with Palm Reader mentioned only when asked. ~2 posts/wk.
4. **Product Hunt launch** — Tuesday launch, hunt scheduled 2 weeks ahead. Aim top 5 of day in iOS/lifestyle.
5. **Indie Hackers + X** — build-in-public thread weekly with revenue/learnings (drives founder authority + organic developer/designer interest).
6. **App Store Optimization from day 1** — keyword localization for top 20 palm/palmistry/fortune terms.

### Content plan
| Channel | Cadence | Format |
|---|---|---|
| TikTok | 5/day × 30 days | Reaction, before/after, friends-react, "rare palm features" |
| Instagram Reels | 3/day | Repurposed TikTok |
| X / Twitter | 1/day | Build-in-public + screenshot of best readings |
| Product Hunt | 1 launch | Founder-led story + community pre-warmed |
| Reddit | 2/wk | Genuine value posts |
| Indie Hackers | 1/wk | MRR + learnings |

### Organic loops built into product
1. **Shareable result card** — every reading produces a beautiful watermarked image card; one-tap share to IG/TikTok/iMessage.
2. **Compatibility flow** — explicitly asks for a friend's palm; sharing the result tags them.
3. **"Read for me" deep link** — user can send a friend a link that opens directly into the camera flow.

### Referral mechanics
- Give-1-month, get-1-month referral inside the app (Pro users only)
- Target viral coefficient (k): 0.4 in month 1 (conservative for novelty app)

---

## 11. BUILD SEQUENCE (4-week milestone plan)

### Week 1 — Skeleton, ships to TestFlight
**Deployable:** Internal TestFlight + Play internal track
- Expo project scaffolded, EAS build pipeline working
- Supabase project, schema migrated, RLS on
- Apple Sign In + email magic link working end-to-end
- Camera capture screen with overlay + photo upload to Supabase Storage
- POST /api/readings endpoint returning a hardcoded reading
- Basic home + result screens

### Week 2 — Real AI + paywall, paying TestFlight users
**Deployable:** Closed beta with real subscriptions in sandbox
- Claude Sonnet vision integration with prompt-engineered reading generator
- Photo quality gate (reject blurry / no-palm photos)
- RevenueCat integrated, paywall screen built, products live in stores
- History list + detail screens
- Sentry + PostHog wired

### Week 3 — Engagement & moat features
**Deployable:** Open beta + ASO assets prepared
- Compatibility reading flow (two-photo capture, combined prompt)
- Daily insight: nightly cron + Expo Push delivery
- Share card image generation (Vercel OG-style endpoint)
- Settings screen with subscription management + notification time
- Onboarding polish

### Week 4 — Launch
**Milestone:** Public launch on App Store + Play Store + Product Hunt
- ASO assets finalized (screenshots, video, copy)
- Legal pages + landing site live
- Transactional emails configured + tested
- 30 days of TikTok content batched and scheduled
- Soft-launch in NZ/AU/CA 7 days before US launch to iterate paywall conversion
- Public launch day: PH + IH + X thread

---

## 12. BIGGEST RISKS & MITIGATIONS

| Risk | Mitigation |
|---|---|
| App Store rejection (palm reading classed as "fortune-telling" in some markets) | Frame copy as "entertainment" in metadata; review Apple guideline 1.4.1; have Terms make non-medical/non-advice clear |
| Photo quality kills the magic | Strict pre-upload quality gate + retake prompt; collect failures to refine prompt |
| AI cost runs away | Aggressive Claude prompt caching, switch daily insights to Haiku, cap free user reads |
| Generic-feeling readings | Invest week 2 entirely in prompt engineering with 100+ test palms |
| Apple Sign In edge cases | Test fully on day 1 — biggest source of TestFlight failures |
| Privacy concern about palm photos | Store with RLS, allow user-initiated delete, optional "delete photo after reading" toggle |

---

## NEXT FILES TO GENERATE
This blueprint is the foundation. Companion files to produce next:
1. **Project folder structure** (mobile + backend)
2. **SQL migration files** (one per table from §6)
3. **`.env.example`** with every required variable
4. **`CLAUDE.md`** — ongoing development context for Claude Code
5. **API route stub files** matching §7
6. **Week-by-week task breakdown** with day-level deployable milestones
