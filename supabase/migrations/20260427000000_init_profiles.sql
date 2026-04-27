-- profiles: extends auth.users with app-specific user data.
-- One row per auth user, created via trigger on signup.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  birth_date date,
  push_token text,
  daily_insight_time time default '08:00:00',
  timezone text default 'America/New_York',
  subscription_status text not null default 'free'
    check (subscription_status in ('free','trialing','active','cancelled','lifetime','billing_issue')),
  subscription_product_id text,
  subscription_expires_at timestamptz,
  revenuecat_user_id text,
  free_readings_used int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_subscription_status_idx
  on public.profiles(subscription_status);

create index if not exists profiles_revenuecat_user_id_idx
  on public.profiles(revenuecat_user_id);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- auto-create profile on auth signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
