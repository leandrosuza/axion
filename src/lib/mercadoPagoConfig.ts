<<<<<<< HEAD
import { MercadoPagoConfig } from 'mercadopago'

// Determina o ambiente de pagamento (padrão: production para pagamentos reais)
const environment = process.env.MP_ENVIRONMENT || 'production'
const isProduction = environment === 'production'

// Seleciona as credenciais baseadas no ambiente
const accessToken = isProduction 
  ? process.env.MP_PROD_ACCESS_TOKEN 
  : process.env.MP_TEST_ACCESS_TOKEN

const publicKey = isProduction
  ? process.env.MP_PROD_PUBLIC_KEY
  : process.env.MP_TEST_PUBLIC_KEY

// Validação
if (!accessToken) {
  console.error(`[Mercado Pago] ERRO: MP_${isProduction ? 'PROD' : 'TEST'}_ACCESS_TOKEN não configurado`)
}

if (!publicKey) {
  console.error(`[Mercado Pago] ERRO: MP_${isProduction ? 'PROD' : 'TEST'}_PUBLIC_KEY não configurado`)
}

// Configuração do cliente (exportado como mp e mpConfig para compatibilidade)
export const mpConfig = new MercadoPagoConfig({
  accessToken: accessToken!,
})

// Alias para compatibilidade
export const mp = mpConfig

// Exporta informações do ambiente
export const mpEnvironment = {
  isProduction,
  isDevelopment: !isProduction,
  environment,
  publicKey,
  accessTokenPrefix: accessToken?.substring(0, 10) || 'N/A',
}

// Log de inicialização
console.log(`[Mercado Pago] Ambiente: ${environment.toUpperCase()}`)
console.log(`[Mercado Pago] Token: ${accessToken?.substring(0, 15)}...`)
console.log(`[Mercado Pago] Modo: ${isProduction ? '⚠️ PRODUÇÃO (pagamentos reais)' : '✅ TESTE (sandbox)'}`)

// Planos para assinaturas (LEGADO - mantido para compatibilidade)
=======
import { MercadoPagoConfig, Payment, PreApproval } from 'mercadopago'

export const mp = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
})

>>>>>>> upstream/master
export const MP_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    preapprovalPlanId: null,
  },
  basic: {
    name: 'Basic',
    price: 29,
    preapprovalPlanId: process.env.MP_BASIC_PLAN_ID,
  },
  pro: {
    name: 'Pro',
    price: 99,
    preapprovalPlanId: process.env.MP_PRO_PLAN_ID,
  },
  enterprise: {
    name: 'Enterprise',
    price: 499,
    preapprovalPlanId: process.env.MP_ENTERPRISE_PLAN_ID,
  },
<<<<<<< HEAD
}

// =====================================================
// NOVO: Pacotes de Créditos (Pay-per-use)
// =====================================================
// Quando os créditos acabam, o usuário compra mais

export const CREDIT_PACKAGES = {
  starter: {
    id: 'starter',
    name: 'Pacote Starter',
    credits: 100,
    price: 19.90,
    description: '100 créditos para uso',
  },
  basic: {
    id: 'basic',
    name: 'Pacote Basic',
    credits: 500,
    price: 79.90,
    description: '500 créditos para uso',
  },
  pro: {
    id: 'pro', 
    name: 'Pacote Pro',
    credits: 2000,
    price: 249.90,
    description: '2000 créditos para uso',
  },
  enterprise: {
    id: 'enterprise',
    name: 'Pacote Enterprise',
    credits: 10000,
    price: 999.90,
    description: '10000 créditos para uso',
  },
}

export type CreditPackageId = keyof typeof CREDIT_PACKAGES

// Custo por consulta API (em créditos)
export const API_CREDIT_COSTS = {
  standard: 1,      // Consultas padrão
  premium: 5,       // Consultas premium/complexas
  bulk: 0.5,        // Consultas em lote (desconto)
=======
>>>>>>> upstream/master
}