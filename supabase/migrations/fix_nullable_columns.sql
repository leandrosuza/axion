-- =====================================================
-- FIX: Tornar colunas nullable para usuários existentes
-- =====================================================

-- Tornar contractor_id nullable na tabela users
ALTER TABLE public.users ALTER COLUMN contractor_id DROP NOT NULL;
ALTER TABLE public.users ALTER COLUMN tenant_id DROP NOT NULL;
ALTER TABLE public.users ALTER COLUMN role_id DROP NOT NULL;

-- Definir valores padrão para registros existentes
UPDATE public.users SET 
  contractor_id = COALESCE(contractor_id, ''),
  tenant_id = COALESCE(tenant_id, ''),
  role_id = COALESCE(role_id, '');

-- Ou tornar as colunas nullable (melhor opção)
-- Já feito acima com DROP NOT NULL

-- Criar tenant padrão se não existir
INSERT INTO public.tenants (id, name, slug, status)
VALUES ('default-tenant', 'Default Tenant', 'default', 'active')
ON CONFLICT (id) DO NOTHING;

-- Criar contractor padrão se não existir  
INSERT INTO public.contractors (id, tenant_id, type, name, cpf_cnpj, email, status)
VALUES ('default-contractor', 'default-tenant', 'individual', 'Default User', '00000000000', 'default@example.com', 'active')
ON CONFLICT (id) DO NOTHING;

-- Atualizar usuários existentes com valores do tenant/contractor padrão
UPDATE public.users 
SET contractor_id = 'default-contractor',
    tenant_id = 'default-tenant'
WHERE contractor_id IS NULL OR contractor_id = '';

SELECT '✅ Colunas ajustadas para usuários existentes!' as message;
