# 🚨 APPLY FIX NOW - Avatar Upload Not Working

## Current Status
✅ Bucket exists: `user-uploads`
✅ Bucket is public: Yes
❌ **RLS Policies missing** ← THIS IS THE PROBLEM

## What You Need To Do (2 Minutes)

### Step 1: Open Supabase SQL Editor

Click this link:
```
https://supabase.com/dashboard/project/rrpmfmqzmtmfuyktltnz/sql/new
```

Or manually:
1. Go to https://supabase.com/dashboard
2. Select your project: `rrpmfmqzmtmfuyktltnz`
3. Click "SQL Editor" in left sidebar
4. Click "New query"

### Step 2: Copy This Entire SQL Block

```sql
-- ============================================
-- FIX: Avatar Upload RLS Policies
-- Run this entire block in Supabase SQL Editor
-- ============================================

-- Step 1: Remove any existing policies
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Avatars are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;

-- Step 2: Create INSERT policy (allows upload)
CREATE POLICY "Users can upload their own avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-uploads'
  AND name LIKE 'avatars/%'
);

-- Step 3: Create SELECT policy (allows public viewing)
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'user-uploads'
  AND name LIKE 'avatars/%'
);

-- Step 4: Create DELETE policy (allows deletion)
CREATE POLICY "Users can delete their own avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-uploads'
  AND name LIKE 'avatars/%'
);

-- Step 5: Create UPDATE policy (allows updates)
CREATE POLICY "Users can update their own avatars"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'user-uploads'
  AND name LIKE 'avatars/%'
)
WITH CHECK (
  bucket_id = 'user-uploads'
  AND name LIKE 'avatars/%'
);

-- ============================================
-- VERIFICATION: Check policies were created
-- ============================================
SELECT
  schemaname,
  tablename,
  policyname,
  cmd as operation,
  roles
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
  AND policyname LIKE '%avatar%'
ORDER BY policyname;
```

### Step 3: Paste Into SQL Editor

1. Click in the SQL editor text area
2. Press `Ctrl+A` (select all)
3. Press `Ctrl+V` (paste the SQL above)

### Step 4: Run The SQL

Click the "Run" button or press `Ctrl+Enter`

### Step 5: Verify Success

You should see:
```
Success. No rows returned
```

Then scroll down and see a table with 4 rows showing:
- ✅ Users can upload their own avatars (INSERT, authenticated)
- ✅ Avatars are publicly accessible (SELECT, public)
- ✅ Users can delete their own avatars (DELETE, authenticated)
- ✅ Users can update their own avatars (UPDATE, authenticated)

### Step 6: Test Avatar Upload

1. Go to: http://localhost:3000/dashboard/settings
2. Click "Profile" tab
3. Upload an avatar image
4. Should work! ✅

## What This Does

The SQL creates 4 security policies:

1. **INSERT policy**: Allows logged-in users to upload files to `avatars/` folder
2. **SELECT policy**: Allows anyone (public) to view avatar images
3. **DELETE policy**: Allows logged-in users to delete files from `avatars/` folder
4. **UPDATE policy**: Allows logged-in users to update files in `avatars/` folder

## Why It Was Failing

Supabase Storage uses Row Level Security (RLS). Without policies:
- ❌ All operations are blocked by default
- ❌ Even authenticated users can't upload
- ❌ Result: 403 error "row violates row-level security policy"

With policies applied:
- ✅ Authenticated users can upload
- ✅ Everyone can view (needed for avatar display)
- ✅ Users can manage their avatars

## Troubleshooting

### "Policy already exists" error?

The `DROP POLICY IF EXISTS` at the top handles this, but if you still get the error:

1. Go to: https://supabase.com/dashboard/project/rrpmfmqzmtmfuyktltnz/storage/policies
2. Find policies for "user-uploads" bucket
3. Delete them manually
4. Run the SQL again

### Still getting 403 error?

Check bucket is public:
```sql
SELECT id, name, public FROM storage.buckets WHERE name = 'user-uploads';
```

Should show: `public = true`

If not, make it public:
```sql
UPDATE storage.buckets SET public = true WHERE name = 'user-uploads';
```

### Want to verify policies exist?

Run this query:
```sql
SELECT policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
  AND bucket_id = 'user-uploads';
```

Should return 4 policies.

## Quick Links

- **SQL Editor**: https://supabase.com/dashboard/project/rrpmfmqzmtmfuyktltnz/sql/new
- **Storage Policies**: https://supabase.com/dashboard/project/rrpmfmqzmtmfuyktltnz/storage/policies
- **Storage Browser**: https://supabase.com/dashboard/project/rrpmfmqzmtmfuyktltnz/storage/buckets/user-uploads

## After Applying

Once the SQL is executed:
- ✅ Avatar uploads will work immediately
- ✅ No code changes needed
- ✅ No server restart needed
- ✅ Test right away!

---

**Need more help?** See detailed guide: [docs/FIX_AVATAR_RLS_ERROR.md](docs/FIX_AVATAR_RLS_ERROR.md)
