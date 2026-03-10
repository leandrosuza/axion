/**
 * Setup Supabase Storage Bucket for Avatar Uploads
 *
 * This script creates the 'user-uploads' bucket in Supabase Storage
 * and configures it for public access.
 *
 * Run with: npx tsx scripts/setup-storage-bucket.ts
 */

import { createClient } from '@supabase/supabase-js'

async function setupStorageBucket() {
  console.log('🚀 Setting up Supabase Storage bucket for avatars...\n')

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables:')
    console.error('   - NEXT_PUBLIC_SUPABASE_URL')
    console.error('   - SUPABASE_SERVICE_ROLE_KEY')
    console.error('\nMake sure these are set in your .env file')
    process.exit(1)
  }

  // Create Supabase client with service role key
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  try {
    // Check if bucket already exists
    console.log('📦 Checking if bucket exists...')
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      console.error('❌ Error listing buckets:', listError.message)
      process.exit(1)
    }

    const bucketExists = buckets?.some(bucket => bucket.name === 'user-uploads')

    if (bucketExists) {
      console.log('✅ Bucket "user-uploads" already exists!')

      // Get bucket details
      const existingBucket = buckets?.find(bucket => bucket.name === 'user-uploads')
      console.log(`\nBucket details:`)
      console.log(`  - Name: ${existingBucket?.name}`)
      console.log(`  - Public: ${existingBucket?.public ? '✅ Yes' : '❌ No'}`)
      console.log(`  - Created: ${existingBucket?.created_at}`)

      if (!existingBucket?.public) {
        console.log('\n⚠️  Warning: Bucket is not public!')
        console.log('   Avatar URLs may not be accessible.')
        console.log('   You can make it public in the Supabase Dashboard:')
        console.log('   Storage → user-uploads → Settings → Make bucket public')
      }

      return
    }

    // Create the bucket
    console.log('📦 Creating "user-uploads" bucket...')
    const { data: createData, error: createError } = await supabase.storage.createBucket('user-uploads', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    })

    if (createError) {
      console.error('❌ Error creating bucket:', createError.message)
      process.exit(1)
    }

    console.log('✅ Bucket "user-uploads" created successfully!')
    console.log('\nBucket configuration:')
    console.log('  - Public access: ✅ Enabled')
    console.log('  - Max file size: 5MB')
    console.log('  - Allowed types: image/*')
    console.log('  - Path: avatars/{userId}-{timestamp}.{ext}')

    // Try to create the avatars folder
    console.log('\n📁 Creating avatars folder...')
    const dummyFile = new Blob([''], { type: 'text/plain' })
    const { error: uploadError } = await supabase.storage
      .from('user-uploads')
      .upload('avatars/.keep', dummyFile, {
        upsert: true,
      })

    if (uploadError) {
      console.log('⚠️  Could not create avatars folder:', uploadError.message)
      console.log('   (This is optional - folder will be created on first upload)')
    } else {
      console.log('✅ Avatars folder created')
    }

    console.log('\n🎉 Setup complete! Avatar uploads are now ready to use.')
    console.log('\nYou can now:')
    console.log('  1. Run: npm run dev')
    console.log('  2. Go to Settings → Profile')
    console.log('  3. Upload an avatar image')
    console.log('  4. See it appear in the header!')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  }
}

// Run the setup
setupStorageBucket()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
