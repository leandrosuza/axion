import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPlanLimits } from '@/lib/constants/pricing'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's subscription
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    // Get plan limits
    const planType = (subscription.plan_type as 'free' | 'basic' | 'pro' | 'enterprise') || 'free'
    const planLimits = getPlanLimits(planType)

    // Get usage statistics
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
      { count: todayUsage },
      { count: monthUsage }
    ] = await Promise.all([
      supabase
        .from('api_usage_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', startOfDay.toISOString()),
      supabase
        .from('api_usage_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth.toISOString())
    ])

    return NextResponse.json({
      subscription: {
        plan_type: subscription.plan_type,
        status: subscription.status,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
      },
      limits: planLimits,
      usage: {
        today: todayUsage || 0,
        month: monthUsage || 0,
      },
      usage_percentage: {
        daily: planLimits.requestsPerDay ? Math.round(((todayUsage || 0) / planLimits.requestsPerDay) * 100) : 0,
        monthly: planLimits.requestsPerMonth ? Math.round(((monthUsage || 0) / planLimits.requestsPerMonth) * 100) : 0,
      }
    })
  } catch (error: any) {
    console.error('Get subscription status error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get subscription status' },
      { status: 500 }
    )
  }
}
