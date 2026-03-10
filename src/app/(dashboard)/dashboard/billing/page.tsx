import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  CreditCard,
  Check,
  Zap,
  Crown,
  Building2,
  Calendar,
  DollarSign,
  TrendingUp
} from 'lucide-react'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import Link from 'next/link'
import { CheckoutButton } from '@/components/billing/checkout-button'
import { PortalButton } from '@/components/billing/portal-button'

const plans = [
  {
    name: 'Free',
    price: 0,
    priceId: null,
    description: 'Perfeito para testes e projetos pequenos',
    features: [
      '100 requisições por dia',
      '1.000 requisições por mês',
      'Acesso básico à API',
      'Suporte da comunidade',
      'Limites de taxa padrão'
    ],
    icon: Zap,
    color: 'text-gray-500'
  },
  {
    name: 'Basic',
    price: 29,
    priceId: 'price_basic',
    description: 'Ótimo para empresas em crescimento',
    features: [
      '10.000 requisições por dia',
      '100.000 requisições por mês',
      'Acesso completo à API',
      'Suporte por e-mail',
      'Processamento prioritário',
      'Análises avançadas'
    ],
    icon: TrendingUp,
    color: 'text-blue-500',
    popular: true
  },
  {
    name: 'Pro',
    price: 99,
    priceId: 'price_pro',
    description: 'Para aplicações de alto volume',
    features: [
      '100.000 requisições por dia',
      '1.000.000 requisições por mês',
      'Acesso completo à API',
      'Suporte prioritário',
      'Webhooks',
      'Integrações personalizadas',
      'Análises avançadas',
      'Garantia de SLA'
    ],
    icon: Crown,
    color: 'text-purple-500'
  },
  {
    name: 'Enterprise',
    price: 499,
    priceId: 'price_enterprise',
    description: 'Soluções personalizadas para grandes organizações',
    features: [
      'Requisições ilimitadas',
      'Infraestrutura dedicada',
      'Acesso completo à API',
      'Suporte dedicado 24/7',
      'Integrações personalizadas',
      'Análises avançadas',
      'SLA de 99,99%',
      'Contratos personalizados',
      'Opções on-premise'
    ],
    icon: Building2,
    color: 'text-orange-500'
  }
]

