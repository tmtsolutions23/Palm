-- Private bucket for palm photos.
-- Mobile uploads via signed URL; backend reads via service role.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('palms', 'palms', false, 8388608, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- RLS on storage.objects: users can only access objects under their own UUID prefix.
-- Path convention: <user_id>/<photo_id>.jpg

create policy "palms_owner_read"
  on storage.objects for select
  using (
    bucket_id = 'palms'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "palms_owner_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'palms'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "palms_owner_delete"
  on storage.objects for delete
  using (
    bucket_id = 'palms'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
