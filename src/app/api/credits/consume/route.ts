import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// =====================================================
// API: Consumir créditos do usuário
// =====================================================
// Usado quando o usuário faz uma consulta API

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { amount, reason } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid credit amount' }, { status: 400 })
    }

    // Verificar saldo
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('credits_available, credits_used')
      .eq('id', user.id)
      .single()

    if (userError) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const available = userData?.credits_available || 0

    if (available < amount) {
      return NextResponse.json({
        error: 'Insufficient credits',
        available,
        required: amount,
        message: 'Você precisa comprar mais créditos para continuar',
      }, { status: 402 }) // 402 Payment Required
    }

    // Consumir créditos
    const { error: updateError } = await supabase
      .from('users')
      .update({
        credits_available: available - amount,
        credits_used: (userData?.credits_used || 0) + amount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error consuming credits:', updateError)
      return NextResponse.json({ error: 'Failed to consume credits' }, { status: 500 })
    }

    // Registrar uso de créditos (opcional - para auditoria)
    try {
      await supabase.from('credit_usage_logs').insert({
        user_id: user.id,
        amount: amount,
        reason: reason || 'API usage',
        created_at: new Date().toISOString(),
      })
    } catch {
      // Ignora erro se a tabela não existir
    }

    return NextResponse.json({
      success: true,
      consumed: amount,
      remaining: available - amount,
    })
  } catch (error: any) {
    console.error('Consume credits error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
