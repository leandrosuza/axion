import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
<<<<<<< HEAD
import { mpConfig, MP_PLANS } from '@/lib/mercadoPagoConfig'
import { PreApproval } from 'mercadopago'
=======
import { MercadoPagoConfig, PreApproval } from 'mercadopago'
import { MP_PLANS } from '@/lib/mercadopago/client'

const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! })
>>>>>>> upstream/master

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planType } = await request.json()
    const plan = MP_PLANS[planType as keyof typeof MP_PLANS]

    if (!plan || !plan.preapprovalPlanId) {
      return NextResponse.json({ error: 'Plano inválido' }, { status: 400 })
    }

<<<<<<< HEAD
    const preApproval = new PreApproval(mpConfig)
=======
    const preApproval = new PreApproval(mp)
>>>>>>> upstream/master
    const response = await preApproval.create({
      body: {
        preapproval_plan_id: plan.preapprovalPlanId,
        payer_email: user.email,
        back_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
        external_reference: user.id,
      }
    })

    return NextResponse.json({ url: response.init_point })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}