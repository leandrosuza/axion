import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Zap, TrendingDown, Calculator } from 'lucide-react'
import Link from 'next/link'

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch user's current balance
  const userProfile = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      credits_balance: true,
      plan_type: true,
    },
  })

  const currentBalance = userProfile?.credits_balance || 0

  // Volume pricing tiers with discounts
  const pricingTiers = [
    {
      queries: 100,
      basePrice: 10,
      discount: 0,
      popular: false,
      features: ['Basic tier', 'No discount', 'Perfect for testing']
    },
    {
      queries: 500,
      basePrice: 45,
      discount: 10,
      popular: false,
      features: ['10% discount', 'Good for small projects', 'Popular choice']
    },
    {
      queries: 1000,
      basePrice: 80,
      discount: 20,
      popular: true,
      features: ['20% discount', 'Best for medium usage', 'Most popular']
    },
    {
      queries: 5000,
      basePrice: 350,
      discount: 30,
      popular: false,
      features: ['30% discount', 'Enterprise level', 'Best value']
    },
    {
      queries: 10000,
      basePrice: 600,
      discount: 40,
      popular: false,
      features: ['40% discount', 'Bulk savings', 'Maximum value']
    },
    {
      queries: 50000,
      basePrice: 2500,
      discount: 50,
      popular: false,
      features: ['50% discount', 'Corporate tier', 'Ultimate savings']
    },
  ]

  // Calculate price per query
  const calculatePricePerQuery = (basePrice: number, queries: number, discount: number) => {
    const finalPrice = basePrice * (1 - discount / 100)
    return (finalPrice / queries).toFixed(4)
  }

  // Calculate savings
  const calculateSavings = (basePrice: number, discount: number) => {
    return (basePrice * discount / 100).toFixed(2)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <Calculator className="h-8 w-8" />
          Bulk Pricing & Discounts
        </h1>
        <p className="text-gray-400">Buy more queries, save more money. Choose the perfect package for your needs.</p>
      </div>

      {/* Current Balance */}
      <Card className="bg-gradient-to-r from-[#0069FF]/20 to-purple-600/20 border-[#0069FF]/30 backdrop-blur">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm mb-1">Your Current Balance</p>
              <p className="text-4xl font-bold text-white">{currentBalance.toLocaleString()}</p>
              <p className="text-gray-400 text-sm mt-1">query credits available</p>
            </div>
            <Link href="/dashboard/credits">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                View Details
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* How Bulk Pricing Works */}
      <Card className="bg-white/5 border-white/10 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-green-500" />
            How Volume Discounts Work
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="text-3xl mb-2">📈</div>
              <h3 className="font-semibold text-white mb-2">Buy More, Save More</h3>
              <p className="text-sm text-gray-400">
                The more queries you purchase at once, the lower your cost per query. Save up to 50%!
              </p>
            </div>
            <div>
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="font-semibold text-white mb-2">Instant Credits</h3>
              <p className="text-sm text-gray-400">
                Credits are added to your account immediately after purchase. Start using them right away.
              </p>
            </div>
            <div>
              <div className="text-3xl mb-2">♾️</div>
              <h3 className="font-semibold text-white mb-2">Never Expire</h3>
              <p className="text-sm text-gray-400">
                Your credits never expire. Buy once and use them whenever you need, no time pressure.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Tiers */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Choose Your Package</h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pricingTiers.map((tier) => {
            const pricePerQuery = calculatePricePerQuery(tier.basePrice, tier.queries, tier.discount)
            const finalPrice = (tier.basePrice * (1 - tier.discount / 100)).toFixed(2)
            const savings = calculateSavings(tier.basePrice, tier.discount)

            return (
              <Card
                key={tier.queries}
                className={`relative overflow-hidden transition-all hover:scale-105 ${
                  tier.popular
                    ? 'bg-gradient-to-br from-[#0069FF]/20 to-purple-600/20 border-[#0069FF]'
                    : 'bg-white/5 border-white/10'
                } backdrop-blur`}
              >
                {tier.popular && (
                  <div className="absolute top-0 right-0 bg-[#0069FF] text-white text-xs px-3 py-1 rounded-bl-lg font-semibold">
                    MOST POPULAR
                  </div>
                )}
                {tier.discount > 0 && (
                  <div className="absolute top-0 left-0 bg-green-500 text-white text-xs px-3 py-1 rounded-br-lg font-semibold">
                    SAVE {tier.discount}%
                  </div>
                )}

                <CardHeader className="pb-4 pt-8">
                  <div className="space-y-2">
                    <CardTitle className="text-3xl font-bold text-white">
                      {tier.queries.toLocaleString()}
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      query credits
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Pricing */}
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-white">${finalPrice}</span>
                      {tier.discount > 0 && (
                        <span className="text-lg text-gray-400 line-through">${tier.basePrice}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">
                      ${pricePerQuery} per query
                    </p>
                    {tier.discount > 0 && (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        Save ${savings}
                      </Badge>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    {tier.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <Button
                    className={`w-full ${
                      tier.popular
                        ? 'bg-[#0069FF] hover:bg-[#0069FF]/90'
                        : 'bg-white/10 hover:bg-white/20'
                    } text-white`}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Buy {tier.queries.toLocaleString()} Credits
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Custom Quote */}
      <Card className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/30 backdrop-blur">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-2">Need More Than 50,000 Queries?</h3>
              <p className="text-gray-300">
                Contact our sales team for custom enterprise pricing with even bigger discounts.
                We'll create a tailored package for your specific needs.
              </p>
            </div>
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
              Contact Sales
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Comparison Table */}
      <Card className="bg-white/5 border-white/10 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">Pricing Comparison</CardTitle>
          <CardDescription className="text-gray-400">
            See how much you save with bulk purchases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Queries</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Base Price</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Discount</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Final Price</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Per Query</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">You Save</th>
                </tr>
              </thead>
              <tbody>
                {pricingTiers.map((tier) => {
                  const finalPrice = (tier.basePrice * (1 - tier.discount / 100)).toFixed(2)
                  const pricePerQuery = calculatePricePerQuery(tier.basePrice, tier.queries, tier.discount)
                  const savings = calculateSavings(tier.basePrice, tier.discount)

                  return (
                    <tr key={tier.queries} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4 text-white font-semibold">
                        {tier.queries.toLocaleString()}
                      </td>
                      <td className="text-right py-3 px-4 text-gray-400">
                        ${tier.basePrice.toFixed(2)}
                      </td>
                      <td className="text-right py-3 px-4">
                        <Badge className={tier.discount > 0 ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
                          {tier.discount}%
                        </Badge>
                      </td>
                      <td className="text-right py-3 px-4 text-white font-bold">
                        ${finalPrice}
                      </td>
                      <td className="text-right py-3 px-4 text-gray-300">
                        ${pricePerQuery}
                      </td>
                      <td className="text-right py-3 px-4 text-green-400 font-semibold">
                        ${savings}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card className="bg-white/5 border-white/10 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-white mb-2">How does the discount work?</h4>
            <p className="text-sm text-gray-400">
              The discount is automatically applied based on the quantity you purchase. The more you buy, the lower the price per query. Discounts range from 10% to 50%.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">Do credits expire?</h4>
            <p className="text-sm text-gray-400">
              No! All purchased credits never expire. You can use them at your own pace without any time pressure.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">Can I buy more later?</h4>
            <p className="text-sm text-gray-400">
              Absolutely! You can purchase additional credits at any time. Your new credits will be added to your existing balance.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">What payment methods do you accept?</h4>
            <p className="text-sm text-gray-400">
              We accept all major credit cards (Visa, Mastercard, Amex), PayPal, and bank transfers for enterprise purchases.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
