import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET - Get single module
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true }
    })

    if (dbUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const module = await prisma.api_modules.findUnique({
      where: { id },
      include: {
        _count: {
          select: { contractor_modules: true, module_usage_logs: true }
        }
      }
    })

    if (!module) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 })
    }

    return NextResponse.json(module)
  } catch (error: any) {
    console.error('Error fetching module:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Update module
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
    } = body

    // Check if slug already exists (if changed)
    if (slug) {
      const existingModule = await prisma.api_modules.findFirst({
        where: {
          slug,
          NOT: { id }
        }
      })

      if (existingModule) {
        return NextResponse.json(
          { error: 'A module with this slug already exists' },
          { status: 400 }
        )
      }
    }

    const module = await prisma.api_modules.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description }),
        ...(long_description !== undefined && { long_description }),
        ...(category !== undefined && { category }),
        ...(icon !== undefined && { icon }),
        ...(endpoint !== undefined && { endpoint }),
        ...(method !== undefined && { method }),
        ...(status !== undefined && { status }),
        ...(is_visible !== undefined && { is_visible }),
        ...(is_premium !== undefined && { is_premium }),
        ...(price_per_query !== undefined && { price_per_query }),
        ...(rate_limit_minute !== undefined && { rate_limit_minute }),
        ...(rate_limit_day !== undefined && { rate_limit_day }),
        ...(documentation_url !== undefined && { documentation_url }),
        ...(example_request !== undefined && { example_request }),
        ...(example_response !== undefined && { example_response }),
        ...(required_fields !== undefined && { required_fields }),
        ...(response_fields !== undefined && { response_fields }),
        ...(tags !== undefined && { tags }),
        ...(display_order !== undefined && { display_order }),
      }
    })

    return NextResponse.json(module)
  } catch (error: any) {
    console.error('Error updating module:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Delete module
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true }
    })

    if (dbUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    await prisma.api_modules.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting module:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
