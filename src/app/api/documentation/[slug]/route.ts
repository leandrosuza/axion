import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/documentation/[slug] - Get documentation by slug (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const documentation = await prisma.api_documentation.findUnique({
      where: { slug, is_published: true },
      include: {
        api_modules: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            endpoint: true,
            method: true,
            price_per_query: true
          }
        }
      }
    })

    if (!documentation) {
      return NextResponse.json(
        { error: 'Documentation not found' },
        { status: 404 }
      )
    }

    // Increment view count
    await prisma.api_documentation.update({
      where: { id: documentation.id },
      data: { views: { increment: 1 } }
    })

    return NextResponse.json(documentation)
  } catch (error) {
    console.error('Error fetching documentation:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documentation' },
      { status: 500 }
    )
  }
}
