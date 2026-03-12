import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export interface ApiKeyValidation {
  isValid: boolean
  userId?: string
  apiKeyId?: string
  planType?: 'free' | 'basic' | 'pro' | 'enterprise' | 'credits'
  creditsBalance?: number
  error?: string
}

/**
 * Validates API key and returns user information
 */
export async function validateApiKey(
  authHeader: string | null
): Promise<ApiKeyValidation> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      isValid: false,
      error: 'Missing or invalid Authorization header. Format: Bearer bdc_your_api_key',
    }
  }

  const apiKey = authHeader.substring(7).trim()

  if (!apiKey.startsWith('bdc_')) {
    return {
      isValid: false,
      error: `Invalid API key format. API key must start with 'bdc_'.`,
    }
  }

  try {
    // Fetch all active API keys
    const keys = await prisma.api_keys.findMany({
      where: { is_active: true },
      select: {
        id: true,
        user_id: true,
        key_hash: true,
      },
    })

    // Check if the provided key matches any hashed key
    let matchedKey = null
    for (const key of keys) {
      const isMatch = await bcrypt.compare(apiKey, key.key_hash)
      if (isMatch) {
        matchedKey = key
        break
      }
    }

    if (!matchedKey) {
      return {
        isValid: false,
        error: 'Invalid API key',
      }
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: matchedKey.user_id },
      select: {
        id: true,
        plan_type: true,
        credits_balance: true,
      },
    })

    if (!user) {
      return {
        isValid: false,
        error: 'User not found',
      }
    }

    // FREE plan users cannot make API calls
    if (user.plan_type === 'free') {
      return {
        isValid: false,
        error: 'FREE plan does not allow API calls. Please upgrade your plan or purchase credits.',
      }
    }

    return {
      isValid: true,
      userId: user.id,
      apiKeyId: matchedKey.id,
      planType: user.plan_type as 'free' | 'basic' | 'pro' | 'enterprise' | 'credits',
      creditsBalance: user.credits_balance,
    }
  } catch (error) {
    console.error('Error validating API key:', error)
    return {
      isValid: false,
      error: 'Failed to validate API key',
    }
  }
}

/**
 * Checks if user has enough credits and deducts them
 * Returns the module information and whether the deduction was successful
 */
export async function checkAndDeductCredits(
  userId: string,
  endpoint: string,
  planType: string
): Promise<{
  allowed: boolean
  moduleName?: string
  creditsCost?: number
  creditsRemaining?: number
  error?: string
  response?: NextResponse
}> {
  try {
    // Subscription plans (basic, pro, enterprise) have unlimited queries
    if (planType === 'basic' || planType === 'pro' || planType === 'enterprise') {
      return { allowed: true }
    }

    // For pay-per-query (credits plan), check balance and deduct
    if (planType === 'credits') {
      // Find the module by endpoint
      const module = await prisma.api_modules.findFirst({
        where: { endpoint },
        select: {
          id: true,
          name: true,
          price_per_query: true,
          status: true,
        },
      })

      if (!module) {
        return {
          allowed: false,
          error: 'API endpoint not found',
          response: NextResponse.json(
            { error: 'API endpoint not found' },
            { status: 404 }
          ),
        }
      }

      if (module.status !== 'active') {
        return {
          allowed: false,
          error: 'API endpoint is not currently available',
          response: NextResponse.json(
            { error: 'API endpoint is not currently available' },
            { status: 503 }
          ),
        }
      }

      // Get current user balance
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { credits_balance: true, credits_used: true },
      })

      if (!user) {
        return {
          allowed: false,
          error: 'User not found',
          response: NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
          ),
        }
      }

      // Check if user has enough credits
      if (user.credits_balance < module.price_per_query) {
        return {
          allowed: false,
          error: `Insufficient credits. Required: ${module.price_per_query}, Available: ${user.credits_balance}`,
          response: NextResponse.json(
            {
              error: 'Insufficient credits',
              required: module.price_per_query,
              available: user.credits_balance,
              message: 'Please purchase more credits to continue using the API',
            },
            { status: 402 } // 402 Payment Required
          ),
        }
      }

      // Deduct credits in a transaction
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          credits_balance: {
            decrement: module.price_per_query,
          },
          credits_used: {
            increment: module.price_per_query,
          },
        },
        select: { credits_balance: true },
      })

      return {
        allowed: true,
        moduleName: module.name,
        creditsCost: module.price_per_query,
        creditsRemaining: updatedUser.credits_balance,
      }
    }

    // Unknown plan type
    return {
      allowed: false,
      error: 'Invalid plan type',
      response: NextResponse.json(
        { error: 'Invalid plan type' },
        { status: 400 }
      ),
    }
  } catch (error) {
    console.error('Error checking/deducting credits:', error)
    return {
      allowed: false,
      error: 'Failed to process credits',
      response: NextResponse.json(
        { error: 'Failed to process credits' },
        { status: 500 }
      ),
    }
  }
}

