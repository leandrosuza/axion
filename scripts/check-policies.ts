/**
 * Check current RLS policies on storage.objects
 * This will show what policies are actually applied in your Supabase database
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkPolicies() {
  console.log('🔍 Checking current RLS policies...\n')

  try {
    // Query to check policies
    const { data, error } = await supabase.rpc('exec_sql', {
      query: `
        SELECT
          schemaname,
          tablename,
          policyname,
          permissive,
          roles,
          cmd,
          qual,
          with_check
        FROM pg_policies
        WHERE tablename = 'objects'
          AND schemaname = 'storage';
      `
    })

    if (error) {
      console.error('❌ Error checking policies:', error)
      console.log('\n⚠️  RPC function not available. Trying alternate method...\n')

      // Alternative: Just check if we can list buckets
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

      if (bucketsError) {
        console.error('❌ Error:', bucketsError)
        return
      }

      console.log('📦 Available buckets:')
      buckets?.forEach(b => {
        console.log(`   - ${b.name} (public: ${b.public})`)
      })

      console.log('\n⚠️  Cannot check policies directly via API.')
      console.log('You MUST run the SQL manually in Supabase Dashboard.\n')
      console.log('Go to: https://supabase.com/dashboard/project/rrpmfmqzmtmfuyktltnz/sql/new')
      console.log('Then run the SQL from: supabase/migrations/fix_avatar_policies.sql\n')
      return
    }

    if (!data || data.length === 0) {
      console.log('❌ NO POLICIES FOUND on storage.objects table!')
      console.log('\nThis is why uploads are failing!\n')
      console.log('🔧 FIX: Run this SQL in Supabase Dashboard:')
      console.log('   https://supabase.com/dashboard/project/rrpmfmqzmtmfuyktltnz/sql/new\n')
      return
    }

    console.log(`✅ Found ${data.length} policies:\n`)
    data.forEach((policy: any) => {
      console.log(`Policy: ${policy.policyname}`)
      console.log(`  Operation: ${policy.cmd}`)
      console.log(`  Roles: ${policy.roles}`)
      console.log(`  Permissive: ${policy.permissive}`)
      console.log('')
    })

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkPolicies()
