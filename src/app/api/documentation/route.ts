import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/documentation - List all published documentation
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const moduleId = searchParams.get('module_id')
    const featured = searchParams.get('featured')

    const where: any = { is_published: true }
    if (category) where.category = category
    if (moduleId) where.module_id = moduleId
    if (featured === 'true') where.is_featured = true

    const documentation = await prisma.api_documentation.findMany({
      where,
      include: {
        api_modules: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      orderBy: [
        { is_featured: 'desc' },
        { category: 'asc' },
        { order: 'asc' },
        { title: 'asc' }
      ]
    })

    // Group by category
    const grouped = documentation.reduce((acc, doc) => {
      if (!acc[doc.category]) {
        acc[doc.category] = []
      }
      acc[doc.category].push(doc)
      return acc
    }, {} as Record<string, any[]>)

    const categories = Object.keys(grouped).map(category => ({
      name: category,
      count: grouped[category].length
    }))

    return NextResponse.json({
      documentation,
      grouped,
      categories
    })
  } catch (error) {
    console.error('Error fetching documentation:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documentation' },
      { status: 500 }
    )
  }
}
