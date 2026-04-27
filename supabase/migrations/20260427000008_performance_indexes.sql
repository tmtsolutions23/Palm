-- Performance indexes for frequently-queried columns.
-- These complement the existing indexes on profiles (subscription_status, revenuecat_user_id).

-- Daily insights: lookup by user + date (the unique constraint already implies an index,
-- but this makes it explicit and covers the common query pattern).
create index if not exists daily_insights_user_date_idx
  on public.daily_insights(user_id, for_date);

-- Compatibility readings: list by owner (most common query)
create index if not exists compatibility_readings_owner_idx
  on public.compatibility_readings(owner_user_id, created_at desc);

-- Readings: paginated list with cursor (before + limit pattern)
create index if not exists readings_user_type_created_idx
  on public.readings(user_id, reading_type, created_at desc);

-- Palm photos: list by user for upload verification
create index if not exists palm_photos_created_idx
  on public.palm_photos(user_id, uploaded_at desc);