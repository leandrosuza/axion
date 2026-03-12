import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { mpConfig } from '@/lib/mercadoPagoConfig'
import { PreApproval } from 'mercadopago'

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
      .select('mp_subscription_id, plan_type, mp_payment_id')
      .eq('user_id', user.id)
      .single()

    if (error || (!subscription?.mp_subscription_id && !subscription?.mp_payment_id)) {
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
    })
  } catch (error: any) {
    console.error('Cancel subscription error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}
