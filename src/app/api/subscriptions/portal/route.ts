import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
      .select('plan_type, status, current_period_end, mp_subscription_id')
      .eq('user_id', user.id)
      .single()

    if (error || !subscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      )
    }

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
      { status: 500 }
    )
  }
}
