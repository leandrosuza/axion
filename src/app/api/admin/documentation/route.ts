import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/documentation - List all documentation
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true }
    })

    if (userProfile?.role !== 'super-admin' && userProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const moduleId = searchParams.get('module_id')

    const where: any = {}
    if (category) where.category = category
    if (moduleId) where.module_id = moduleId

    const documentation = await prisma.api_documentation.findMany({
      where,
      include: {
        api_modules: {
          select: { id: true, name: true, slug: true }
        }
      },
      orderBy: [
        { category: 'asc' },
        { order: 'asc' },
        { title: 'asc' }
      ]
    })

    const categories = await prisma.api_documentation.groupBy({
      by: ['category'],
      _count: { id: true }
    })

    return NextResponse.json({
      documentation,
      categories: categories.map(c => ({
        name: c.category,
        count: c._count.id
      }))
    })
  } catch (error) {
    console.error('Error fetching documentation:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documentation' },
      { status: 500 }
    )
  }
}

// POST /api/admin/documentation - Create new documentation
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true }
    })

    if (userProfile?.role !== 'super-admin' && userProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      module_id,
      title,
      slug,
      content,
      description,
      category,
      order,
      is_published,
      is_featured,
      tags
    } = body

    // Validate required fields
    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: 'Title, slug, and content are required' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existing = await prisma.api_documentation.findUnique({
      where: { slug }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 400 }
      )
    }

    const documentation = await prisma.api_documentation.create({
      data: {
        module_id: module_id || null,
        title,
        slug,
        content,
        description: description || null,
        category: category || 'General',
        order: order || 0,
        is_published: is_published !== undefined ? is_published : true,
        is_featured: is_featured || false,
        tags: tags || []
      },
      include: {
        api_modules: {
          select: { id: true, name: true, slug: true }
        }
      }
    })

    return NextResponse.json(documentation, { status: 201 })
  } catch (error) {
    console.error('Error creating documentation:', error)
    return NextResponse.json(
      { error: 'Failed to create documentation' },
      { status: 500 }
    )
  }
}
