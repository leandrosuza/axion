-- =====================================================
-- AXION - Complete Database Setup (Unified Script)
-- Versão: 1.0
-- Descrição: Script único completo para setup do Supabase
-- =====================================================

-- =====================================================
-- 1. TABELAS BASE (criar primeiro devido a dependências FK)
-- =====================================================

-- Tabela tenants (referenciada por contractors e users)
CREATE TABLE IF NOT EXISTS public.tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#3b82f6',
  secondary_color TEXT DEFAULT '#1e40af',
  custom_domain TEXT UNIQUE,
  status TEXT DEFAULT 'active',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela contractors (referenciada por users)
CREATE TABLE IF NOT EXISTS public.contractors (
  id TEXT PRIMARY KEY,
  tenant_id TEXT REFERENCES public.tenants(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  cpf_cnpj TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address_zip TEXT,
  address_street TEXT,
  address_number TEXT,
  address_complement TEXT,
  address_neighborhood TEXT,
  address_city TEXT,
  address_state TEXT,
  asaas_customer_id TEXT UNIQUE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. TABELA USERS (extends auth.users)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  cpf_cnpj TEXT,
  phone TEXT,
  account_type TEXT CHECK (account_type IN ('individual', 'business')) DEFAULT 'individual',
  -- Colunas adicionais do Prisma
  password_hash TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  status TEXT DEFAULT 'active',
  email_verified BOOLEAN DEFAULT FALSE,
  last_login_at TIMESTAMPTZ,
  last_login_ip TEXT,
  function TEXT,
  -- Sistema de créditos
  credits_available INTEGER DEFAULT 0,
  credits_used INTEGER DEFAULT 0,
  credits_balance INTEGER DEFAULT 0,
  -- Campos de relacionamento
  plan_type TEXT DEFAULT 'free',
  role_id TEXT,
  contractor_id TEXT,
  tenant_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. TABELAS CORE
-- =====================================================

-- Subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan_type TEXT CHECK (plan_type IN ('free', 'basic', 'pro', 'enterprise')) DEFAULT 'free',
  status TEXT CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')) DEFAULT 'active',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  mp_payment_id TEXT,
  mp_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  -- Colunas adicionais do Prisma
  contractor_id TEXT,
  plan_id TEXT,
  asaas_subscription_id TEXT,
  credits_available INTEGER DEFAULT 0,
  credits_used INTEGER DEFAULT 0,
  cycle_start_date TIMESTAMPTZ,
  cycle_end_date TIMESTAMPTZ,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- API Keys table
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL UNIQUE,
  key_preview TEXT,
  name TEXT NOT NULL,
  permissions TEXT CHECK (permissions IN ('read', 'full')) DEFAULT 'full',
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Colunas adicionais do Prisma
  contractor_id TEXT,
  key_encrypted TEXT
);

-- API Usage Logs table
CREATE TABLE IF NOT EXISTS public.api_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  api_key_id UUID NOT NULL REFERENCES public.api_keys(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  response_time INTEGER NOT NULL,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rate Limits table
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_type TEXT CHECK (plan_type IN ('free', 'basic', 'pro', 'enterprise')) UNIQUE NOT NULL,
  requests_per_minute INTEGER NOT NULL,
  requests_per_day INTEGER NOT NULL,
  requests_per_month INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments table (PIX e outros métodos)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  mp_payment_id TEXT,
  amount INTEGER NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'basic', 'pro', 'enterprise')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'cancelled', 'refunded', 'in_process', 'rejected')),
  payment_method TEXT DEFAULT 'pix' CHECK (payment_method IN ('pix', 'credit_card', 'debit_card', 'boleto')),
  qr_code TEXT,
  qr_code_base64 TEXT,
  external_reference TEXT UNIQUE,
  expires_at TIMESTAMPTZ,
  mp_response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credit Purchases table (Sistema de Créditos)
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

-- =====================================================
-- 4. TABELAS ADICIONAIS (Prisma)
-- =====================================================

