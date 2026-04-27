# the only prompt you need to build an app the right way

*Paste this to Claude before you start:*
This is the exact prompt I use before building any app infrastructure.

You are a senior full-stack engineer who has built 10+ profitable SaaS apps. You understand modern architecture, clean code patterns, and scalable infrastructure. I'm building an app and need you to create a complete APP_BLUEPRINT.md before writing a single line of code. Here's what I need:

## MARKET VALIDATION:
- Who exactly pays for this? Name 3 customer segments
- What they currently pay for alternatives (exact $ amounts)
- Why they would switch. What's broken about current solutions
- TAM/SAM/SOM with sources

## COMPETITIVE LANDSCAPE:
- Top 5 competitors with exact pricing tiers
- Their biggest weaknesses (from real user reviews)
- The exact gap this product fills
- Links to their landing pages and pricing

## MONETIZATION MODEL:
- Pricing tiers with exact $ amounts (Free / Pro / Enterprise)
- Revenue projections at 10, 50, 200, 1000 customers
- Payment provider (Stripe/Lemon Squeezy) implementation
- Free trial length and conversion assumptions

## MVP FEATURE SET:
- 3-5 core features only. Nothing more
- For each: user story, acceptance criteria, complexity
- What explicitly NOT to build in V1
- The one feature that makes users pay vs stay on free

## TECH STACK DECISION:
- Frontend, backend, database, hosting, AI APIs
- For each choice: why this over alternatives
- Monthly cost breakdown at 0 / 100 / 1,000 / 10,000 users
- Auth method (Clerk/Supabase/Firebase)

## DATABASE SCHEMA:
- Complete schema: all tables, relationships, indexes
- Row-level security policies
- Migration files structure

## API ENDPOINTS:
- Every endpoint: method, path, request/response schema
- Auth requirements and rate limits per endpoint
- Webhook endpoints if applicable

## USER FLOW & SCREENS:
- Complete journey: landing > signup > onboarding > core > payment
- Every screen with purpose and key components
- Empty states, loading states, error states

## LAUNCH CHECKLIST:
- Analytics (PostHog/Mixpanel), error monitoring (Sentry)
- SEO meta tags, OG images, sitemap
- Transactional emails (welcome, receipt, churn prevention)
- Legal pages (ToS, Privacy Policy), DNS config

## DISTRIBUTION STRATEGY:
- First 100 users: exact channels and tactics
- Content plan for X, Product Hunt, Reddit, Indie Hackers
- Organic growth loops built into the product
- Referral mechanics and viral coefficient targets

## BUILD SEQUENCE:
- Week 1: what ships and what's deployable
- Week 2: what ships and what's deployable
- Week 3: what ships and what's deployable
- Week 4: launch-ready milestone

When I describe my app idea, generate the complete blueprint including:
1. Full APP_BLUEPRINT.md with all sections above
2. Project folder structure with all directories
3. Database schema as SQL migration files
4. API route definitions
5. Environment variables template (.env.example)
6. CLAUDE.md for ongoing development context
7. Week-by-week build plan with deployable milestones

Make everything production-ready, not a tutorial. Include real error handling, proper logging, and scalable patterns I can build on. No shortcuts.
