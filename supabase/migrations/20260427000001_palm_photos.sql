-- palm_photos: stores references to palm photos in Supabase Storage.
-- Actual binary lives in the 'palms' storage bucket; this row holds metadata.

create table if not exists public.palm_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null unique,
  hand text not null check (hand in ('left','right')),
  width int,
  height int,
  bytes int,
  uploaded_at timestamptz not null default now()
);

create index if not exists palm_photos_user_idx
  on public.palm_photos(user_id, uploaded_at desc);
