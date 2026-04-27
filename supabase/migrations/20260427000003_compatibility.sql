-- compatibility_readings: two-palm relationship readings.
-- Owner is a registered user; partner is just a label (no second account required).

create table if not exists public.compatibility_readings (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.profiles(id) on delete cascade,
  partner_label text,
  photo_a_id uuid references public.palm_photos(id) on delete set null,
  photo_b_id uuid references public.palm_photos(id) on delete set null,
  reading_jsonb jsonb,       -- {communication, romance, conflict, summary}
  share_card_url text,
  model_version text,
  input_tokens int,
  output_tokens int,
  cost_usd numeric(10,6),
  created_at timestamptz not null default now()
);

create index if not exists compatibility_owner_created_idx
  on public.compatibility_readings(owner_user_id, created_at desc);