/**
 * Enforces rate limits based on plan
 */
export async function enforceRateLimit(
  userId: string,
  planType: string
): Promise<{ allowed: boolean; retryAfter?: number; response?: NextResponse }> {
  // For now, return allowed for all plans
  // TODO: Implement Redis-based rate limiting with per-plan limits
  return { allowed: true }
}

/**
 * Logs API usage to the database
 */
export async function logApiUsage(
  userId: string,
  apiKeyId: string,
  endpoint: string,
  method: string,
  statusCode: number,
  responseTime: number,
  ipAddress?: string
): Promise<void> {
  try {
    // Find module by endpoint
    const module = await prisma.api_modules.findFirst({
      where: { endpoint },
      select: { id: true },
    })

    if (!module) {
      console.warn(`Module not found for endpoint: ${endpoint}`)
      return
    }

    // Get user's contractor_id
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { contractor_id: true },
    })

    if (!user || !user.contractor_id) {
      console.warn(`User or contractor_id not found for user: ${userId}`)
      return
    }

    await prisma.module_usage_logs.create({
      data: {
        module_id: module.id,
        contractor_id: user.contractor_id,
        user_id: userId,
        response_code: statusCode,
        response_time: responseTime,
        ip_address: ipAddress,
        created_at: new Date(),
      },
    })
  } catch (error) {
    // Log error but don't fail the request
    console.error('Error logging API usage:', error)
  }
}

/**
 * Gets user usage stats
 */
export async function getUserUsageStats(userId: string) {
  const now = new Date()
  const oneMinuteAgo = new Date(now.getTime() - 60 * 1000)
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  try {
    const [minuteCount, dayCount, monthCount] = await Promise.all([
      prisma.module_usage_logs.count({
        where: {
          user_id: userId,
          created_at: { gte: oneMinuteAgo },
        },
      }),
      prisma.module_usage_logs.count({
        where: {
          user_id: userId,
          created_at: { gte: oneDayAgo },
        },
      }),
      prisma.module_usage_logs.count({
        where: {
          user_id: userId,
          created_at: { gte: oneMonthAgo },
        },
      }),
    ])

    return { minuteCount, dayCount, monthCount }
  } catch (error) {
    console.error('Error getting usage stats:', error)
    return { minuteCount: 0, dayCount: 0, monthCount: 0 }
  }
}

/**
 * Checks if user can create more API keys based on plan
 */
export async function canCreateApiKey(
  userId: string,
  planType: string
): Promise<boolean> {
  try {
    const keyCount = await prisma.api_keys.count({
      where: { user_id: userId, is_active: true },
    })

    // Plan limits: free=1, basic=3, pro=10, enterprise=unlimited, credits=5
    const limits: Record<string, number> = {
      free: 1,
      basic: 3,
      pro: 10,
      enterprise: 999,
      credits: 5,
    }

    return keyCount < (limits[planType] || 1)
  } catch (error) {
    console.error('Error checking API key limit:', error)
    return false
  }
}
