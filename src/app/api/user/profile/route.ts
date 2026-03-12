import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch user profile from database
    let userProfile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        full_name: true,
        avatar_url: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        contractor_id: true,
      },
    })

    // If user doesn't exist in Prisma DB, create them with default tenant/contractor
    if (!userProfile) {
      const { randomUUID } = await import('crypto')

      // Create or get default tenant
      let tenant = await prisma.tenants.findUnique({
        where: { slug: 'default' }
      })

      if (!tenant) {
        const tenantId = randomUUID()
        tenant = await prisma.tenants.create({
          data: {
            id: tenantId,
            name: 'Default Tenant',
            slug: 'default',
            status: 'active',
            updated_at: new Date(),
          },
        })
      }

      // Create contractor with unique CPF based on user ID
      const contractorId = randomUUID()
      // Generate a unique placeholder CPF using the first 11 digits of the user ID (numbers only)
      const uniqueCpf = user.id.replace(/[^0-9]/g, '').substring(0, 11).padEnd(11, '0')

      const contractor = await prisma.contractors.create({
        data: {
          id: contractorId,
          tenant_id: tenant.id,
          type: 'individual',
          name: user.user_metadata?.full_name || user.email!.split('@')[0],
          cpf_cnpj: uniqueCpf, // Unique placeholder based on user ID
          email: user.email!,
          status: 'active',
          updated_at: new Date(),
        },
      })

      // Create the user
      userProfile = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || user.email!.split('@')[0],
          role: 'user',
          status: 'active',
          tenant_id: tenant.id,
          contractor_id: contractor.id,
        },
        select: {
          id: true,
          email: true,
          full_name: true,
          avatar_url: true,
          phone: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          contractor_id: true,
        },
      })
    }

    // Fetch contractor info to get CPF/CNPJ
    const contractor = userProfile.contractor_id
      ? await prisma.contractors.findUnique({
          where: { id: userProfile.contractor_id },
          select: { cpf_cnpj: true },
        })
      : null

    // Map to expected frontend format
    const mappedProfile = {
      id: userProfile.id,
      email: userProfile.email,
      name: userProfile.full_name,
      avatarUrl: userProfile.avatar_url,
      cpfCnpj: contractor?.cpf_cnpj || null,
      phone: userProfile.phone,
      accountType: userProfile.role,
      isAdmin: userProfile.role === 'admin',
      emailAlertsEnabled: true,
      usageAlertsEnabled: true,
      billingAlertsEnabled: true,
      securityAlertsEnabled: true,
      createdAt: userProfile.createdAt,
      updatedAt: userProfile.updatedAt,
    }

    return NextResponse.json(mappedProfile)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      phone,
      avatarUrl,
      cpfCnpj,
    } = body

    // Upsert user profile in database (create if doesn't exist, update if exists)
    // First check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: user.id }
    })

    let updatedUser

    if (!existingUser) {
      // User doesn't exist in Prisma DB, we need to create tenant and contractor first
      const { randomUUID } = await import('crypto')

      // Create or get default tenant
      let tenant = await prisma.tenants.findUnique({
        where: { slug: 'default' }
      })

      if (!tenant) {
        const tenantId = randomUUID()
        tenant = await prisma.tenants.create({
          data: {
            id: tenantId,
            name: 'Default Tenant',
            slug: 'default',
            status: 'active',
            updated_at: new Date(),
          },
        })
      }

      // Create contractor with unique CPF based on user ID
      const contractorId = randomUUID()
      // Generate a unique placeholder CPF using the first 11 digits of the user ID (numbers only)
      const uniqueCpf = user.id.replace(/[^0-9]/g, '').substring(0, 11).padEnd(11, '0')

      const contractor = await prisma.contractors.create({
        data: {
          id: contractorId,
          tenant_id: tenant.id,
          type: 'individual',
          name: name || user.user_metadata?.full_name || user.email!.split('@')[0],
          cpf_cnpj: uniqueCpf, // Unique placeholder based on user ID
          email: user.email!,
          phone: phone || null,
          status: 'active',
          updated_at: new Date(),
        },
      })

      // Now create the user
      updatedUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email!,
          full_name: name || user.user_metadata?.full_name || user.email!.split('@')[0],
          avatar_url: avatarUrl || null,
          phone: phone || null,
          role: 'user',
          status: 'active',
          tenant_id: tenant.id,
          contractor_id: contractor.id,
        },
        select: {
          id: true,
          email: true,
          full_name: true,
          avatar_url: true,
          phone: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          contractor_id: true,
        },
      })
    } else {
      // User exists, update them
      const updateData: Record<string, unknown> = {}
      if (name !== undefined) updateData.full_name = name
      if (phone !== undefined) updateData.phone = phone
      if (avatarUrl !== undefined) updateData.avatar_url = avatarUrl

      updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: updateData,
        select: {
          id: true,
          email: true,
          full_name: true,
          avatar_url: true,
          phone: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          contractor_id: true,
        },
      })

      // Update contractor's CPF/CNPJ if provided
      if (cpfCnpj !== undefined && updatedUser.contractor_id) {
        await prisma.contractors.update({
          where: { id: updatedUser.contractor_id },
          data: {
            cpf_cnpj: cpfCnpj || '00000000000',
            phone: phone || null,
            name: name || updatedUser.full_name,
            updated_at: new Date(),
          },
        })
      }
    }

    // Fetch contractor info to get CPF/CNPJ
    const contractor = updatedUser.contractor_id
      ? await prisma.contractors.findUnique({
          where: { id: updatedUser.contractor_id },
          select: { cpf_cnpj: true },
        })
      : null

    // Map to expected frontend format
    const mappedUpdatedUser = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.full_name,
      avatarUrl: updatedUser.avatar_url,
      cpfCnpj: contractor?.cpf_cnpj || null,
      phone: updatedUser.phone,
      accountType: updatedUser.role,
      isAdmin: updatedUser.role === 'admin',
      emailAlertsEnabled: true,
      usageAlertsEnabled: true,
      billingAlertsEnabled: true,
      securityAlertsEnabled: true,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    }

    return NextResponse.json(mappedUpdatedUser)
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
