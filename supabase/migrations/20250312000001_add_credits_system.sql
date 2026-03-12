-- =====================================================
-- MIGRATION: Sistema de Créditos (Pay-per-use)
-- Cria tabela para compras de créditos
-- =====================================================

-- Tabela de compras de créditos
CREATE TABLE IF NOT EXISTS public.credit_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id TEXT NOT NULL,
  credits INTEGER NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  mp_payment_id TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_credit_purchases_user_id ON public.credit_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_purchases_status ON public.credit_purchases(status);
CREATE INDEX IF NOT EXISTS idx_credit_purchases_mp_payment_id ON public.credit_purchases(mp_payment_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_credit_purchases_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_credit_purchases_updated_at ON public.credit_purchases;
CREATE TRIGGER trigger_credit_purchases_updated_at
  BEFORE UPDATE ON public.credit_purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_credit_purchases_updated_at();

-- =====================================================
-- GARANTIR COLUNAS DE CRÉDITOS NA TABELA USERS
-- =====================================================

-- Adicionar colunas se não existirem
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS credits_balance INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS credits_available INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS credits_used INTEGER DEFAULT 0;

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE public.credit_purchases ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver suas próprias compras
DROP POLICY IF EXISTS "Users can view own credit purchases" ON public.credit_purchases;
CREATE POLICY "Users can view own credit purchases" ON public.credit_purchases
  FOR SELECT TO authenticated 
  USING (user_id = auth.uid());

-- Sistema pode inserir compras
DROP POLICY IF EXISTS "Service can insert credit purchases" ON public.credit_purchases;
CREATE POLICY "Service can insert credit purchases" ON public.credit_purchases
  FOR INSERT TO authenticated 
  WITH CHECK (user_id = auth.uid());

-- Sistema pode atualizar compras
DROP POLICY IF EXISTS "Service can update credit purchases" ON public.credit_purchases;
CREATE POLICY "Service can update credit purchases" ON public.credit_purchases
  FOR UPDATE TO service_role 
  USING (true);

-- =====================================================
-- FUNÇÃO PARA CONSUMIR CRÉDITOS
-- =====================================================

CREATE OR REPLACE FUNCTION consume_credits(
  p_user_id UUID,
  p_amount INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_balance INTEGER;
BEGIN
  -- Verificar saldo atual
  SELECT credits_available INTO v_current_balance
  FROM public.users
  WHERE id = p_user_id;

  IF v_current_balance IS NULL OR v_current_balance < p_amount THEN
    RETURN FALSE;
  END IF;

  -- Consumir créditos
  UPDATE public.users
  SET 
    credits_available = credits_available - p_amount,
    credits_used = credits_used + p_amount,
    updated_at = NOW()
  WHERE id = p_user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNÇÃO PARA ADICIONAR CRÉDITOS
-- =====================================================

CREATE OR REPLACE FUNCTION add_credits(
  p_user_id UUID,
  p_amount INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.users
  SET 
    credits_balance = credits_balance + p_amount,
    credits_available = credits_available + p_amount,
    updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT '✅ Sistema de créditos configurado!' as message;
