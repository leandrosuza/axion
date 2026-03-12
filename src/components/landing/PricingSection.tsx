import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check } from 'lucide-react'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for testing and small projects',
    popular: false,
    features: [
      '1,000 API calls/month',
      '100 calls/day',
      '10 calls/minute',
      'All 6 endpoints',
      'Email support',
      'API documentation',
    ],
    cta: 'Get Started Free',
    href: '/register',
  },
  {
    name: 'Basic',
    price: '$29',
    period: '/month',
    description: 'Ideal for small to medium businesses',
    popular: false,
    features: [
      '30,000 API calls/month',
      '1,000 calls/day',
      '60 calls/minute',
      'All 6 endpoints',
      'Priority email support',
      'API documentation',
      'Usage analytics',
    ],
    cta: 'Start Basic Plan',
    href: '/register',
  },
  {
    name: 'Pro',
    price: '$99',
    period: '/month',
    description: 'For growing companies with high volume',
    popular: true,
    features: [
      '300,000 API calls/month',
      '10,000 calls/day',
      '300 calls/minute',
      'All 6 endpoints',
      'Priority support 24/7',
      'Advanced analytics',
      'Webhook integrations',
      'Custom rate limits',
    ],
    cta: 'Start Pro Plan',
    href: '/register',
  },
  {
    name: 'Enterprise',
    price: '$499',
    period: '/month',
    description: 'Unlimited access for large organizations',
    popular: false,
    features: [
      'Unlimited API calls',
      'No rate limits',
      'All 6 endpoints',
      'Dedicated support',
      'SLA guarantee 99.9%',
      'Custom integrations',
      'White-label options',
      'Dedicated account manager',
      'On-premise deployment',
    ],
    cta: 'Contact Sales',
    href: '/register',
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="container mx-auto px-6 max-w-[1400px]">
        <div className="text-center mb-16">
          <h2 className="text-[45px] font-bold text-[#1D203A] mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-[18px] text-[#555866] max-w-3xl mx-auto">
            Choose the plan that fits your needs. All plans include access to all 6 API endpoints.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative bg-white border-2 rounded-lg shadow-md hover:shadow-xl transition-all ${
                plan.popular ? 'border-[#0069FF] scale-105' : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-[#0069FF] text-white px-4 py-1">Most Popular</Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4 pt-8">
                <CardTitle className="text-[24px] font-bold text-[#1D203A] mb-2">
                  {plan.name}
                </CardTitle>
                <div className="mb-2">
                  <span className="text-[42px] font-bold text-[#1D203A]">{plan.price}</span>
                  <span className="text-[16px] text-[#555866]">{plan.period}</span>
                </div>
                <CardDescription className="text-[14px]">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-[14px] text-[#555866]">
                      <Check className="w-5 h-5 text-[#0069FF] flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href={plan.href} className="block">
                  <Button
                    className={`w-full h-12 rounded-md font-semibold ${
                      plan.popular
                        ? 'bg-[#0069FF] hover:bg-[#0055DD] text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-[#1D203A]'
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <p className="text-[16px] text-[#555866] mb-4">
            All plans include API documentation, usage analytics, and access to all endpoints
          </p>
          <p className="text-[14px] text-[#555866]">
            Need a custom plan? <Link href="/register" className="text-[#0069FF] hover:underline font-semibold">Contact our sales team</Link>
          </p>
        </div>
      </div>
    </section>
  )
}
