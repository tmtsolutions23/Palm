-- Enable Row-Level Security on every user-owned table and add policies.
-- Service role (used by the Next.js backend) bypasses RLS automatically.

alter table public.profiles                enable row level security;
alter table public.palm_photos             enable row level security;
alter table public.readings                enable row level security;
alter table public.compatibility_readings  enable row level security;
alter table public.daily_insights          enable row level security;
alter table public.subscription_events     enable row level security;

-- profiles: user can read/update own row only
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- palm_photos: full CRUD on own rows
create policy "palm_photos_all_own"
  on public.palm_photos for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- readings: full CRUD on own rows
create policy "readings_all_own"
  on public.readings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- compatibility_readings: owner-scoped
create policy "compat_all_own"
  on public.compatibility_readings for all
  using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

-- daily_insights: read + update own; insert via service role only
create policy "daily_select_own"
  on public.daily_insights for select
  using (auth.uid() = user_id);

create policy "daily_update_own"
  on public.daily_insights for update
  using (auth.uid() = user_id);

-- subscription_events: read own; writes via service role only
create policy "sub_events_select_own"
  on public.subscription_events for select
  using (auth.uid() = user_id);
