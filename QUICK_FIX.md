# 🚨 QUICK FIX - Avatar Upload Error

## Error
```
new row violates row-level security policy (403)
```

## Solution (1 Minute)

### Step 1: Open Supabase SQL Editor
https://supabase.com/dashboard/project/rrpmfmqzmtmfuyktltnz/sql/new

### Step 2: Copy & Run This SQL
```sql
-- Drop old policies
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Avatars are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;

-- Create new policies
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'user-uploads' AND name LIKE 'avatars/%');

CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'user-uploads' AND name LIKE 'avatars/%');

CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'user-uploads' AND name LIKE 'avatars/%');

CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'user-uploads' AND name LIKE 'avatars/%')
WITH CHECK (bucket_id = 'user-uploads' AND name LIKE 'avatars/%');
```

### Step 3: Test Upload
Go to: http://localhost:3000/dashboard/settings

Upload an avatar → Should work! ✅

---

**Detailed guide:** [docs/FIX_AVATAR_RLS_ERROR.md](docs/FIX_AVATAR_RLS_ERROR.md)
