import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET - List all visible modules (public API for marketplace)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const modules = await prisma.api_modules.findMany({
      where: {
        is_visible: true,
        status: { in: ['active', 'maintenance'] },
        ...(category && { category }),
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        long_description: true,
        category: true,
        icon: true,
        endpoint: true,
        method: true,
        status: true,
        is_premium: true,
        price_per_query: true,
        rate_limit_minute: true,
        rate_limit_day: true,
        documentation_url: true,
        example_request: true,
        example_response: true,
        required_fields: true,
        response_fields: true,
        tags: true,
        total_queries: true,
      },
      orderBy: [
        { category: 'asc' },
        { display_order: 'asc' },
        { name: 'asc' }
      ]
    })

    // Group by category
    const groupedModules = modules.reduce((acc, module) => {
      if (!acc[module.category]) {
        acc[module.category] = []
      }
      acc[module.category].push(module)
      return acc
    }, {} as Record<string, typeof modules>)

    return NextResponse.json({
      modules,
      grouped: groupedModules,
      categories: Object.keys(groupedModules),
      total: modules.length
    })
  } catch (error: any) {
    console.error('Error fetching modules:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
