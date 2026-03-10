import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/documentation/[id] - Get single documentation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const documentation = await prisma.api_documentation.findUnique({
      where: { id },
      include: {
        api_modules: {
          select: { id: true, name: true, slug: true }
        }
      }
    })

    if (!documentation) {
      return NextResponse.json(
        { error: 'Documentation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(documentation)
  } catch (error) {
    console.error('Error fetching documentation:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documentation' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/documentation/[id] - Update documentation
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
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

    // Check if documentation exists
    const existing = await prisma.api_documentation.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Documentation not found' },
        { status: 404 }
      )
    }

    // Check if slug already exists (excluding current doc)
    if (slug && slug !== existing.slug) {
      const slugExists = await prisma.api_documentation.findUnique({
        where: { slug }
      })

      if (slugExists) {
        return NextResponse.json(
          { error: 'Slug already exists' },
          { status: 400 }
        )
      }
    }

    const documentation = await prisma.api_documentation.update({
      where: { id },
      data: {
        module_id: module_id !== undefined ? module_id : existing.module_id,
        title: title || existing.title,
        slug: slug || existing.slug,
        content: content || existing.content,
        description: description !== undefined ? description : existing.description,
        category: category || existing.category,
        order: order !== undefined ? order : existing.order,
        is_published: is_published !== undefined ? is_published : existing.is_published,
        is_featured: is_featured !== undefined ? is_featured : existing.is_featured,
        tags: tags !== undefined ? tags : existing.tags
      },
      include: {
        api_modules: {
          select: { id: true, name: true, slug: true }
        }
      }
    })

    return NextResponse.json(documentation)
  } catch (error) {
    console.error('Error updating documentation:', error)
    return NextResponse.json(
      { error: 'Failed to update documentation' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/documentation/[id] - Delete documentation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    await prisma.api_documentation.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting documentation:', error)
    return NextResponse.json(
      { error: 'Failed to delete documentation' },
      { status: 500 }
    )
  }
}
