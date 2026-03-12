import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// =====================================================
// API: Adicionar Créditos Manualmente (Para testes)
// =====================================================

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { credits, reason = 'Manual addition' } = await request.json()

    if (!credits || credits <= 0) {
      return NextResponse.json({ error: 'Invalid credits amount' }, { status: 400 })
    }

    // Buscar saldo atual
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('credits_balance, credits_available, credits_used')
      .eq('id', user.id)
      .single()

    if (userError) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const currentBalance = userData?.credits_balance || 0
    const newBalance = currentBalance + credits

    // Atualizar créditos
    await supabase
      .from('users')
      .update({
        credits_balance: newBalance,
        credits_available: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    // Criar registro de compra completada
    await supabase.from('credit_purchases').insert({
      user_id: user.id,
      package_id: 'manual',
      credits: credits,
      amount: 0,
      status: 'completed',
      mp_payment_id: 'manual-addition',
      paid_at: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: `✅ ${credits} créditos adicionados!`,
      previousBalance: currentBalance,
      newBalance: newBalance,
      added: credits,
    })

  } catch (error: any) {
    console.error('Error adding credits:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
