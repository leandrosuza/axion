/**
 * Test script to verify avatar upload configuration
 * Run with: npx tsx scripts/test-avatar-upload.ts
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

console.log('🔍 Testing Avatar Upload Configuration...\n')

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

console.log('1️⃣ Checking environment variables...')
console.log(`   NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅' : '❌'} ${supabaseUrl}`)
console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? '✅' : '❌'} ${supabaseServiceKey?.substring(0, 20)}...`)

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('\n❌ Missing environment variables!')
  process.exit(1)
}

console.log('\n2️⃣ Creating Supabase admin client...')
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})
console.log('   ✅ Client created')

async function testUpload() {
  try {
    console.log('\n3️⃣ Testing bucket access...')
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      console.error('   ❌ Error listing buckets:', bucketsError)
      return false
    }

    const userUploadsBucket = buckets?.find(b => b.name === 'user-uploads')
    if (!userUploadsBucket) {
      console.error('   ❌ Bucket "user-uploads" not found!')
      console.log('   📝 Available buckets:', buckets?.map(b => b.name).join(', '))
      return false
    }

    console.log('   ✅ Bucket "user-uploads" exists')
    console.log(`   📊 Public: ${userUploadsBucket.public}`)

    console.log('\n4️⃣ Testing file upload...')
    const testFileName = `avatars/test-${Date.now()}.txt`
    const testContent = 'Test avatar upload'

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('user-uploads')
      .upload(testFileName, testContent, {
        contentType: 'text/plain',
        upsert: false,
      })

    if (uploadError) {
      console.error('   ❌ Upload failed:', uploadError)
      return false
    }

    console.log('   ✅ Upload successful')
    console.log(`   📁 Path: ${uploadData.path}`)

    console.log('\n5️⃣ Testing public URL...')
    const { data: urlData } = supabase.storage
      .from('user-uploads')
      .getPublicUrl(testFileName)

    console.log('   ✅ Public URL generated')
    console.log(`   🔗 ${urlData.publicUrl}`)

    console.log('\n6️⃣ Cleaning up...')
    const { error: deleteError } = await supabase.storage
      .from('user-uploads')
      .remove([testFileName])

    if (deleteError) {
      console.error('   ⚠️ Cleanup failed:', deleteError)
    } else {
      console.log('   ✅ Test file deleted')
    }

    console.log('\n' + '='.repeat(60))
    console.log('✅ All tests passed! Avatar upload should work.')
    console.log('='.repeat(60))

    return true
  } catch (error) {
    console.error('\n❌ Unexpected error:', error)
    return false
  }
}

testUpload()
  .then(success => {
    if (success) {
      console.log('\n✅ Avatar upload is configured correctly!')
      console.log('Try uploading at: http://localhost:3000/dashboard/settings')
    } else {
      console.log('\n❌ Avatar upload has issues that need to be fixed')
    }
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
