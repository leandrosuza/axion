import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { MercadoPagoConfig, PreApproval } from 'mercadopago'

const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! })

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body

    if (type !== 'subscription_preapproval') {
      return NextResponse.json({ received: true })
    }

    const preApproval = new PreApproval(mp)
    const subscription = await preApproval.get({ id: data.id })

    const supabase = await createClient()
    const userId = subscription.external_reference

    await supabase.from('subscriptions').upsert({
      user_id: userId,
      status: subscription.status === 'authorized' ? 'active' : subscription.status,
      mp_subscription_id: subscription.id,
      updated_at: new Date().toISOString(),
    })

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}