import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { randomBytes, randomUUID } from 'crypto'
import bcrypt from 'bcryptjs'
import { encryptApiKey } from '@/lib/utils/encryption'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch API keys from database
    const keys = await prisma.api_keys.findMany({
      where: { user_id: user.id },
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        name: true,
        key_preview: true,
        key_hash: true,
        key_encrypted: true,
        permissions: true,
        is_active: true,
        last_used_at: true,
        created_at: true,
      },
    })

    return NextResponse.json({ keys })
  } catch (error) {
    console.error('Error fetching API keys:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, permissions = 'read' } = body

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    // Get user's contractor_id, create contractor if doesn't exist
    let userProfile = await prisma.user.findUnique({
      where: { id: user.id },
      select: { contractor_id: true },
    })

    console.log('User profile found:', userProfile)

    // If user doesn't have contractor_id, create contractor
    if (!userProfile?.contractor_id) {
      console.log('User missing contractor_id, creating contractor...')

      // Generate unique CPF based on user ID
      const uniqueCpf = user.id.replace(/[^0-9]/g, '').substring(0, 11).padEnd(11, '0')

      // Get user email from Supabase auth
      const { data: { user: authUser } } = await supabase.auth.getUser()

      // Create contractor with required fields
      const contractor = await prisma.contractors.create({
        data: {
          id: randomUUID(),
          tenant_id: '00000000-0000-0000-0000-000000000000', // Default tenant
          type: 'individual',
          name: authUser?.user_metadata?.full_name || authUser?.email || 'User',
          email: authUser?.email || `user-${user.id}@example.com`,
          cpf_cnpj: uniqueCpf,
          updated_at: new Date(),
        }
      })

      console.log('Contractor created:', contractor.id)

      // Update user with contractor_id
      await prisma.user.update({
        where: { id: user.id },
        data: { contractor_id: contractor.id }
      })

      // Refresh user profile
      userProfile = await prisma.user.findUnique({
        where: { id: user.id },
        select: { contractor_id: true },
      })

      console.log('User updated with contractor_id:', userProfile?.contractor_id)
    }

    if (!userProfile?.contractor_id) {
      console.error('Failed to get or create contractor_id for user:', user.id)
      return NextResponse.json(
        { error: 'Failed to initialize user profile. Please try again.' },
        { status: 500 }
      )
    }

    // Generate API key: bdc_ + 64 hex characters
    const keySecret = randomBytes(32).toString('hex')
    const fullKey = `bdc_${keySecret}`

    // Create preview (first 8 and last 4 characters)
    const keyPreview = `${fullKey.substring(0, 12)}...${fullKey.substring(fullKey.length - 4)}`

    // Hash the key for storage
    const keyHash = await bcrypt.hash(fullKey, 10)

    // Encrypt the full key for one-time display
    const keyEncrypted = encryptApiKey(fullKey)

    console.log('Creating API key for user:', user.id, 'contractor:', userProfile.contractor_id)

    // Create the API key in database
    const apiKey = await prisma.api_keys.create({
      data: {
        user_id: user.id,
        contractor_id: userProfile.contractor_id,
        name,
        key_preview: keyPreview,
        key_hash: keyHash,
        key_encrypted: keyEncrypted,
        permissions: permissions === 'full' ? 'full' : 'read',
        is_active: true,
      },
      select: {
        id: true,
        name: true,
        key_preview: true,
        key_hash: true,
        key_encrypted: true,
        permissions: true,
        is_active: true,
        last_used_at: true,
        created_at: true,
      },
    })

    console.log('API key created successfully:', apiKey.id)

    return NextResponse.json({
      key: apiKey,
      full_key: fullKey, // Only returned once!
    })
  } catch (error: any) {
    console.error('Error creating API key:', error)
    console.error('Error stack:', error?.stack)
    console.error('Error message:', error?.message)
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message },
      { status: 500 }
    )
  }
}
