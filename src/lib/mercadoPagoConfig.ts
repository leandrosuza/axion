import { MercadoPagoConfig, Payment, PreApproval } from 'mercadopago'

export const mp = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
})

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
}