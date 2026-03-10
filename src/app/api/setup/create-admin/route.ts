import { createClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

const ADMIN_EMAIL = 'admin@bigdatacorp.com'
const ADMIN_PASSWORD = 'Admin@123456'
const ADMIN_NAME = 'System Administrator'

// This endpoint creates an admin user - should be disabled in production after first use
export async function POST(request: Request) {
  try {
    // Check for setup secret to prevent unauthorized access
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')

    // Use a simple secret check - in production you'd want something more secure
    if (secret !== 'setup-bigdatacorp-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Creating admin user...')

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Missing Supabase configuration' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Check if admin already exists in Supabase Auth
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingAuthUser = existingUsers?.users?.find(u => u.email === ADMIN_EMAIL)

    let authUserId: string

    if (existingAuthUser) {
      console.log('Admin user already exists in Supabase Auth')
      authUserId = existingAuthUser.id
    } else {
      // Create admin user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
      })

      if (authError || !authData.user) {
        return NextResponse.json({ error: `Failed to create auth user: ${authError?.message}` }, { status: 500 })
      }

      console.log('Created admin user in Supabase Auth')
      authUserId = authData.user.id
    }

    // Check if user exists in database
    const existingDbUser = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
    })

    if (existingDbUser) {
      if (existingDbUser.role !== 'admin') {
        await prisma.user.update({
          where: { email: ADMIN_EMAIL },
          data: { role: 'admin' },
        })
        return NextResponse.json({
          success: true,
          message: 'Updated existing user to admin role',
          credentials: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD }
        })
      }
      return NextResponse.json({
        success: true,
        message: 'Admin user already exists',
        credentials: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD }
      })
    }

    // Create or get default tenant
    const tenantId = randomUUID()
    const tenant = await prisma.tenants.upsert({
      where: { slug: 'default' },
      update: {},
      create: {
        id: tenantId,
        name: 'Default Tenant',
        slug: 'default',
        status: 'active',
        updated_at: new Date(),
      },
    })

    // Create contractor for admin
    const contractorId = randomUUID()

    // Check if contractor with this cpf_cnpj already exists
    const existingContractor = await prisma.contractors.findUnique({
      where: { cpf_cnpj: '00000000000' },
    })

    let contractor
    if (existingContractor) {
      contractor = existingContractor
    } else {
      contractor = await prisma.contractors.create({
        data: {
          id: contractorId,
          tenant_id: tenant.id,
          type: 'individual',
          name: ADMIN_NAME,
          cpf_cnpj: '00000000000',
          email: ADMIN_EMAIL,
          status: 'active',
          updated_at: new Date(),
        },
      })
    }

    // Create the admin user in database
    await prisma.user.create({
      data: {
        id: authUserId,
        email: ADMIN_EMAIL,
        full_name: ADMIN_NAME,
        role: 'admin',
        status: 'active',
        tenant_id: tenant.id,
        contractor_id: contractor.id,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      credentials: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD }
    })

  } catch (error: any) {
    console.error('Error creating admin user:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST request with ?secret=setup-bigdatacorp-2024 to create admin user'
  })
}
