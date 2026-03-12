import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
<<<<<<< HEAD
=======
import { createCustomerPortalSession } from '@/lib/stripe/utils'
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

<<<<<<< HEAD
    // Get user's subscription
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('plan_type, status, current_period_end, mp_subscription_id')
      .eq('user_id', user.id)
      .single()

    if (error || !subscription) {
=======
    // Get user's subscription to find Stripe customer ID
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    if (error || !subscription?.stripe_customer_id) {
>>>>>>> upstream/master
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      )
    }

<<<<<<< HEAD
    // Mercado Pago não tem portal do cliente como Stripe
    // Retorna URL da página de billing para gerenciamento
    const billingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`

    return NextResponse.json({ 
      url: billingUrl,
      subscription: {
        plan_type: subscription.plan_type,
        status: subscription.status,
        current_period_end: subscription.current_period_end,
      }
    })
  } catch (error: any) {
    console.error('Portal error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get billing info' },
=======
    // Create portal session
    const session = await createCustomerPortalSession({
      customerId: subscription.stripe_customer_id,
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Portal error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create portal session' },
>>>>>>> upstream/master
      { status: 500 }
    )
  }
}
