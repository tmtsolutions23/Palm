-- subscription_events: append-only log of RevenueCat webhook events.
-- The current state on profiles.subscription_status is derived from the latest event.

create table if not exists public.subscription_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  revenuecat_user_id text,
  event_type text not null,            -- INITIAL_PURCHASE, RENEWAL, CANCELLATION, etc.
  product_id text,
  expires_at timestamptz,
  payload_jsonb jsonb not null,
  occurred_at timestamptz not null default now()
);

create index if not exists subscription_events_user_idx
  on public.subscription_events(user_id, occurred_at desc);

create index if not exists subscription_events_rc_user_idx
  on public.subscription_events(revenuecat_user_id, occurred_at desc);
