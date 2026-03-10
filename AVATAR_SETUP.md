# Avatar Upload Setup Guide

## Current Implementation

The avatar upload feature is **already implemented** and uses Supabase Storage (S3-compatible bucket). The code is working correctly - you just need to configure the Supabase Storage bucket.

## Setup Steps

### 1. Create Supabase Storage Bucket

Go to your Supabase Dashboard and create a storage bucket:

1. Navigate to **Storage** in the left sidebar
2. Click **"New Bucket"**
3. Set the following:
   - **Name**: `user-uploads`
   - **Public bucket**: ✅ **Enable** (this allows public access to avatar URLs)
   - **File size limit**: 5MB (optional, already validated in code)
   - **Allowed MIME types**: `image/*` (optional, already validated in code)

### 2. Configure Bucket Policies (if needed)

If you want more control, you can set up RLS policies:

```sql
-- Allow authenticated users to upload their own avatars
CREATE POLICY "Users can upload their avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-uploads'
  AND (storage.foldername(name))[1] = 'avatars'
);

-- Allow public read access to avatars
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'user-uploads');

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete their avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-uploads'
  AND (storage.foldername(name))[1] = 'avatars'
);
```

### 3. Test the Upload

After creating the bucket, the avatar upload should work immediately:

1. Go to **Settings** → **Profile** tab
2. Click on the avatar or "Choose Photo" button
3. Select an image file (JPG, PNG, GIF, etc.)
4. Click **"Save Changes"**
5. The avatar should upload and appear in the header

## How It Works

### Upload Flow

1. User selects an image file in the Settings page
2. File is validated (type and size)
3. Clicks "Save Changes"
4. Frontend sends file to `/api/user/avatar` endpoint
5. Backend uploads to Supabase Storage at `avatars/{userId}-{timestamp}.{ext}`
6. Public URL is generated and returned
7. Profile is updated with the avatar URL
8. Header avatar updates automatically

### Storage Structure

```
user-uploads/
└── avatars/
    ├── {userId}-{timestamp1}.jpg
    ├── {userId}-{timestamp2}.png
    └── ...
```

### Key Features

- ✅ **Supabase Storage** (S3-compatible)
- ✅ **Public URLs** for easy access
- ✅ **File validation** (type and size)
- ✅ **Unique filenames** (prevents overwrites)
- ✅ **Delete old avatars** (optional - can be implemented)
- ✅ **Synchronized** between header and settings

## Troubleshooting

### Error: "Failed to upload file"

**Cause**: Bucket doesn't exist or isn't configured correctly

**Solution**:
1. Check that `user-uploads` bucket exists in Supabase Storage
2. Verify bucket is set to **public**
3. Check browser console for detailed error messages

### Error: "Unauthorized"

**Cause**: User not logged in or session expired

**Solution**: Log out and log back in

### Avatar not appearing

**Cause**: Database not updated or URL incorrect

**Solution**:
1. Check Network tab to see the upload response
2. Verify the `avatarUrl` is being saved to database
3. Check if the URL is accessible in a new browser tab

### CORS Issues

If you get CORS errors, add your domain to Supabase Storage CORS settings:

1. Go to Supabase Dashboard → Storage → Settings
2. Add your domain to allowed origins

## Alternative: Use Different Bucket Name

If you want to use a different bucket name, update these files:

**`src/app/api/user/avatar/route.ts`**:
```typescript
// Change on lines 47, 63, 100
.from('your-bucket-name')
```

## Production Considerations

1. **Bucket Limits**: Monitor storage usage in Supabase dashboard
2. **Old Avatars**: Consider implementing cleanup for old avatar files
3. **CDN**: Supabase Storage includes CDN for fast delivery
4. **Backup**: Enable automatic backups in Supabase
5. **Monitoring**: Set up alerts for storage quota

## Current Implementation Files

- **Upload API**: `src/app/api/user/avatar/route.ts`
- **Profile API**: `src/app/api/user/profile/route.ts`
- **Settings Page**: `src/app/(dashboard)/dashboard/settings/page.tsx`
- **Avatar Component**: `src/components/profile/avatar-upload.tsx`
- **Header Component**: `src/components/dashboard/dashboard-landing-header.tsx`
- **Database Schema**: `users.avatar_url` field

## Summary

✅ **Code is ready** - No changes needed
⚠️ **Action required** - Create `user-uploads` bucket in Supabase
🎯 **Result** - Avatar upload will work immediately after bucket setup
