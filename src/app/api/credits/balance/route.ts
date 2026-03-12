import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// =====================================================
// API: Verificar saldo de créditos do usuário
// =====================================================

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userData, error } = await supabase
      .from('users')
      .select('credits_balance, credits_available, credits_used')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error fetching credits:', error)
      return NextResponse.json({ error: 'Failed to fetch credits' }, { status: 500 })
    }

    // Buscar histórico de compras
    const { data: purchases, error: purchasesError } = await supabase
      .from('credit_purchases')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })

    return NextResponse.json({
      balance: userData?.credits_balance || 0,
      available: userData?.credits_available || 0,
      used: userData?.credits_used || 0,
      purchases: purchases || [],
    })
  } catch (error: any) {
    console.error('Credits API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
