/**
 * Script to create an admin user
 * Usage: npx tsx scripts/create-admin.ts
 */

import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

const ADMIN_EMAIL = 'admin@bigdatacorp.com'
const ADMIN_PASSWORD = 'Admin@123456' // Change this after first login!
const ADMIN_NAME = 'System Administrator'

async function createAdminUser() {
  try {
    console.log('Creating admin user...')

    // Initialize Supabase admin client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables')
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
        throw new Error(`Failed to create auth user: ${authError?.message}`)
      }

      console.log('Created admin user in Supabase Auth')
      authUserId = authData.user.id
    }

    // Check if user exists in database
    const existingDbUser = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
    })

    if (existingDbUser) {
      // Update to admin if not already
      if (existingDbUser.role !== 'admin') {
        await prisma.user.update({
          where: { email: ADMIN_EMAIL },
          data: { role: 'admin' },
        })
        console.log('Updated existing user to admin role')
      } else {
        console.log('Admin user already exists in database')
      }
    } else {
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
      console.log('Tenant ready:', tenant.id)

      // Create contractor for admin
      const contractorId = randomUUID()
      const contractor = await prisma.contractors.create({
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
      console.log('Contractor created:', contractor.id)

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
      console.log('Created admin user in database')
    }

    console.log('\nAdmin user created successfully!')
    console.log('----------------------------------------')
    console.log(`Email:    ${ADMIN_EMAIL}`)
    console.log(`Password: ${ADMIN_PASSWORD}`)
    console.log('----------------------------------------')
    console.log('IMPORTANT: Change the password after first login!')
    console.log('\n')
  } catch (error) {
    console.error('Error creating admin user:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()
