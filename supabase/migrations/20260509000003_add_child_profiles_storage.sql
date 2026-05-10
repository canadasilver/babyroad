-- ============================================================
-- child-profiles Storage bucket + RLS policies
--
-- Bucket: child-profiles (public)
-- Upload path: {user_id}/{child_id}/profile.jpg
-- Read: public (no auth required)
-- Write: authenticated users for their own folder only
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'child-profiles',
  'child-profiles',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Drop existing policies to allow idempotent re-runs
drop policy if exists "child_profiles_select" on storage.objects;
drop policy if exists "child_profiles_insert" on storage.objects;
drop policy if exists "child_profiles_update" on storage.objects;
drop policy if exists "child_profiles_delete" on storage.objects;

-- Public read (bucket is already public, but explicit policy is clearer)
create policy "child_profiles_select"
  on storage.objects for select
  to public
  using (bucket_id = 'child-profiles');

-- Authenticated users can upload only to their own folder ({user_id}/...)
create policy "child_profiles_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'child-profiles'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated users can overwrite only their own folder
create policy "child_profiles_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'child-profiles'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated users can delete only their own folder
create policy "child_profiles_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'child-profiles'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
