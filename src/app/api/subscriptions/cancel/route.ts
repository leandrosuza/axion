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

    // Get user's subscription
    const { data: subscription, error } = await supabase
      .from('subscriptions')
<<<<<<< HEAD
      .select('mp_subscription_id, plan_type, mp_payment_id')
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

    if (subscription.plan_type === 'free') {
      return NextResponse.json(
        { error: 'Cannot cancel free plan' },
        { status: 400 }
      )
    }

<<<<<<< HEAD
    // Cancel subscription in Mercado Pago
    if (subscription.mp_subscription_id) {
      const preApproval = new PreApproval(mpConfig)
      await preApproval.update({
        id: subscription.mp_subscription_id,
        body: {
          status: 'cancelled',
        },
      })
    }

    // Update subscription status in database
    await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled successfully',
=======
    // Cancel subscription at period end
    const canceledSubscription = await stripe.subscriptions.update(
      subscription.stripe_subscription_id,
      {
        cancel_at_period_end: true,
      }
    )

    return NextResponse.json({
      success: true,
      cancels_at: new Date(canceledSubscription.cancel_at! * 1000).toISOString(),
>>>>>>> upstream/master
    })
  } catch (error: any) {
    console.error('Cancel subscription error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}
