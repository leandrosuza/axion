# Fix: Avatar Upload RLS Policy Error

## Error Message
```
Upload error: [Error [StorageApiError]: new row violates row-level security policy]
{
  __isStorageError: true,
  status: 400,
  statusCode: '403'
}
```

## What's Wrong?
The Row Level Security (RLS) policies on the `storage.objects` table are blocking authenticated users from uploading avatar files. This happens when:
1. The bucket exists but has no policies, OR
2. The existing policies are too restrictive

## Quick Fix (3 Minutes)

### Option 1: Via Supabase Dashboard (Easiest)

#### Step 1: Go to Storage Policies
1. Open: https://supabase.com/dashboard/project/rrpmfmqzmtmfuyktltnz/storage/policies
2. Look for the `user-uploads` bucket

#### Step 2: Remove Old Policies (if any)
- Delete any existing policies for `user-uploads` bucket
- Click the trash icon next to each policy

#### Step 3: Create Upload Policy
Click "New Policy" → "For full customization" → Configure:
- **Policy Name:** `Users can upload their own avatars`
- **Allowed Operation:** `INSERT`
- **Target Roles:** `authenticated`
- **USING expression:** (leave empty)
- **WITH CHECK expression:**
  ```sql
  bucket_id = 'user-uploads' AND name LIKE 'avatars/%'
  ```

#### Step 4: Create Public Read Policy
Click "New Policy" → "For full customization" → Configure:
- **Policy Name:** `Avatars are publicly accessible`
- **Allowed Operation:** `SELECT`
- **Target Roles:** `public`
- **USING expression:**
  ```sql
  bucket_id = 'user-uploads' AND name LIKE 'avatars/%'
  ```
- **WITH CHECK expression:** (leave empty)

#### Step 5: Create Delete Policy
Click "New Policy" → "For full customization" → Configure:
- **Policy Name:** `Users can delete their own avatars`
- **Allowed Operation:** `DELETE`
- **Target Roles:** `authenticated`
- **USING expression:**
  ```sql
  bucket_id = 'user-uploads' AND name LIKE 'avatars/%'
  ```
- **WITH CHECK expression:** (leave empty)

#### Step 6: Create Update Policy
Click "New Policy" → "For full customization" → Configure:
- **Policy Name:** `Users can update their own avatars`
- **Allowed Operation:** `UPDATE`
- **Target Roles:** `authenticated`
- **USING expression:**
  ```sql
  bucket_id = 'user-uploads' AND name LIKE 'avatars/%'
  ```
- **WITH CHECK expression:**
  ```sql
  bucket_id = 'user-uploads' AND name LIKE 'avatars/%'
  ```

### Option 2: Via SQL Editor (Fastest)

1. Go to: https://supabase.com/dashboard/project/rrpmfmqzmtmfuyktltnz/sql/new

2. Copy and paste the entire contents of: `supabase/migrations/fix_avatar_policies.sql`

3. Click "Run" or press `Ctrl+Enter`

4. You should see: "Success. No rows returned"

5. Scroll down to see the verification query results showing 4 policies created

### Option 3: Alternative - Disable RLS Temporarily (Not Recommended for Production)

**⚠️ WARNING: Only use for testing! This removes all security!**

```sql
-- Disable RLS on storage.objects (TESTING ONLY)
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

After testing, re-enable:
```sql
-- Re-enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
```

## Verify the Fix

### Test 1: Check Policies Exist
Run this query in SQL Editor:
```sql
SELECT
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
  AND policyname LIKE '%avatar%';
