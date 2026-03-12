-- =====================================================
-- MIGRATION: Sincronizar schema Supabase com Prisma
-- Adiciona colunas faltantes que o Prisma espera
-- =====================================================

-- =====================================================
-- 1. TABELA USERS - Adicionar colunas do Prisma
-- =====================================================

-- Renomear 'name' para 'full_name' (se existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'users' AND column_name = 'name') THEN
    ALTER TABLE public.users RENAME COLUMN name TO full_name;
  END IF;
END $$;

-- Adicionar colunas que o Prisma espera
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS password_hash TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_login_ip TEXT,
  ADD COLUMN IF NOT EXISTS function TEXT,
  ADD COLUMN IF NOT EXISTS credits_available INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS credits_used INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS credits_balance INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS role_id TEXT,
  ADD COLUMN IF NOT EXISTS contractor_id TEXT,
  ADD COLUMN IF NOT EXISTS tenant_id TEXT;

-- =====================================================
-- 2. TABELA API_KEYS - Adicionar colunas do Prisma
-- =====================================================

ALTER TABLE public.api_keys 
  ADD COLUMN IF NOT EXISTS contractor_id TEXT,
  ADD COLUMN IF NOT EXISTS key_encrypted TEXT,
  ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMPTZ;

-- =====================================================
-- 3. TABELA SUBSCRIPTIONS - Adicionar colunas do Prisma
-- =====================================================

ALTER TABLE public.subscriptions 
  ADD COLUMN IF NOT EXISTS contractor_id TEXT,
  ADD COLUMN IF NOT EXISTS plan_id TEXT,
  ADD COLUMN IF NOT EXISTS asaas_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS credits_available INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS credits_used INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cycle_start_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cycle_end_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

-- =====================================================
-- 4. CRIAR TABELAS QUE O PRISMA ESPERA (se não existirem)
-- =====================================================

-- Tabela tenants
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

-- Tabela contractors
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

-- Tabela subscription_plans
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

-- Tabela api_modules
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

-- Tabela audit_logs
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
-- 5. ATUALIZAR TRIGGERS E POLÍTICAS
-- =====================================================

-- Enable RLS nas novas tabelas
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Criar políticas básicas
DROP POLICY IF EXISTS "Tenants public read" ON public.tenants;
CREATE POLICY "Tenants public read" ON public.tenants FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Contractors view own" ON public.contractors;
CREATE POLICY "Contractors view own" ON public.contractors FOR SELECT TO authenticated USING (tenant_id = auth.jwt()->>'tenant_id');

DROP POLICY IF EXISTS "Subscription plans public read" ON public.subscription_plans;
CREATE POLICY "Subscription plans public read" ON public.subscription_plans FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "API modules public read" ON public.api_modules;
CREATE POLICY "API modules public read" ON public.api_modules FOR SELECT TO public USING (is_visible = true);

DROP POLICY IF EXISTS "Audit logs view own" ON public.audit_logs;
CREATE POLICY "Audit logs view own" ON public.audit_logs FOR SELECT TO authenticated USING (user_id = auth.uid()::TEXT);

-- =====================================================
-- 6. SINCRONIZAR DADOS EXISTENTES
-- =====================================================

-- Atualizar users existentes com valores padrão
UPDATE public.users SET 
  full_name = COALESCE(full_name, email),
  role = COALESCE(role, 'user'),
  status = COALESCE(status, 'active'),
  plan_type = COALESCE(plan_type, 'free')
WHERE full_name IS NULL;

-- =====================================================
-- SUCCESS
-- =====================================================

SELECT '✅ Schema sincronizado com Prisma!' as message;
