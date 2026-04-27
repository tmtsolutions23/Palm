-- readings: AI-generated palm readings (full or daily-derived).

create table if not exists public.readings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  photo_id uuid references public.palm_photos(id) on delete set null,
  reading_type text not null check (reading_type in ('full','daily')),
  lines_jsonb jsonb,         -- {life: "...", heart: "...", head: "...", fate: "..."}
  summary text not null,
  share_card_url text,
  model_version text,        -- e.g. 'claude-sonnet-4-6'
  input_tokens int,
  output_tokens int,
  cost_usd numeric(10,6),
  created_at timestamptz not null default now()
);

create index if not exists readings_user_created_idx
  on public.readings(user_id, created_at desc);

create index if not exists readings_type_created_idx
  on public.readings(reading_type, created_at desc);
