# Avatar Storage Setup Guide

## Overview

The avatar upload feature uses **Supabase Storage**, which is backed by **S3-compatible object storage**. This means your avatars are stored in a scalable, secure cloud storage system.

## Architecture

```
User Avatar Upload Flow:
1. User selects image in Settings/Profile page
2. Frontend validates file (type, size)
3. POST /api/user/avatar - uploads to Supabase Storage
4. Supabase Storage stores in S3 bucket: user-uploads/avatars/{userId}-{timestamp}.{ext}
5. Returns public URL
6. PUT /api/user/profile - saves avatar URL to database (users.avatar_url)
7. Avatar displayed throughout the app
```

## Supabase Storage Configuration

### Storage Bucket: `user-uploads`

**Bucket Settings:**
- **Name:** `user-uploads`
- **Public Access:** Enabled (for avatar URLs)
- **Max File Size:** 5MB
- **Allowed MIME Types:**
  - image/jpeg
  - image/jpg
  - image/png
  - image/gif
  - image/webp

### Folder Structure

```
user-uploads/
└── avatars/
    ├── {userId}-{timestamp}.jpg
    ├── {userId}-{timestamp}.png
    └── ...
```

## Setup Instructions

### Step 1: Run the Migration

Apply the SQL migration to create the bucket and set up policies:

```bash
# Using Supabase CLI (recommended)
supabase db push

# Or apply manually in Supabase Dashboard:
# Go to SQL Editor and run: supabase/migrations/create_user_uploads_bucket.sql
```

### Step 2: Verify Bucket in Dashboard

1. Go to: https://supabase.com/dashboard/project/rrpmfmqzmtmfuyktltnz/storage/buckets
2. Confirm `user-uploads` bucket exists
3. Check that it's marked as "Public"
4. Verify bucket policies are active

### Step 3: Test Upload

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to: http://localhost:3000/dashboard/settings

3. Go to the Profile tab

4. Upload a test avatar image:
   - Click "Choose Photo" or drag & drop
   - Select an image (JPG, PNG, GIF, or WebP)
   - Max 5MB
   - Click "Save Changes"

5. Verify:
   - Avatar appears in the profile card
   - No console errors
   - Avatar URL is saved to database
   - Avatar persists after page refresh

## Storage Policies (RLS)

The following Row Level Security policies are applied:

### Policy 1: Upload (INSERT)
- **Who:** Authenticated users
- **What:** Can upload files to avatars/ folder
- **Why:** Users need to upload their profile pictures

### Policy 2: Read (SELECT)
- **Who:** Public (anyone)
- **What:** Can view all files in avatars/ folder
- **Why:** Avatar images need to be publicly accessible for display

### Policy 3: Delete (DELETE)
- **Who:** Authenticated users
- **What:** Can delete files in avatars/ folder
- **Why:** Users can remove old avatars, cleanup during profile updates

### Policy 4: Update (UPDATE)
- **Who:** Authenticated users
- **What:** Can update files in avatars/ folder
- **Why:** Replace existing avatars

## API Endpoints

### POST /api/user/avatar
Uploads avatar to Supabase Storage.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: { avatar: File }

**Response:**
```json
{
  "success": true,
  "avatarUrl": "https://rrpmfmqzmtmfuyktltnz.supabase.co/storage/v1/object/public/user-uploads/avatars/user-id-123456789.jpg",
  "path": "avatars/user-id-123456789.jpg"
}
```

### DELETE /api/user/avatar
Deletes avatar from Supabase Storage.

**Request:**
- Method: DELETE
- Query: ?path=avatars/user-id-123456789.jpg

**Response:**
```json
{
  "success": true
}
```

## Database Schema

The avatar URL is stored in the `users` table:

```sql
-- users table (Prisma schema)
model User {
  id         String   @id
  email      String   @unique
  full_name  String
  avatar_url String?  -- Stores the Supabase Storage public URL
  ...
}
```

## Troubleshooting

### Issue: "Failed to upload file"

**Possible causes:**
1. Bucket doesn't exist
   - **Solution:** Run the migration SQL script

2. Incorrect bucket policies
   - **Solution:** Verify policies in Supabase Dashboard > Storage > Policies

3. File too large (>5MB)
   - **Solution:** Compress image or choose smaller file

4. Invalid file type
   - **Solution:** Use JPG, PNG, GIF, or WebP

### Issue: Avatar not displaying

**Possible causes:**
1. Bucket not public
   - **Solution:** Make bucket public in Supabase Dashboard

2. CORS issues
   - **Solution:** Verify CORS settings in Supabase Storage

3. Broken URL in database
   - **Solution:** Check `users.avatar_url` field value

### Issue: "Unauthorized" error

**Possible causes:**
1. User not authenticated
   - **Solution:** Verify Supabase session exists

2. RLS policies not applied
   - **Solution:** Run migration script to create policies

## Security Considerations

1. **File Validation:**
   - Client-side: Type and size validation
   - Server-side: Duplicate validation for security

2. **Access Control:**
   - Only authenticated users can upload
   - Public read for avatar display
   - Users can only delete avatars (not other files)

3. **Storage Limits:**
   - 5MB per file (configurable)
   - Supabase free tier: 1GB total storage
   - Consider cleanup strategy for old avatars

4. **File Naming:**
   - Pattern: `{userId}-{timestamp}.{ext}`
   - Prevents collisions
   - Timestamp allows multiple uploads

## Environment Variables

Required in `.env`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://rrpmfmqzmtmfuyktltnz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Production Checklist

- [ ] Supabase Storage bucket created
- [ ] Bucket is public
- [ ] RLS policies applied
- [ ] CORS configured (if needed)
- [ ] File size limits enforced
- [ ] Old avatar cleanup strategy (optional)
- [ ] CDN configured (optional, for better performance)
- [ ] Monitoring/logging enabled
- [ ] Backup strategy for critical avatars (optional)

## Additional Resources

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Supabase Storage RLS](https://supabase.com/docs/guides/storage/security/access-control)
- [S3-Compatible Storage](https://supabase.com/docs/guides/storage/s3)
