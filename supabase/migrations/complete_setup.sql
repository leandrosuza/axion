-- =====================================================
-- AXION - Complete Database Setup (Single File)
-- Combines: initial_schema + key_preview + storage + payments
-- Execute in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. CORE TABLES
-- =====================================================

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  cpf_cnpj TEXT,
  phone TEXT,
  account_type TEXT CHECK (account_type IN ('individual', 'business')) DEFAULT 'individual',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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
  updated_at TIMESTAMPTZ DEFAULT NOW()
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

-- Payments table (for PIX and other payment methods)
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

-- =====================================================
-- 2. INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON public.api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_user_id ON public.api_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_created_at ON public.api_usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_api_key_id ON public.api_usage_logs(api_key_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_mp_payment_id ON public.payments(mp_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_external_reference ON public.payments(external_reference);

-- =====================================================
-- 3. RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

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

-- =====================================================
-- 4. TRIGGERS AND FUNCTIONS
-- =====================================================

-- Function to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
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

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

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

DROP TRIGGER IF EXISTS tr_activate_subscription_on_payment ON public.payments;
CREATE TRIGGER tr_activate_subscription_on_payment
  AFTER UPDATE ON public.payments
  FOR EACH ROW WHEN (NEW.status = 'approved')
  EXECUTE FUNCTION public.activate_subscription_after_payment();

-- =====================================================
-- 5. DEFAULT DATA
-- =====================================================

-- Insert default rate limits
INSERT INTO public.rate_limits (plan_type, requests_per_minute, requests_per_day, requests_per_month)
VALUES
  ('free', 10, 100, 1000),
  ('basic', 100, 10000, 100000),
  ('pro', 1000, 100000, 1000000),
  ('enterprise', 10000, 1000000, 10000000)
ON CONFLICT (plan_type) DO NOTHING;

-- =====================================================
-- 6. STORAGE (Avatars)
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
-- 7. COLUMN COMMENTS
-- =====================================================

COMMENT ON COLUMN public.api_keys.key_preview IS 'Masked preview of the API key for display (e.g., bdc_xxxxx...xxxx)';

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

SELECT '✅ Database setup completed successfully!' as message;
