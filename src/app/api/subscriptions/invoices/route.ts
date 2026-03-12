import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's payment history from our database
    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(12)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch payment history' },
        { status: 500 }
      )
    }

    // Format payments as invoices for frontend compatibility
    const formattedInvoices = (payments || []).map((payment) => ({
      id: payment.id,
      number: payment.mp_payment_id || payment.id.slice(0, 8),
      amount: payment.amount / 100, // Convert from cents
      currency: 'BRL',
      status: payment.status === 'approved' ? 'paid' : payment.status,
      created: payment.created_at,
      invoice_pdf: null, // MP doesn't provide PDF invoices directly
      hosted_invoice_url: null,
      period_start: payment.created_at,
      period_end: payment.expires_at,
      payment_method: payment.payment_method,
      plan_type: payment.plan_type,
    }))

    return NextResponse.json({ invoices: formattedInvoices })
  } catch (error: any) {
    console.error('Get invoices error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch invoices' },
      { status: 500 }
    )
  }
}
