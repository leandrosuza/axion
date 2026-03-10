import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { newPriceId, newPlanType } = body

    if (!newPriceId || !newPlanType) {
      return NextResponse.json(
        { error: 'Missing newPriceId or newPlanType' },
        { status: 400 }
      )
    }

    // Validate plan type
    const validPlans = ['basic', 'pro', 'enterprise']
    if (!validPlans.includes(newPlanType)) {
      return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 })
    }

    // Get user's subscription
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id, plan_type')
      .eq('user_id', user.id)
      .single()

    if (error || !subscription?.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      )
    }

    // Cannot change from free plan this way
    if (subscription.plan_type === 'free') {
      return NextResponse.json(
        { error: 'Use checkout to upgrade from free plan' },
        { status: 400 }
      )
    }

    // Update subscription in Stripe with proration
    const updatedSubscription = await stripe.subscriptions.update(
      subscription.stripe_subscription_id,
      {
        items: [
          {
            id: (await stripe.subscriptions.retrieve(subscription.stripe_subscription_id)).items.data[0].id,
            price: newPriceId,
          },
        ],
        proration_behavior: 'create_prorations',
      }
    )

    // Update local database (webhook will also do this, but update immediately for better UX)
    await supabase
      .from('subscriptions')
      .update({
        plan_type: newPlanType,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    return NextResponse.json({
      success: true,
      subscription: {
        plan_type: newPlanType,
        current_period_end: new Date(updatedSubscription.current_period_end * 1000).toISOString(),
      },
    })
  } catch (error: any) {
    console.error('Change subscription error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to change subscription' },
      { status: 500 }
    )
  }
}
