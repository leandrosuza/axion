-- Create user-uploads bucket for avatar storage
-- This bucket uses Supabase Storage which is backed by S3-compatible storage

-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-uploads',
  'user-uploads',
  true,
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Avatars are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;

-- Policy 1: Allow authenticated users to upload to avatars folder
-- Simplified policy - any authenticated user can upload avatars
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-uploads'
  AND name LIKE 'avatars/%'
);

-- Policy 2: Allow public read access to all avatars
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'user-uploads'
  AND name LIKE 'avatars/%'
);

-- Policy 3: Allow authenticated users to delete avatars
CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-uploads'
  AND name LIKE 'avatars/%'
);

-- Policy 4: Allow authenticated users to update avatars
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
