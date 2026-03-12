# Implementação Mercado Pago - Sistema de Créditos (Pay-per-Use)

## Resumo da Migração

Migração completa do sistema de pagamentos de **Stripe (assinaturas mensais)** para **Mercado Pago (créditos pay-per-use)**.

---

## 🔄 Mudança de Modelo

### Antes (Stripe)
- Assinaturas mensais recorrentes
- Planos: Free, Basic, Pro, Enterprise
- Cobrança automática todo mês

### Depois (Mercado Pago)
- Compra de créditos (pay-per-use)
- Pacotes: Starter, Basic, Pro, Enterprise
- Custo por consulta API (CNPJ, CPF, etc.)
- Sem cobrança mensal

---

## ✅ Implementações Concluídas

### 1. Configuração do Mercado Pago
**Arquivo:** `src/lib/mercadoPagoConfig.ts`

```typescript
// Pacotes de créditos disponíveis
CREDIT_PACKAGES = {
  starter: { id: 'starter', name: 'Pacote Starter', credits: 100, price: 29.90 },
  basic: { id: 'basic', name: 'Pacote Basic', credits: 500, price: 79.90 },
  pro: { id: 'pro', name: 'Pacote Pro', credits: 2000, price: 249.90 },
  enterprise: { id: 'enterprise', name: 'Pacote Enterprise', credits: 10000, price: 999.90 }
}

// Custo por consulta API
API_CREDIT_COSTS = {
  cnpj_basic: 1,
  cnpj_complete: 2,
  cpf_basic: 1,
  cpf_complete: 2,
  // ...
}
```

### 2. APIs de Créditos

#### POST /api/credits/purchase
**Arquivo:** `src/app/api/credits/purchase/route.ts`

Cria pagamento via Mercado Pago Preference API:
- Gera registro em `credit_purchases` (status: pending)
- Retorna URL de checkout do Mercado Pago
- Envia `external_reference` = ID da compra

#### GET /api/credits/balance
**Arquivo:** `src/app/api/credits/balance/route.ts`

Retorna saldo do usuário:
```json
{
  "balance": 1500,
  "available": 1500,
  "used": 0,
  "purchases": [...]
}
```

#### POST /api/credits/consume
**Arquivo:** `src/app/api/credits/consume/route.ts`

Consome créditos por consulta:
- Verifica saldo disponível
- Deduz créditos do saldo
- Registra uso em `api_usage_logs`

### 3. Webhook do Mercado Pago
**Arquivo:** `src/app/api/webhooks/mercadopago/route.ts`

Processa notificações de pagamento:

| Status | Ação |
|--------|------|
| `approved` | ✅ Adiciona créditos, marca como `completed` |
| `pending` | ⏳ Mantém `pending`, aguarda |
| `rejected/cancelled/refunded/charged_back` | ❌ Marca como `failed` |

**Fluxo do webhook:**
1. Recebe notificação do Mercado Pago
2. Busca pagamento na API do MP
3. Encontra compra em `credit_purchases` via `external_reference`
4. Atualiza status da compra
5. Adiciona créditos ao usuário (`users.credits_balance`)

### 4. Banco de Dados (Supabase)
**Arquivo:** `supabase/migrations/20250312000001_add_credits_system.sql`

Tabelas criadas:
- `credit_purchases` - Registro de compras de créditos
- `api_usage_logs` - Log de consumo de créditos
- Colunas adicionadas em `users`:
  - `credits_balance` (total acumulado)
  - `credits_available` (disponível para uso)
  - `credits_used` (já consumidos)

### 5. Frontend

#### checkout-button.tsx
**Arquivo:** `src/components/billing/checkout-button.tsx`

Atualizado para usar `packageId` (starter, basic, pro, enterprise) em vez de `planType` (free, basic, pro, enterprise).

Chama `/api/credits/purchase` com o pacote selecionado.

#### billing/page.tsx
**Arquivo:** `src/app/(dashboard)/dashboard/billing/page.tsx`

Atualizado para passar `packageId` ao CheckoutButton.

---

## 🔧 Arquivos Modificados/Criados

### APIs Novas
| Arquivo | Descrição |
|---------|-----------|
| `src/app/api/credits/purchase/route.ts` | Cria pagamento de créditos |
| `src/app/api/credits/balance/route.ts` | Consulta saldo |
| `src/app/api/credits/consume/route.ts` | Consome créditos |
| `src/app/api/credits/add-manual/route.ts` | Adiciona créditos manualmente (testes) |

