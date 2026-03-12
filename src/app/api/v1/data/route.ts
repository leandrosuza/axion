import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey, checkAndDeductCredits, enforceRateLimit, logApiUsage } from '@/lib/utils/rate-limiter'

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  // Validate API key
  const authHeader = request.headers.get('authorization')
  const validation = await validateApiKey(authHeader)

  if (!validation.isValid) {
    return NextResponse.json(
      { error: validation.error || 'Unauthorized' },
      { status: 401 }
    )
  }

  // Check credits and deduct if needed
  const creditCheck = await checkAndDeductCredits(
    validation.userId!,
    '/api/v1/data',
    validation.planType!
  )

  if (!creditCheck.allowed) {
    const responseTime = Date.now() - startTime
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
    await logApiUsage(
      validation.userId!,
      validation.apiKeyId!,
      '/api/v1/data',
      'GET',
      creditCheck.response?.status || 402,
      responseTime,
      ipAddress
    )
    return creditCheck.response!
  }

  // Enforce rate limiting
  const rateLimitCheck = await enforceRateLimit(
    validation.userId!,
    validation.planType!
  )

  if (!rateLimitCheck.allowed) {
    // Log failed request
    const responseTime = Date.now() - startTime
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
    await logApiUsage(
      validation.userId!,
      validation.apiKeyId!,
      '/api/v1/data',
      'GET',
      429,
      responseTime,
      ipAddress
    )

    return rateLimitCheck.response!
  }

  // Process the actual API request
  try {
    // This is where you would fetch your data
    // For now, returning sample data
    const data = {
      success: true,
      message: 'Welcome to BigDataCorp API',
      data: {
        sample: 'This is sample data',
        timestamp: new Date().toISOString(),
        plan: validation.planType,
      },
      meta: {
        requestId: crypto.randomUUID(),
        version: '1.0.0',
      },
    }

    const responseTime = Date.now() - startTime

    // Log successful request
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
    await logApiUsage(
      validation.userId!,
      validation.apiKeyId!,
      '/api/v1/data',
      'GET',
      200,
      responseTime,
      ipAddress
    )

    // Build response headers
    const headers: Record<string, string> = {
        'X-Request-Id': data.meta.requestId,
        'X-Response-Time': `${responseTime}ms`,
    }

    // Add credit information if credits were deducted
    if (creditCheck.creditsCost) {
      headers['X-Credits-Used'] = creditCheck.creditsCost.toString()
      headers['X-Credits-Remaining'] = creditCheck.creditsRemaining!.toString()
    }

    return NextResponse.json(data, { headers })
  } catch (error) {
    console.error('Error processing API request:', error)

    const responseTime = Date.now() - startTime

    // Log error
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
    await logApiUsage(
      validation.userId!,
      validation.apiKeyId!,
      '/api/v1/data',
      'GET',
      500,
      responseTime,
      ipAddress
    )

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  // Validate API key
  const authHeader = request.headers.get('authorization')
  const validation = await validateApiKey(authHeader)

  if (!validation.isValid) {
    return NextResponse.json(
      { error: validation.error || 'Unauthorized' },
      { status: 401 }
    )
  }

  // Check credits and deduct if needed
  const creditCheck = await checkAndDeductCredits(
    validation.userId!,
    '/api/v1/data',
    validation.planType!
  )

  if (!creditCheck.allowed) {
    const responseTime = Date.now() - startTime
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
    await logApiUsage(
      validation.userId!,
      validation.apiKeyId!,
      '/api/v1/data',
      'GET',
      creditCheck.response?.status || 402,
      responseTime,
      ipAddress
    )
    return creditCheck.response!
  }

  // Enforce rate limiting
  const rateLimitCheck = await enforceRateLimit(
    validation.userId!,
    validation.planType!
  )

  if (!rateLimitCheck.allowed) {
    const responseTime = Date.now() - startTime
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
    await logApiUsage(
      validation.userId!,
      validation.apiKeyId!,
      '/api/v1/data',
      'POST',
      429,
      responseTime,
      ipAddress
    )

    return rateLimitCheck.response!
  }

  try {
    const body = await request.json()

    // Process the data
    const result = {
      success: true,
      message: 'Data processed successfully',
      data: {
        received: body,
        processed: true,
        timestamp: new Date().toISOString(),
      },
      meta: {
        requestId: crypto.randomUUID(),
        version: '1.0.0',
      },
    }

    const responseTime = Date.now() - startTime

    // Log successful request
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
    await logApiUsage(
      validation.userId!,
      validation.apiKeyId!,
      '/api/v1/data',
      'POST',
      200,
      responseTime,
      ipAddress
    )

    // Build response headers
    const headers: Record<string, string> = {
      'X-Request-Id': result.meta.requestId,
      'X-Response-Time': `${responseTime}ms`,
    }

    // Add credit information if credits were deducted
    if (creditCheck.creditsCost) {
      headers['X-Credits-Used'] = creditCheck.creditsCost.toString()
      headers['X-Credits-Remaining'] = creditCheck.creditsRemaining!.toString()
    }

    return NextResponse.json(result, { headers })
  } catch (error) {
    console.error('Error processing API request:', error)

    const responseTime = Date.now() - startTime

    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
    await logApiUsage(
      validation.userId!,
      validation.apiKeyId!,
      '/api/v1/data',
      'POST',
      500,
      responseTime,
      ipAddress
    )

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
