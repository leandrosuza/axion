import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

// GET - List all modules (admin only)
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true }
    })

    if (dbUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const status = searchParams.get('status')

    const modules = await prisma.api_modules.findMany({
      where: {
        ...(category && { category }),
        ...(status && { status }),
      },
      orderBy: [
        { category: 'asc' },
        { display_order: 'asc' },
        { name: 'asc' }
      ],
      include: {
        _count: {
          select: { contractor_modules: true, module_usage_logs: true }
        }
      }
    })

    return NextResponse.json(modules)
  } catch (error: any) {
    console.error('Error fetching modules:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Create new module (admin only)
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true }
    })

    if (dbUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      slug,
      description,
      long_description,
      category,
      icon,
      endpoint,
      method = 'GET',
      status = 'active',
      is_visible = true,
      is_premium = false,
      price_per_query = 1,
      rate_limit_minute = 60,
      rate_limit_day = 1000,
      documentation_url,
      example_request,
      example_response,
      required_fields,
      response_fields,
      tags = [],
      display_order = 0
    } = body

    if (!name || !slug || !category || !endpoint) {
      return NextResponse.json(
        { error: 'Name, slug, category, and endpoint are required' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existingModule = await prisma.api_modules.findUnique({
      where: { slug }
    })

    if (existingModule) {
      return NextResponse.json(
        { error: 'A module with this slug already exists' },
        { status: 400 }
      )
    }

    const module = await prisma.api_modules.create({
      data: {
        id: randomUUID(),
        name,
        slug,
        description,
        long_description,
        category,
        icon,
        endpoint,
        method,
        status,
        is_visible,
        is_premium,
        price_per_query,
        rate_limit_minute,
        rate_limit_day,
        documentation_url,
        example_request,
        example_response,
        required_fields,
        response_fields,
        tags,
        display_order
      }
    })

    return NextResponse.json(module, { status: 201 })
  } catch (error: any) {
    console.error('Error creating module:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