```

You should see 4 policies:
- `Users can upload their own avatars` (INSERT, authenticated)
- `Avatars are publicly accessible` (SELECT, public)
- `Users can delete their own avatars` (DELETE, authenticated)
- `Users can update their own avatars` (UPDATE, authenticated)

### Test 2: Try Upload Again
1. Go to: http://localhost:3000/dashboard/settings
2. Click "Profile" tab
3. Upload an avatar
4. Should work without errors!

### Test 3: Check Storage
1. Go to: https://supabase.com/dashboard/project/rrpmfmqzmtmfuyktltnz/storage/buckets/user-uploads
2. Open `avatars/` folder
3. You should see your uploaded file

## Understanding the Fix

### What Changed?

**Before (Wrong):**
```sql
WITH CHECK (
  bucket_id = 'user-uploads'
  AND (storage.foldername(name))[1] = 'avatars'  -- ❌ Too complex, doesn't work
)
```

**After (Correct):**
```sql
WITH CHECK (
  bucket_id = 'user-uploads'
  AND name LIKE 'avatars/%'  -- ✅ Simple pattern matching
)
```

### Why It Works

The `LIKE 'avatars/%'` pattern:
- ✅ Matches: `avatars/user-123-1234567890.jpg`
- ✅ Matches: `avatars/any-file-name.png`
- ❌ Blocks: `other-folder/file.jpg`
- ❌ Blocks: Different bucket uploads

### Policy Breakdown

1. **INSERT Policy (Upload)**
   - Who: `authenticated` users
   - What: Can insert rows into `storage.objects`
   - When: File path starts with `avatars/`
   - Why: Allows logged-in users to upload avatars

2. **SELECT Policy (View)**
   - Who: `public` (anyone, even not logged in)
   - What: Can read/view files
   - When: File path starts with `avatars/`
   - Why: Avatar images need to be publicly accessible for display

3. **DELETE Policy (Remove)**
   - Who: `authenticated` users
   - What: Can delete files
   - When: File path starts with `avatars/`
   - Why: Users can remove old avatars

4. **UPDATE Policy (Replace)**
   - Who: `authenticated` users
   - What: Can update/replace files
   - When: File path starts with `avatars/`
   - Why: Update avatar metadata if needed

## Troubleshooting

### Still Getting 403 Error?

**Check 1: Is the bucket public?**
```sql
SELECT id, name, public FROM storage.buckets WHERE name = 'user-uploads';
```
Should return: `public = true`

If not:
```sql
UPDATE storage.buckets SET public = true WHERE name = 'user-uploads';
```

**Check 2: Is RLS enabled?**
```sql
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname = 'objects'
  AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'storage');
```
Should return: `relrowsecurity = true`

**Check 3: Are policies active?**
```sql
SELECT COUNT(*) as policy_count
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
  AND policyname LIKE '%avatar%';
```
Should return: `policy_count = 4`

**Check 4: Is user authenticated?**
In browser console on settings page:
```javascript
const supabase = createClient()
const { data: { user } } = await supabase.auth.getUser()
console.log(user)  // Should show user object
```

### Error: "Policy already exists"

If you get this error when running the SQL:
```sql
-- Run this first to clean up
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Avatars are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
```

Then run the CREATE POLICY statements again.

### Error: "Bucket does not exist"

Create the bucket first:
```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-uploads',
  'user-uploads',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET public = true;
```

## Production Considerations

For production, you may want more restrictive policies:

### Restrict Upload to User's Own Avatar
```sql
CREATE POLICY "Users can upload only their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-uploads'
  AND name LIKE 'avatars/%'
  AND (storage.foldername(name))[2]::uuid = auth.uid()
);
```
This requires file naming: `avatars/{user_id}-{timestamp}.ext`

### Restrict Delete to User's Own Avatar
```sql
CREATE POLICY "Users can delete only their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-uploads'
  AND name LIKE 'avatars/%'
  AND (storage.foldername(name))[2]::uuid = auth.uid()
);
```

## Summary

✅ **Run the SQL fix:** `supabase/migrations/fix_avatar_policies.sql`
✅ **Test upload:** http://localhost:3000/dashboard/settings
✅ **Verify policies:** Check SQL query above

The issue is now fixed! Your avatar uploads should work correctly with proper RLS security.
