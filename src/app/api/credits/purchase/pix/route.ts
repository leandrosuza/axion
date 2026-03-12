import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { mpConfig, CREDIT_PACKAGES, CreditPackageId } from '@/lib/mercadoPagoConfig'
import { Payment } from 'mercadopago'

// =====================================================
// API: Compra de Créditos via PIX (QR Code Nativo)
// =====================================================
// Cria pagamento PIX via Mercado Pago Payments API
// Retorna QR Code para pagamento direto

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
        payment_method: 'pix',
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (dbError) {
      console.error('Error creating credit purchase record:', dbError)
      return NextResponse.json({ error: 'Failed to create purchase record' }, { status: 500 })
    }

    // Criar pagamento PIX no Mercado Pago
    const payment = new Payment(mpConfig)
    const response = await payment.create({
      body: {
        transaction_amount: creditPackage.price,
        description: `${creditPackage.name} - ${creditPackage.credits} créditos`,
        payment_method_id: 'pix',
        payer: {
          email: user.email || '',
          first_name: user.user_metadata?.full_name?.split(' ')[0] || '',
          last_name: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
        },
        external_reference: paymentRecord.id,
        notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`,
      },
    })

    // Extrair dados do PIX
    const pixData = response.point_of_interaction?.transaction_data

    if (!pixData) {
      return NextResponse.json({ error: 'Failed to generate PIX payment' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      paymentId: paymentRecord.id,
      mpPaymentId: response.id,
      package: {
        id: creditPackage.id,
        name: creditPackage.name,
        credits: creditPackage.credits,
        price: creditPackage.price,
      },
      pix: {
        qrCode: pixData.qr_code, // QR Code base64
        qrCodeBase64: pixData.qr_code_base64, // Imagem QR Code
        copyPaste: pixData.qr_code, // Código copia e cola
        ticketUrl: pixData.ticket_url, // URL do comprovante
        expirationDate: response.date_of_expiration,
      },
      status: response.status,
    })

  } catch (error: any) {
    console.error('PIX checkout error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
