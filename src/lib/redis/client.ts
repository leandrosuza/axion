import { Redis } from '@upstash/redis'

// Only create Redis client if credentials are properly configured
const redisUrl = process.env.UPSTASH_REDIS_URL
const redisToken = process.env.UPSTASH_REDIS_TOKEN
const isRedisConfigured = redisUrl && redisToken && redisUrl.startsWith('https')

export const redis = isRedisConfigured
  ? new Redis({
      url: redisUrl,
      token: redisToken,
    })
  : null

export type RateLimitWindow = 'minute' | 'day' | 'month'

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

export async function checkRateLimit({
  identifier,
  limit,
  window,
}: {
  identifier: string
  limit: number
  window: RateLimitWindow
}): Promise<RateLimitResult> {
  // If Redis is not configured, allow all requests (development mode)
  if (!redis) {
    console.warn('Redis not configured, rate limiting disabled')
    return {
      success: true,
      limit,
      remaining: limit,
      reset: Date.now() + getWindowMs(window),
    }
  }

  const now = Date.now()
  const windowMs = getWindowMs(window)
  const key = `rate_limit:${identifier}:${window}`

  // Get current count
  const current = await redis.get<number>(key)
  const count = current || 0

  if (count >= limit) {
    const ttl = await redis.ttl(key)
    return {
      success: false,
      limit,
      remaining: 0,
      reset: now + ttl * 1000,
    }
  }

  // Increment counter
  const pipeline = redis.pipeline()
  pipeline.incr(key)

  if (!current) {
    // Set expiry only if this is a new key
    pipeline.expire(key, Math.ceil(windowMs / 1000))
  }

  await pipeline.exec()

  return {
    success: true,
    limit,
    remaining: limit - count - 1,
    reset: now + windowMs,
  }
}

function getWindowMs(window: RateLimitWindow): number {
  switch (window) {
    case 'minute':
      return 60 * 1000
    case 'day':
      return 24 * 60 * 60 * 1000
    case 'month':
      return 30 * 24 * 60 * 60 * 1000
  }
}

export async function resetRateLimit(identifier: string) {
  if (!redis) return

  const keys = [
    `rate_limit:${identifier}:minute`,
    `rate_limit:${identifier}:day`,
    `rate_limit:${identifier}:month`,
  ]

  await redis.del(...keys)
}
