import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { mpConfig } from '@/lib/mercadoPagoConfig'
import { Payment, PreApproval } from 'mercadopago'

// Criar cliente com SERVICE_ROLE_KEY para bypassar RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// =====================================================
// WEBHOOK: Mercado Pago - Processar pagamentos
// =====================================================
// Suporta: Assinaturas (LEGADO) + Compras de Créditos (NOVO)

export async function POST(request: NextRequest) {
  try {
    // Mercado Pago envia dados via query params ou body
    const { searchParams } = new URL(request.url)
    const queryPaymentId = searchParams.get('data.id') || searchParams.get('id')
    const queryTopic = searchParams.get('topic') || searchParams.get('type')

    // Também pode receber via body
    let body: any = {}
    try {
      body = await request.json()
    } catch {
      // Body vazio ou inválido
    }

    const paymentId = queryPaymentId || body?.data?.id || body?.id
    const topic = queryTopic || body?.topic || body?.type

    console.log('[Webhook] Received:', { paymentId, topic, body })

    // =====================================================
    // 1. WEBHOOK DE ASSINATURA (LEGADO - PreApproval)
    // =====================================================
    if (topic === 'subscription_preapproval' || body?.type === 'subscription_preapproval') {
      const preApproval = new PreApproval(mpConfig)
      const subscription = await preApproval.get({ id: paymentId || body?.data?.id })

      const supabase = supabaseAdmin
      const userId = subscription.external_reference

      await supabase.from('subscriptions').upsert({
        user_id: userId,
        status: subscription.status === 'authorized' ? 'active' : subscription.status,
        mp_subscription_id: subscription.id,
        updated_at: new Date().toISOString(),
      })

      return NextResponse.json({ received: true, type: 'subscription' })
    }

    // Ignorar notificações de merchant_order (não são pagamentos)
    if (topic === 'merchant_order') {
      console.log('[Webhook] Ignoring merchant_order notification')
      return NextResponse.json({ message: 'Merchant order ignored' })
    }

    // =====================================================
    // 2. WEBHOOK DE PAGAMENTO (NOVO - Créditos)
    // =====================================================
    if (topic === 'payment' || !topic) {
      if (!paymentId) {
        return NextResponse.json({ error: 'Missing payment ID' }, { status: 400 })
      }

      // Verificar o pagamento no Mercado Pago
      const payment = new Payment(mpConfig)
      const paymentData = await payment.get({ id: paymentId })

      const paymentStatus = paymentData.status
      console.log('[Webhook] Payment status:', paymentStatus, 'External ref:', paymentData.external_reference)

      // Se não tem external_reference, não é nossa compra
      if (!paymentData.external_reference) {
        return NextResponse.json({ message: 'No external reference' })
      }

      const supabase = supabaseAdmin
      
      // Buscar registro de compra de créditos
      console.log('[Webhook] Searching for purchase with ID:', paymentData.external_reference)
      
      const { data: purchase, error: purchaseError } = await supabase
        .from('credit_purchases')
        .select('*')
        .eq('id', paymentData.external_reference)
        .single()

      if (purchaseError || !purchase) {
        console.log('[Webhook] Purchase not found. Error:', purchaseError)
        console.log('[Webhook] External ref:', paymentData.external_reference)
        return NextResponse.json({ message: 'Not a credit purchase', error: purchaseError })
      }

      // Se já foi processado, ignorar
      if (purchase.status === 'completed') {
        return NextResponse.json({ message: 'Already processed' })
      }

      // =====================================================
      // Processar diferentes status de pagamento
      // =====================================================
      
      // 1. PAGAMENTO APROVADO → Adicionar créditos
      if (paymentStatus === 'approved') {
        // Atualizar status da compra
        await supabase
          .from('credit_purchases')
          .update({
            status: 'completed',
            mp_payment_id: paymentId,
            paid_at: new Date().toISOString(),
          })
          .eq('id', purchase.id)

        // Adicionar créditos ao usuário
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('credits_balance')
          .eq('id', purchase.user_id)
          .single()

        if (userError) {
          console.error('[Webhook] User not found:', purchase.user_id)
          return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const currentCredits = userData?.credits_balance || 0
        const newBalance = currentCredits + purchase.credits

        await supabase
          .from('users')
          .update({
            credits_balance: newBalance,
            credits_available: newBalance,
            updated_at: new Date().toISOString(),
          })
          .eq('id', purchase.user_id)

        console.log(`[Webhook] ✅ Added ${purchase.credits} credits to user ${purchase.user_id}. New balance: ${newBalance}`)

        return NextResponse.json({
          message: 'Credits added successfully',
          userId: purchase.user_id,
          creditsAdded: purchase.credits,
          newBalance,
        })
      }

      // 2. PAGAMENTO PENDENTE → Aguardar
      if (paymentStatus === 'pending' || paymentStatus === 'in_process') {
        await supabase
          .from('credit_purchases')
          .update({
            status: 'pending',
            mp_payment_id: paymentId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', purchase.id)

        console.log(`[Webhook] ⏳ Payment pending for purchase ${purchase.id}`)
        return NextResponse.json({ message: 'Payment pending', purchaseId: purchase.id })
      }

      // 3. PAGAMENTO REJEITADO/CANCELADO/ESTORNADO → Marcar como falha
      const failedStatuses = ['rejected', 'cancelled', 'refunded', 'charged_back']
      if (paymentStatus && failedStatuses.includes(paymentStatus)) {
        await supabase
          .from('credit_purchases')
          .update({
            status: 'failed',
            mp_payment_id: paymentId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', purchase.id)

        console.log(`[Webhook] ❌ Payment ${paymentStatus} for purchase ${purchase.id}`)
        return NextResponse.json({ 
          message: `Payment ${paymentStatus}`, 
          purchaseId: purchase.id,
          status: paymentStatus 
        })
      }

      // 4. OUTROS STATUS
      console.log(`[Webhook] ℹ️ Unhandled payment status: ${paymentStatus}`)
      return NextResponse.json({ message: 'Unhandled status', status: paymentStatus })
    }

    return NextResponse.json({ received: true, message: 'No action taken' })
  } catch (error: any) {
    console.error('[Webhook] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// GET para verificação de webhook (Mercado Pago pode fazer GET para verificar)
export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Webhook active', version: '2.0 (credits + subscriptions)' })
}