export default async function BillingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user's subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Fetch usage for current month
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const { count: monthlyUsage } = await supabase
    .from('api_usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', startOfMonth.toISOString())

  const currentPlan = plans.find(p => p.name.toLowerCase() === subscription?.plan_type)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Cobrança e Assinatura</h1>
        <p className="text-gray-400">Gerencie sua assinatura e informações de cobrança</p>
      </div>

      {/* Current Plan */}
      <Card className="bg-white/5 border-white/10 backdrop-blur border-2 border-[#0069FF]/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-white">Plano Atual</CardTitle>
              <CardDescription className="text-gray-400">Sua assinatura ativa</CardDescription>
            </div>
            <Badge className="text-lg px-4 py-2">
              {subscription?.plan_type?.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-gray-400 mb-1">Preço Mensal</div>
              <div className="text-3xl font-bold text-white">
                ${currentPlan?.price || 0}
                <span className="text-lg text-gray-400">/mês</span>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Status</div>
              <div className="flex items-center gap-2">
                <Badge variant={subscription?.status === 'active' ? 'default' : 'secondary'}>
                  {subscription?.status?.toUpperCase()}
                </Badge>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Uso Este Mês</div>
              <div className="text-2xl font-bold text-white">
                {monthlyUsage?.toLocaleString() || 0}
              </div>
            </div>
          </div>

          {subscription?.current_period_end && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Calendar className="h-4 w-4" />
              <span>
                {subscription.status === 'active'
                  ? `Renova em ${format(new Date(subscription.current_period_end), 'dd \'de\' MMMM \'de\' yyyy')}`
                  : `Expirou em ${format(new Date(subscription.current_period_end), 'dd \'de\' MMMM \'de\' yyyy')}`
                }
              </span>
            </div>
          )}

          <div className="flex gap-3">
            {subscription?.plan_type !== 'enterprise' && subscription?.plan_type !== 'pro' && (
              <CheckoutButton
                priceId={subscription?.plan_type === 'free' ? process.env.STRIPE_BASIC_PRICE_ID || 'price_basic' : process.env.STRIPE_PRO_PRICE_ID || 'price_pro'}
                planType={subscription?.plan_type === 'free' ? 'basic' : 'pro'}
                className="bg-[#0069FF] hover:bg-[#0069FF]/90 text-white"
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Atualizar Plano
              </CheckoutButton>
            )}
            {subscription?.plan_type !== 'free' && (
              <PortalButton variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <CreditCard className="mr-2 h-4 w-4" />
                Gerenciar Forma de Pagamento
              </PortalButton>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-white">Planos Disponíveis</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const Icon = plan.icon
            const isCurrentPlan = plan.name.toLowerCase() === subscription?.plan_type

            return (
              <Card
                key={plan.name}
                className={`relative bg-white/5 border-white/10 backdrop-blur ${plan.popular ? 'border-[#0069FF]/50 shadow-lg' : ''} ${isCurrentPlan ? 'ring-2 ring-[#0069FF]' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-[#0069FF]">Mais Popular</Badge>
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute -top-3 right-4">
                    <Badge variant="secondary">Plano Atual</Badge>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className={`h-8 w-8 ${plan.color}`} />
                    <CardTitle className="text-2xl text-white">{plan.name}</CardTitle>
                  </div>
                  <div className="text-3xl font-bold text-white">
                    ${plan.price}
                    <span className="text-lg text-gray-400">/mo</span>
                  </div>
                  <CardDescription className="text-gray-400">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-[#0069FF] shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {!isCurrentPlan && plan.name !== 'Free' && (
                    <CheckoutButton
                      priceId={plan.priceId || ''}
                      planType={plan.name.toLowerCase()}
                      className={`w-full ${plan.popular ? 'bg-[#0069FF] hover:bg-[#0069FF]/90 text-white' : 'border-white/20 text-white hover:bg-white/10'}`}
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      {subscription && plans.findIndex(p => p.name.toLowerCase() === subscription.plan_type) < plans.findIndex(p => p.name === plan.name)
                        ? 'Atualizar'
                        : 'Rebaixar'}
                    </CheckoutButton>
                  )}
                  {isCurrentPlan && (
                    <Button className="w-full border-white/20 text-white hover:bg-white/10" variant="outline" disabled>
                      Plano Atual
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Payment History */}
      {subscription?.plan_type !== 'free' && (
        <Card className="bg-white/5 border-white/10 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">Histórico de Pagamentos</CardTitle>
            <CardDescription className="text-gray-400">Suas transações recentes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-white">
                      Plano {subscription?.plan_type?.charAt(0).toUpperCase() + subscription?.plan_type?.slice(1)}
                    </div>
                    <div className="text-sm text-gray-400">
                      {subscription?.current_period_start
                        ? format(new Date(subscription.current_period_start), 'dd \'de\' MMMM \'de\' yyyy')
                        : 'N/A'
                      }
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-white">${currentPlan?.price || 0}</div>
                  <Badge variant="default" className="text-xs">Pago</Badge>
                </div>
              </div>

              <div className="text-center py-8 text-gray-400">
                <p>Nenhum histórico de pagamento adicional disponível</p>
                <p className="text-sm mt-1">Futuras faturas aparecerão aqui</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Billing Information */}
      {subscription?.plan_type !== 'free' && (
        <Card className="bg-white/5 border-white/10 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">Informações de Cobrança</CardTitle>
            <CardDescription className="text-gray-400">Gerencie seus detalhes de pagamento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-white/10 rounded-lg">
              <div className="flex items-center gap-3">
                <CreditCard className="h-8 w-8 text-gray-400" />
                <div>
                  <div className="font-medium text-white">Forma de Pagamento</div>
                  <div className="text-sm text-gray-400">
                    {subscription?.stripe_customer_id
                      ? 'Cartão terminando em ••••'
                      : 'Nenhuma forma de pagamento cadastrada'
                    }
                  </div>
                </div>
              </div>
              <PortalButton variant="outline" className="border-white/20 text-white hover:bg-white/10">
                Atualizar
              </PortalButton>
            </div>

            <div className="p-4 bg-black/30 border border-white/10 rounded-lg">
              <h4 className="font-semibold mb-2 text-white">Endereço de Cobrança</h4>
              <p className="text-sm text-gray-400">
                Nenhum endereço de cobrança cadastrado
              </p>
              <Button variant="link" className="px-0 mt-2 text-[#0069FF]">
                Adicionar endereço de cobrança
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* FAQ */}
      <Card className="bg-white/5 border-white/10 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">Perguntas Frequentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2 text-white">Como funciona a cobrança?</h4>
            <p className="text-sm text-gray-400">
              Você é cobrado mensalmente com base no plano selecionado. Sua assinatura renova automaticamente a cada mês, a menos que seja cancelada.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-white">Posso mudar meu plano a qualquer momento?</h4>
            <p className="text-sm text-gray-400">
              Sim! Você pode atualizar ou rebaixar seu plano a qualquer momento. As alterações entram em vigor imediatamente e faremos o rateio proporcional de qualquer cobrança.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-white">O que acontece se eu exceder meus limites de taxa?</h4>
            <p className="text-sm text-gray-400">
              Se você exceder os limites de taxa do seu plano, suas requisições serão limitadas. Considere atualizar para um plano superior para mais capacidade.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-white">Vocês oferecem reembolsos?</h4>
            <p className="text-sm text-gray-400">
              Oferecemos uma garantia de reembolso de 30 dias para todos os planos pagos. Entre em contato com o suporte para solicitações de reembolso.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Contact Support */}
      <Card className="bg-[#0069FF]/10 border-[#0069FF]/30 backdrop-blur">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg mb-1 text-white">Precisa de ajuda com cobrança?</h3>
              <p className="text-sm text-gray-400">
                Nossa equipe de suporte está aqui para ajudar com quaisquer dúvidas sobre cobrança
              </p>
            </div>
            <Link href="/dashboard/settings">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                Contatar Suporte
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