### APIs Atualizadas
| Arquivo | Alteração |
|---------|-----------|
| `src/app/api/webhooks/mercadopago/route.ts` | Processa pagamentos de créditos |
| `src/app/api/subscriptions/checkout/route.ts` | Legado (mantido para compatibilidade) |

### Componentes
| Arquivo | Alteração |
|---------|-----------|
| `src/components/billing/checkout-button.tsx` | Usa `packageId` em vez de `planType` |
| `src/app/(dashboard)/dashboard/billing/page.tsx` | Atualizado para créditos |

### Configuração
| Arquivo | Alteração |
|---------|-----------|
| `src/lib/mercadoPagoConfig.ts` | Adicionado CREDIT_PACKAGES e API_CREDIT_COSTS |

---

## 📊 Estrutura do Banco

### Tabela: credit_purchases
```sql
CREATE TABLE credit_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  package_id TEXT, -- starter, basic, pro, enterprise
  credits INTEGER,
  amount DECIMAL(10,2),
  status TEXT, -- pending, completed, failed
  mp_payment_id TEXT,
  paid_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Tabela: api_usage_logs
```sql
CREATE TABLE api_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  api_key_id UUID REFERENCES api_keys(id),
  endpoint TEXT,
  credits_consumed INTEGER,
  query_params JSONB,
  created_at TIMESTAMP
);
```

---

## 🔐 Variáveis de Ambiente

```env
# =====================================================
# SUPABASE
# =====================================================
NEXT_PUBLIC_SUPABASE_URL=https://aonjvbgfbydkhsfdrpfj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# PostgreSQL Connection (para Prisma)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# =====================================================
# MERCADO PAGO
# =====================================================
# Ambiente: 'sandbox' para teste | 'production' para produção
MP_ENVIRONMENT=sandbox

# --- PRODUÇÃO ---
MP_PROD_ACCESS_TOKEN=APP_USR-...
MP_PROD_PUBLIC_KEY=APP_USR-...

# --- SANDBOX/TESTE ---
MP_TEST_ACCESS_TOKEN=TEST-...
MP_TEST_PUBLIC_KEY=TEST-...

# =====================================================
# APP CONFIGURATION
# =====================================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
# Use ngrok URL para testar webhooks localmente
# NEXT_PUBLIC_APP_URL=https://seu-ngrok.ngrok-free.app
```

---

## 🧪 Testes Realizados

### Fluxo de Compra Testado
1. ✅ Usuário clica "Comprar Créditos" no dashboard
2. ✅ API cria registro em `credit_purchases` (pending)
3. ✅ Redireciona para checkout do Mercado Pago
4. ✅ Pagamento aprovado
5. ✅ Webhook recebe notificação
6. ✅ Créditos adicionados ao usuário
7. ✅ Compra marcada como `completed`

### Webhook Processando
- ✅ `approved` → Adiciona créditos
- ✅ `pending` → Mantém pendente
- ✅ `failed/rejected/cancelled` → Marca como falha
- ✅ `merchant_order` → Ignora (não é pagamento)

---

## 📱 Como Usar

### Comprar Créditos
```bash
POST /api/credits/purchase
Body: { "packageId": "basic" }

Response:
{
  "url": "https://www.mercadopago.com.br/checkout/...",
  "paymentId": "uuid-da-compra",
  "package": { "id": "basic", "name": "Pacote Basic", "credits": 500, "price": 79.90 }
}
```

### Verificar Saldo
```bash
GET /api/credits/balance

Response:
{
  "balance": 1500,
  "available": 1500,
  "used": 0,
  "purchases": [...]
}
```

### Consumir Créditos (uso interno)
```bash
POST /api/credits/consume
Body: {
  "credits": 2,
  "endpoint": "/api/consulta/cnpj",
  "apiKeyId": "..."
}
```

---

## 📝 Próximos Passos (Opcionais)

- [ ] Mostrar saldo de créditos no dashboard visualmente
- [ ] Integrar consumo de créditos nas APIs de consulta (CNPJ, CPF, etc.)
- [ ] Criar página de histórico de compras
- [ ] Adicionar alerta de saldo baixo
- [ ] Implementar recarga automática (opcional)

---

## 🎯 Resumo

Sistema **pay-per-use** implementado com sucesso:
- ✅ Compra de créditos via Mercado Pago
- ✅ Webhook processando pagamentos automaticamente
- ✅ Créditos acumulativos (compra + compra = soma)
- ✅ Histórico de compras mantido
- ✅ Sem cobrança mensal - paga só quando usar!

---

**Data da implementação:** Março 2026  
**Baseado no projeto:** axion-master
