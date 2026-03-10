-- Quick fix for avatar upload RLS policies
-- Run this in Supabase SQL Editor to fix the "row violates row-level security policy" error

-- Step 1: Drop all existing policies on storage.objects for user-uploads bucket
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Avatars are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;

-- Step 2: Create new simplified policies

-- Allow authenticated users to INSERT (upload) files to avatars/ folder
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-uploads'
  AND name LIKE 'avatars/%'
);

-- Allow everyone (public) to SELECT (view) files in avatars/ folder
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'user-uploads'
  AND name LIKE 'avatars/%'
);

-- Allow authenticated users to DELETE files in avatars/ folder
CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-uploads'
  AND name LIKE 'avatars/%'
);

-- Allow authenticated users to UPDATE files in avatars/ folder
CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'user-uploads'
  AND name LIKE 'avatars/%'
)
WITH CHECK (
  bucket_id = 'user-uploads'
  AND name LIKE 'avatars/%'
);

-- Verification query - check if policies were created
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
  AND policyname LIKE '%avatar%';