-- Subscription Plans table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id TEXT PRIMARY KEY,
  tenant_id TEXT REFERENCES public.tenants(id),
  name TEXT NOT NULL,
  description TEXT,
  credits_per_month INTEGER,
  is_unlimited BOOLEAN DEFAULT FALSE,
  price_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'BRL',
  billing_cycle TEXT DEFAULT 'monthly',
  is_active BOOLEAN DEFAULT TRUE,
  is_visible BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- API Modules table
CREATE TABLE IF NOT EXISTS public.api_modules (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  long_description TEXT,
  category TEXT NOT NULL,
  icon TEXT,
  endpoint TEXT NOT NULL,
  method TEXT DEFAULT 'GET',
  status TEXT DEFAULT 'active',
  is_visible BOOLEAN DEFAULT TRUE,
  is_premium BOOLEAN DEFAULT FALSE,
  price_per_query INTEGER DEFAULT 1,
  rate_limit_minute INTEGER DEFAULT 60,
  rate_limit_day INTEGER DEFAULT 1000,
  documentation_url TEXT,
  example_request JSONB,
  example_response JSONB,
  required_fields JSONB,
  response_fields JSONB,
  tags TEXT[] DEFAULT '{}',
  display_order INTEGER DEFAULT 0,
  total_queries INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  old_values JSONB,
  new_values JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. ÍNDICES
-- =====================================================

-- Índices users
CREATE INDEX IF NOT EXISTS idx_users_contractor_id ON public.users(contractor_id);
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON public.users(tenant_id);

-- Índices subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);

-- Índices api_keys
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON public.api_keys(key_hash);

-- Índices api_usage_logs
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_user_id ON public.api_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_created_at ON public.api_usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_api_key_id ON public.api_usage_logs(api_key_id);

