'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Ban, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { getUsagePercentage } from '@/lib/constants/pricing'

interface UsageAlertProps {
  current: number
  limit: number
  period: 'minute' | 'day' | 'month'
  planName: string
}

export function UsageAlert({ current, limit, period, planName }: UsageAlertProps) {
  if (limit === -1) return null // Unlimited plan

  const percentage = getUsagePercentage(current, limit)
  const isExceeded = current >= limit
  const isApproaching = percentage >= 80 && !isExceeded

  if (!isApproaching && !isExceeded) return null

  const periodText = {
    minute: 'this minute',
    day: 'today',
    month: 'this month',
  }

  if (isExceeded) {
    return (
      <Alert variant="destructive" className="mb-6">
        <Ban className="h-4 w-4" />
        <AlertTitle>API Limit Reached!</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-3">
            You&apos;ve reached your <strong>{planName}</strong> plan limit of{' '}
            <strong>{limit.toLocaleString()}</strong> requests {periodText[period]}.
          </p>
          <p className="mb-3 text-sm">
            <strong>Your API calls will be blocked until the limit resets.</strong>
          </p>
          <div className="flex gap-2 mt-3">
            <Link href="/dashboard/billing">
              <Button size="sm" variant="default">
                Upgrade Plan
              </Button>
            </Link>
            <Link href="/dashboard/usage">
              <Button size="sm" variant="outline">
                View Usage
              </Button>
            </Link>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="mb-6 border-orange-500 bg-orange-50 dark:bg-orange-950">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertTitle className="text-orange-900 dark:text-orange-100">
        Approaching API Limit
      </AlertTitle>
      <AlertDescription className="text-orange-800 dark:text-orange-200">
        <p className="mb-2">
          You&apos;ve used <strong>{current.toLocaleString()}</strong> of{' '}
          <strong>{limit.toLocaleString()}</strong> requests ({percentage}%) {periodText[period]}.
        </p>
        <p className="text-sm mb-3">
          Consider upgrading your plan to avoid service interruption.
        </p>
        <Link href="/dashboard/billing">
          <Button size="sm" variant="default" className="bg-orange-600 hover:bg-orange-700">
            <TrendingUp className="h-4 w-4 mr-2" />
            Upgrade Plan
          </Button>
        </Link>
      </AlertDescription>
    </Alert>
  )
}
