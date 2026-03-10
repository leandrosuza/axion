/**
 * Pricing Plans and API Limits Configuration
 */

export type PlanType = 'free' | 'basic' | 'pro' | 'enterprise'

export interface PlanLimits {
  name: string
  displayName: string
  price: number
  monthlyRequests: number
  dailyRequests: number
  minuteRequests: number
  requestsPerDay: number // Alias for dailyRequests
  requestsPerMonth: number // Alias for monthlyRequests
  maxApiKeys: number
  features: string[]
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: {
    name: 'free',
    displayName: 'Free',
    price: 0,
    monthlyRequests: 1000,
    dailyRequests: 100,
    minuteRequests: 10,
    requestsPerDay: 100,
    requestsPerMonth: 1000,
    maxApiKeys: 1,
    features: [
      '1,000 API calls/month',
      '100 calls/day',
      '10 calls/minute',
      '1 API key',
      'All 6 endpoints',
      'Email support',
      'API documentation',
    ],
  },
  basic: {
    name: 'basic',
    displayName: 'Basic',
    price: 29,
    monthlyRequests: 30000,
    dailyRequests: 1000,
    minuteRequests: 60,
    requestsPerDay: 1000,
    requestsPerMonth: 30000,
    maxApiKeys: 3,
    features: [
      '30,000 API calls/month',
      '1,000 calls/day',
      '60 calls/minute',
      '3 API keys',
      'All 6 endpoints',
      'Priority email support',
      'API documentation',
      'Usage analytics',
    ],
  },
  pro: {
    name: 'pro',
    displayName: 'Pro',
    price: 99,
    monthlyRequests: 300000,
    dailyRequests: 10000,
    minuteRequests: 300,
    requestsPerDay: 10000,
    requestsPerMonth: 300000,
    maxApiKeys: 10,
    features: [
      '300,000 API calls/month',
      '10,000 calls/day',
      '300 calls/minute',
      '10 API keys',
      'All 6 endpoints',
      'Priority support 24/7',
      'Advanced analytics',
      'Webhook integrations',
      'Custom rate limits',
    ],
  },
  enterprise: {
    name: 'enterprise',
    displayName: 'Enterprise',
    price: 499,
    monthlyRequests: -1, // -1 means unlimited
    dailyRequests: -1,
    minuteRequests: -1,
    requestsPerDay: -1,
    requestsPerMonth: -1,
    maxApiKeys: -1,
    features: [
      'Unlimited API calls',
      'No rate limits',
      'Unlimited API keys',
      'All 6 endpoints',
      'Dedicated support',
      'SLA guarantee 99.9%',
      'Custom integrations',
      'White-label options',
      'Dedicated account manager',
      'On-premise deployment',
    ],
  },
}

/**
 * Get plan limits by plan name
 */
export function getPlanLimits(plan: string): PlanLimits {
  const planType = plan.toLowerCase() as PlanType
  return PLAN_LIMITS[planType] || PLAN_LIMITS.free
}

/**
 * Check if usage is approaching limit (80% threshold)
 */
export function isApproachingLimit(current: number, limit: number): boolean {
  if (limit === -1) return false // Unlimited
  return current >= limit * 0.8
}

/**
 * Check if limit is exceeded
 */
export function isLimitExceeded(current: number, limit: number): boolean {
  if (limit === -1) return false // Unlimited
  return current >= limit
}

/**
 * Calculate usage percentage
 */
export function getUsagePercentage(current: number, limit: number): number {
  if (limit === -1) return 0 // Unlimited
  return Math.min(Math.round((current / limit) * 100), 100)
}
