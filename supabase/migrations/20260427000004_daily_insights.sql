-- daily_insights: one short personalized insight per user per day.
-- Generated nightly by the cron job; delivered via Expo Push at user's local time.

create table if not exists public.daily_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  for_date date not null,
  content text not null,
  delivered_at timestamptz,
  opened_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, for_date)
);

create index if not exists daily_insights_user_date_idx
  on public.daily_insights(user_id, for_date desc);

create index if not exists daily_insights_undelivered_idx
  on public.daily_insights(for_date)
  where delivered_at is null;
