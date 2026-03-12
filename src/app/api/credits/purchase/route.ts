import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { mpConfig, CREDIT_PACKAGES, CreditPackageId } from '@/lib/mercadoPagoConfig'
import { Preference } from 'mercadopago'

// =====================================================
// API: Compra de Créditos (Pay-per-use)
// =====================================================
// Cria pagamento único via Mercado Pago Preference API
// Quando aprovado, adiciona créditos ao usuário

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { packageId } = await request.json()
    const creditPackage = CREDIT_PACKAGES[packageId as CreditPackageId]

    if (!creditPackage) {
      return NextResponse.json({ 
        error: 'Pacote de créditos inválido',
        availablePackages: Object.keys(CREDIT_PACKAGES)
      }, { status: 400 })
    }

    // Criar registro de pagamento pendente
    const { data: paymentRecord, error: dbError } = await supabase
      .from('credit_purchases')
      .insert({
        user_id: user.id,
        package_id: creditPackage.id,
        credits: creditPackage.credits,
        amount: creditPackage.price,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (dbError) {
      console.error('Error creating credit purchase record:', dbError)
      return NextResponse.json({ error: 'Failed to create purchase record' }, { status: 500 })
    }

    // Criar preferência de pagamento no Mercado Pago
    const preference = new Preference(mpConfig)
    const response = await preference.create({
      body: {
        items: [
          {
            id: creditPackage.id,
            title: creditPackage.name,
            description: creditPackage.description,
            quantity: 1,
            unit_price: creditPackage.price,
            currency_id: 'BRL',
          },
        ],
        payer: {
          email: user.email || '',
        },
        external_reference: paymentRecord.id, // Usamos o ID do nosso registro
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?payment=success`,
          failure: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?payment=failure`,
          pending: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?payment=pending`,
        },
        notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`,
        payment_methods: {
          // Habilitar PIX e outras formas de pagamento
          excluded_payment_types: [],
          excluded_payment_methods: [],
          installments: 1,
        },
      },
    })

    return NextResponse.json({
      url: response.init_point,
      paymentId: paymentRecord.id,
      package: {
        id: creditPackage.id,
        name: creditPackage.name,
        credits: creditPackage.credits,
        price: creditPackage.price,
      },
    })
  } catch (error: any) {
    console.error('Credit checkout error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
