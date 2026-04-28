# Palm Production Sprint Plan

Goal: bring Palm to a production-ready state **excluding mobile app implementation** so the next phase is purely iOS/Android build-out.

## Done in this sprint

### Product & monetization
- Free experience is now a zero-marginal-cost demo reading.
- Paid AI usage is rate-limited and daily insights are cache-optimized.
- Launch pricing is finalized:
  - Weekly: $7.99 / week, no trial
  - Annual: $39.99 / year, 3-day trial, default selected
  - Lifetime: $99.99 one-time

### Production polish target
1. Harden backend env validation and API error surfaces.
2. Add a real health/readiness endpoint for uptime monitoring.
3. Complete non-mobile API coverage for history/detail/delete flows.
4. Add a lightweight marketing + legal surface on the backend domain.
5. Refresh docs so deployment/release/support work is unblocked.

## Definition of ready-for-mobile-build
Palm is considered ready for the mobile implementation phase when:
- backend env requirements are explicit and validated
- uptime checks can detect bad deploys early
- paid/free behavior is enforced server-side
- history/detail/delete API flows exist for readings + compatibility
- marketing site and legal pages exist for review/store links
- docs cover deployment, release, and operational recovery

## Remaining mobile-only phase after this
- build iOS and Android app shells/screens
- wire camera/photo capture UX
- wire auth/session flows
- wire RevenueCat purchases/restore UX
- wire push notifications and app-store specific metadata
