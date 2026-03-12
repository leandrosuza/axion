/**
 * Script to verify Supabase Storage bucket setup
 *
 * Run with: npx tsx scripts/verify-storage-setup.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function verifyStorageSetup() {
  console.log('🔍 Verifying Supabase Storage setup...\n')

  try {
    // 1. Check if bucket exists
    console.log('1️⃣ Checking if "user-uploads" bucket exists...')
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      console.error('   ❌ Error listing buckets:', bucketsError.message)
      return false
    }

    const userUploadsBucket = buckets?.find(b => b.name === 'user-uploads')

    if (!userUploadsBucket) {
      console.error('   ❌ Bucket "user-uploads" not found!')
      console.log('   💡 Create it in Supabase Dashboard or run the migration SQL')
      return false
    }

    console.log('   ✅ Bucket "user-uploads" exists')
    console.log(`   📊 Bucket details:`)
    console.log(`      - ID: ${userUploadsBucket.id}`)
    console.log(`      - Public: ${userUploadsBucket.public ? '✓' : '✗ (should be public)'}`)
    console.log(`      - Created: ${userUploadsBucket.created_at}`)

    if (!userUploadsBucket.public) {
      console.warn('   ⚠️  Bucket is not public. Avatar URLs may not be accessible!')
    }

    // 2. Test upload capability
    console.log('\n2️⃣ Testing upload capability...')

    const testFileName = `avatars/test-${Date.now()}.txt`
    const testContent = 'This is a test file for avatar upload verification'

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('user-uploads')
      .upload(testFileName, testContent, {
        contentType: 'text/plain',
        upsert: false,
      })

    if (uploadError) {
      console.error('   ❌ Upload failed:', uploadError.message)
      console.log('   💡 Check if RLS policies allow uploads')
      return false
    }

    console.log('   ✅ Upload successful')
    console.log(`      - Path: ${uploadData.path}`)

    // 3. Test public URL access
    console.log('\n3️⃣ Testing public URL generation...')

    const { data: urlData } = supabase.storage
      .from('user-uploads')
      .getPublicUrl(testFileName)

    console.log('   ✅ Public URL generated')
    console.log(`      - URL: ${urlData.publicUrl}`)

    // 4. Test file listing
    console.log('\n4️⃣ Testing file listing in avatars folder...')

    const { data: files, error: listError } = await supabase.storage
      .from('user-uploads')
      .list('avatars', {
        limit: 10,
        sortBy: { column: 'created_at', order: 'desc' },
      })

    if (listError) {
      console.error('   ❌ List failed:', listError.message)
    } else {
      console.log(`   ✅ Found ${files?.length || 0} file(s) in avatars folder`)
      if (files && files.length > 0) {
        console.log('   📁 Recent files:')
        files.slice(0, 5).forEach(file => {
          console.log(`      - ${file.name} (${(file.metadata?.size || 0 / 1024).toFixed(2)} KB)`)
        })
      }
    }

    // 5. Cleanup test file
    console.log('\n5️⃣ Cleaning up test file...')

    const { error: deleteError } = await supabase.storage
      .from('user-uploads')
      .remove([testFileName])

    if (deleteError) {
      console.error('   ❌ Delete failed:', deleteError.message)
      console.log('   💡 You may need to manually delete:', testFileName)
    } else {
      console.log('   ✅ Test file deleted')
    }

    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('✅ Storage setup verification complete!')
    console.log('='.repeat(60))
    console.log('\n📝 Next steps:')
    console.log('   1. Ensure bucket is marked as PUBLIC')
    console.log('   2. Apply RLS policies from: supabase/migrations/create_user_uploads_bucket.sql')
    console.log('   3. Test avatar upload in the app: /dashboard/settings')
    console.log('')

    return true

  } catch (error) {
    console.error('\n❌ Unexpected error:', error)
    return false
  }
}

// Run verification
verifyStorageSetup()
  .then(success => {
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
