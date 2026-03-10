import { createClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    console.log("📝 Registration API called");
    const body = await request.json()
    const { email, password, name, cpfCnpj, phone, accountType } = body
    console.log("📦 Request body:", { email, name, accountType });

    // Validation
    if (!email || !password || !name) {
      console.log("❌ Missing required fields");
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      console.log("❌ Password too short");
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Use service role to bypass email confirmation
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    console.log("🔐 Creating Supabase auth user...");

    // Create user with admin API (auto-confirms email)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        cpf_cnpj: cpfCnpj,
        phone,
        account_type: accountType,
      },
    })

    if (authError) {
      console.error("❌ Supabase auth error:", authError.message);
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      console.error("❌ No user data returned from Supabase");
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }

    console.log("✅ Supabase auth user created:", authData.user.id);
    
    // Note: User creation in database is disabled due to schema mismatch
    // The current database uses a different schema structure (multi-tenant with contractors)
    // User data is stored in Supabase Auth only
    console.log("💾 User stored in Supabase Auth (database sync disabled due to schema mismatch)");

    // Note: Subscription creation disabled - requires specific database schema
    console.log("📊 Subscription feature requires database schema update");

    console.log("🎉 Registration complete!");
    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
    })
  } catch (error: any) {
    console.error('❌ Registration error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
