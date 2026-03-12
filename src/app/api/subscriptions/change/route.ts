import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
<<<<<<< HEAD
import { mpConfig } from '@/lib/mercadoPagoConfig'
import { PreApproval } from 'mercadopago'
=======
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})
>>>>>>> upstream/master

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
<<<<<<< HEAD
    const { newPlanType } = body

    if (!newPlanType) {
      return NextResponse.json(
        { error: 'Missing newPlanType' },
=======
    const { newPriceId, newPlanType } = body

    if (!newPriceId || !newPlanType) {
      return NextResponse.json(
        { error: 'Missing newPriceId or newPlanType' },
>>>>>>> upstream/master
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
<<<<<<< HEAD
      .select('mp_subscription_id, mp_payment_id, plan_type')
      .eq('user_id', user.id)
      .single()

    if (error || (!subscription?.mp_subscription_id && !subscription?.mp_payment_id)) {
=======
      .select('stripe_subscription_id, plan_type')
      .eq('user_id', user.id)
      .single()

    if (error || !subscription?.stripe_subscription_id) {
>>>>>>> upstream/master
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      )
    }

<<<<<<< HEAD
    // Cannot change from free plan this way - needs new checkout
=======
    // Cannot change from free plan this way
>>>>>>> upstream/master
    if (subscription.plan_type === 'free') {
      return NextResponse.json(
        { error: 'Use checkout to upgrade from free plan' },
        { status: 400 }
      )
    }

<<<<<<< HEAD
    // For Mercado Pago, we need to cancel current and create new subscription
    // MP doesn't support changing plans directly like Stripe
    
    // Cancel current subscription if exists
    if (subscription.mp_subscription_id) {
      try {
        const preApproval = new PreApproval(mpConfig)
        await preApproval.update({
          id: subscription.mp_subscription_id,
          body: { status: 'cancelled' }
        })
      } catch (cancelError) {
        console.log('Error cancelling old subscription:', cancelError)
        // Continue even if cancellation fails
      }
    }

    // Update database - user needs to complete new checkout for new plan
    await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
=======
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
>>>>>>> upstream/master
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    return NextResponse.json({
      success: true,
<<<<<<< HEAD
      message: 'Current subscription cancelled. Please complete checkout for the new plan.',
      requires_checkout: true,
      new_plan: newPlanType,
=======
      subscription: {
        plan_type: newPlanType,
        current_period_end: new Date(updatedSubscription.current_period_end * 1000).toISOString(),
      },
>>>>>>> upstream/master
    })
  } catch (error: any) {
    console.error('Change subscription error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to change subscription' },
      { status: 500 }
    )
  }
}
