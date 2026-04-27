# Palm Reader

A premium mobile app that uses AI vision to deliver personalized palmistry readings, daily insights, and compatibility readings.

See [`APP_BLUEPRINT.md`](./APP_BLUEPRINT.md) for the full product spec, [`TASKS.md`](./TASKS.md) for the build plan, and [`CLAUDE.md`](./CLAUDE.md) for the working architecture.

## Stack
- **Mobile**: Expo (React Native) + TypeScript + Expo Router
- **Backend**: Next.js 16 on Vercel
- **AI**: Anthropic Claude Sonnet 4.6 (vision) + Haiku 4.5 (daily insights), via Vercel AI SDK
- **Database / Auth / Storage**: Supabase
- **IAP**: RevenueCat
- **Analytics**: PostHog · **Errors**: Sentry · **Push**: Expo Push · **Email**: Resend

## First-time setup

```bash
# 1. Clone, then copy env template
cp .env.example .env.local

# 2. Set up Supabase
npx supabase link --project-ref <your-ref>
npx supabase db push

# 3. Backend
cd backend && npm install && npm run dev

# 4. Mobile (separate terminal)
cd mobile && npm install && npx expo start
```

You'll need accounts/keys for: Supabase, Anthropic, RevenueCat, Sentry, PostHog, Resend, Apple Developer, Google Play Console. See `.env.example`.

## Project structure

```
.
├── mobile/             # Expo React Native app
├── backend/            # Next.js API (Vercel)
├── supabase/           # SQL migrations
├── APP_BLUEPRINT.md    # product spec
├── TASKS.md            # build plan
└── CLAUDE.md           # working architecture for Claude Code
```