-- Índices payments
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_mp_payment_id ON public.payments(mp_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_external_reference ON public.payments(external_reference);

-- Índices credit_purchases
CREATE INDEX IF NOT EXISTS idx_credit_purchases_user_id ON public.credit_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_purchases_status ON public.credit_purchases(status);
CREATE INDEX IF NOT EXISTS idx_credit_purchases_mp_payment_id ON public.credit_purchases(mp_payment_id);

-- =====================================================
-- 6. ENABLE RLS
-- =====================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 7. RLS POLICIES
-- =====================================================

-- Users policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Subscriptions policies
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
CREATE POLICY "Users can view own subscription" ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own subscription" ON public.subscriptions;
CREATE POLICY "Users can insert own subscription" ON public.subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own subscription" ON public.subscriptions;
CREATE POLICY "Users can update own subscription" ON public.subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- API Keys policies
DROP POLICY IF EXISTS "Users can view own api keys" ON public.api_keys;
CREATE POLICY "Users can view own api keys" ON public.api_keys FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own api keys" ON public.api_keys;
CREATE POLICY "Users can insert own api keys" ON public.api_keys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own api keys" ON public.api_keys;
CREATE POLICY "Users can update own api keys" ON public.api_keys FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own api keys" ON public.api_keys;
CREATE POLICY "Users can delete own api keys" ON public.api_keys FOR DELETE
  USING (auth.uid() = user_id);

-- API Usage Logs policies
DROP POLICY IF EXISTS "Users can view own usage logs" ON public.api_usage_logs;
CREATE POLICY "Users can view own usage logs" ON public.api_usage_logs FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can insert usage logs" ON public.api_usage_logs;
CREATE POLICY "Service role can insert usage logs" ON public.api_usage_logs FOR INSERT
  WITH CHECK (true);

-- Rate Limits policies (public read)
DROP POLICY IF EXISTS "Authenticated users can view rate limits" ON public.rate_limits;
CREATE POLICY "Authenticated users can view rate limits" ON public.rate_limits FOR SELECT
  TO authenticated USING (true);

-- Payments policies
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own payments" ON public.payments;
CREATE POLICY "Users can insert own payments" ON public.payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own payments" ON public.payments;
CREATE POLICY "Users can update own payments" ON public.payments FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage all payments" ON public.payments;
CREATE POLICY "Service role can manage all payments" ON public.payments FOR ALL
  TO service_role USING (true) WITH CHECK (true);

-- Credit Purchases policies
DROP POLICY IF EXISTS "Users can view own credit purchases" ON public.credit_purchases;
CREATE POLICY "Users can view own credit purchases" ON public.credit_purchases
  FOR SELECT TO authenticated 
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Service can insert credit purchases" ON public.credit_purchases;
CREATE POLICY "Service can insert credit purchases" ON public.credit_purchases
  FOR INSERT TO authenticated 
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Service can update credit purchases" ON public.credit_purchases;
CREATE POLICY "Service can update credit purchases" ON public.credit_purchases
  FOR UPDATE TO service_role 
  USING (true);

-- Tenants policies
DROP POLICY IF EXISTS "Tenants public read" ON public.tenants;
CREATE POLICY "Tenants public read" ON public.tenants FOR SELECT TO authenticated USING (true);

-- Contractors policies
DROP POLICY IF EXISTS "Contractors view own" ON public.contractors;
CREATE POLICY "Contractors view own" ON public.contractors FOR SELECT TO authenticated USING (tenant_id = auth.jwt()->>'tenant_id');

-- Subscription Plans policies
DROP POLICY IF EXISTS "Subscription plans public read" ON public.subscription_plans;
CREATE POLICY "Subscription plans public read" ON public.subscription_plans FOR SELECT TO authenticated USING (true);

-- API Modules policies
DROP POLICY IF EXISTS "API modules public read" ON public.api_modules;
CREATE POLICY "API modules public read" ON public.api_modules FOR SELECT TO public USING (is_visible = true);

-- Audit Logs policies
DROP POLICY IF EXISTS "Audit logs view own" ON public.audit_logs;
CREATE POLICY "Audit logs view own" ON public.audit_logs FOR SELECT TO authenticated USING (user_id = auth.uid()::TEXT);

-- =====================================================
-- 8. FUNCTIONS
-- =====================================================

-- Function to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  
  INSERT INTO public.subscriptions (user_id, plan_type, status)
  VALUES (NEW.id, 'free', 'active');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to activate subscription after payment
CREATE OR REPLACE FUNCTION public.activate_subscription_after_payment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    INSERT INTO public.subscriptions (
      user_id, plan_type, status, mp_payment_id,
      current_period_start, current_period_end
    )
    VALUES (
      NEW.user_id, NEW.plan_type, 'active', NEW.mp_payment_id,
      NOW(), NOW() + INTERVAL '30 days'
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
      plan_type = NEW.plan_type,
      status = 'active',
      mp_payment_id = NEW.mp_payment_id,
      current_period_start = NOW(),
      current_period_end = NOW() + INTERVAL '30 days',
      updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to consume credits
CREATE OR REPLACE FUNCTION consume_credits(
  p_user_id UUID,
  p_amount INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_balance INTEGER;
BEGIN
  SELECT credits_available INTO v_current_balance
  FROM public.users
  WHERE id = p_user_id;

  IF v_current_balance IS NULL OR v_current_balance < p_amount THEN
    RETURN FALSE;
  END IF;

  UPDATE public.users
  SET 
    credits_available = credits_available - p_amount,
    credits_used = credits_used + p_amount,
    updated_at = NOW()
  WHERE id = p_user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add credits
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

-- Function para atualizar credit_purchases updated_at
CREATE OR REPLACE FUNCTION update_credit_purchases_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 9. TRIGGERS
-- =====================================================

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_api_keys_updated_at ON public.api_keys;
CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON public.api_keys
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_rate_limits_updated_at ON public.rate_limits;
CREATE TRIGGER update_rate_limits_updated_at BEFORE UPDATE ON public.rate_limits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON public.payments;
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_tenants_updated_at ON public.tenants;
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_contractors_updated_at ON public.contractors;
CREATE TRIGGER update_contractors_updated_at BEFORE UPDATE ON public.contractors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscription_plans_updated_at ON public.subscription_plans;
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_api_modules_updated_at ON public.api_modules;
CREATE TRIGGER update_api_modules_updated_at BEFORE UPDATE ON public.api_modules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para credit_purchases
DROP TRIGGER IF EXISTS trigger_credit_purchases_updated_at ON public.credit_purchases;
CREATE TRIGGER trigger_credit_purchases_updated_at
  BEFORE UPDATE ON public.credit_purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_credit_purchases_updated_at();

-- Trigger para novo usuário
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger para ativar subscription após pagamento
DROP TRIGGER IF EXISTS tr_activate_subscription_on_payment ON public.payments;
CREATE TRIGGER tr_activate_subscription_on_payment
  AFTER UPDATE ON public.payments
  FOR EACH ROW WHEN (NEW.status = 'approved')
  EXECUTE FUNCTION public.activate_subscription_after_payment();

-- =====================================================
-- 10. DEFAULT DATA
-- =====================================================

-- Insert default tenant
INSERT INTO public.tenants (id, name, slug, status)
VALUES ('default-tenant', 'Default Tenant', 'default', 'active')
ON CONFLICT (id) DO NOTHING;

-- Insert default contractor
INSERT INTO public.contractors (id, tenant_id, type, name, cpf_cnpj, email, status)
VALUES ('default-contractor', 'default-tenant', 'individual', 'Default User', '00000000000', 'default@example.com', 'active')
ON CONFLICT (id) DO NOTHING;

-- Insert default rate limits
INSERT INTO public.rate_limits (plan_type, requests_per_minute, requests_per_day, requests_per_month)
VALUES
  ('free', 10, 100, 1000),
  ('basic', 100, 10000, 100000),
  ('pro', 1000, 100000, 1000000),
  ('enterprise', 10000, 1000000, 10000000)
ON CONFLICT (plan_type) DO NOTHING;

-- =====================================================
-- 11. STORAGE (Avatars)
-- =====================================================

-- Create user-uploads bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-uploads', 'user-uploads', true, 5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Avatars are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;

-- Create storage policies for avatars
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'user-uploads' AND name LIKE 'avatars/%');

CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'user-uploads' AND name LIKE 'avatars/%');

CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'user-uploads' AND name LIKE 'avatars/%');

CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'user-uploads' AND name LIKE 'avatars/%')
WITH CHECK (bucket_id = 'user-uploads' AND name LIKE 'avatars/%');

-- =====================================================
-- 12. FIXES & DATA SYNC
-- =====================================================

-- Fix nullable columns - tornar colunas nullable
ALTER TABLE public.users ALTER COLUMN contractor_id DROP NOT NULL;
ALTER TABLE public.users ALTER COLUMN tenant_id DROP NOT NULL;
ALTER TABLE public.users ALTER COLUMN role_id DROP NOT NULL;

-- Atualizar users existentes com valores do tenant/contractor padrão
UPDATE public.users 
SET contractor_id = COALESCE(contractor_id, 'default-contractor'),
    tenant_id = COALESCE(tenant_id, 'default-tenant')
WHERE contractor_id IS NULL OR contractor_id = '';

-- Sincronizar dados existentes
UPDATE public.users SET 
  full_name = COALESCE(full_name, email),
  role = COALESCE(role, 'user'),
  status = COALESCE(status, 'active'),
  plan_type = COALESCE(plan_type, 'free')
WHERE full_name IS NULL;

-- =====================================================
-- 13. COMMENTS
-- =====================================================

COMMENT ON COLUMN public.api_keys.key_preview IS 'Masked preview of the API key for display (e.g., bdc_xxxxx...xxxx)';

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

SELECT '✅ Axion Database Setup Completed Successfully!' as message;
