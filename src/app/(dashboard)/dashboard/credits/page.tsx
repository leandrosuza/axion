import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Wallet, Plus, TrendingUp, Clock, ArrowUp, ArrowDown } from 'lucide-react'
import Link from 'next/link'

export default async function CreditsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch user profile with balance and plan
  const userProfile = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      credits_balance: true,
      credits_used: true,
      plan_type: true,
      full_name: true,
    },
  })

  const balance = userProfile?.credits_balance || 0
  const used = userProfile?.credits_used || 0
  const planType = userProfile?.plan_type || 'free'

  // Calculate stats
  const totalCredits = balance + used
  const usagePercentage = totalCredits > 0 ? (used / totalCredits) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <Wallet className="h-8 w-8" />
          Credits & Balance
        </h1>
        <p className="text-gray-400">Manage your API query credits</p>
      </div>

      {/* Plan Badge */}
      <Card className="bg-white/5 border-white/10 backdrop-blur">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Current Plan</p>
              <Badge className={`mt-2 ${
                planType === 'free' ? 'bg-gray-500' :
                planType === 'credits' ? 'bg-green-500' :
                'bg-[#0069FF]'
              }`}>
                {planType.toUpperCase()}
              </Badge>
            </div>
            <Link href="/dashboard/billing">
              <Button variant="outline" className="border-white/10 text-white hover:bg-white/10">
                Change Plan
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Balance Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white/5 border-white/10 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Available Balance</CardTitle>
            <Wallet className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{balance.toLocaleString()}</div>
            <p className="text-xs text-gray-400 mt-1">credits available</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Credits Used</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{used.toLocaleString()}</div>
            <p className="text-xs text-gray-400 mt-1">queries made</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Usage Rate</CardTitle>
            <Clock className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{usagePercentage.toFixed(1)}%</div>
            <p className="text-xs text-gray-400 mt-1">of total credits</p>
          </CardContent>
        </Card>
      </div>

      {/* Purchase Credits */}
      <Card className="bg-white/5 border-white/10 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">Purchase Credits</CardTitle>
          <CardDescription className="text-gray-400">
            Buy credits for pay-per-query API access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { amount: 100, price: 10, bonus: 0 },
              { amount: 500, price: 45, bonus: 50 },
              { amount: 1000, price: 80, bonus: 200 },
              { amount: 5000, price: 350, bonus: 1500 },
            ].map((pack) => (
              <Card key={pack.amount} className="bg-white/5 border-white/10 relative overflow-hidden">
                {pack.bonus > 0 && (
                  <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-2 py-1 rounded-bl">
                    +{pack.bonus} bonus
                  </div>
                )}
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <p className="text-2xl font-bold text-white">{(pack.amount + pack.bonus).toLocaleString()}</p>
                    <p className="text-xs text-gray-400">credits</p>
                    <p className="text-xl font-semibold text-[#0069FF]">${pack.price}</p>
                    <Button className="w-full mt-4 bg-[#0069FF] hover:bg-[#0069FF]/90 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Buy Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* How Credits Work */}
      <Card className="bg-white/5 border-white/10 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">How Credits Work</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-[#0069FF]/20 mt-1">
                <ArrowDown className="h-4 w-4 text-[#0069FF]" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Pay Per Query</h4>
                <p className="text-sm text-gray-400">
                  Each API query deducts credits from your balance. Different APIs have different costs (1-10 credits per query).
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-green-500/20 mt-1">
                <ArrowUp className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <h4 className="font-semibold text-white">No Expiration</h4>
                <p className="text-sm text-gray-400">
                  Your credits never expire. Buy once and use them whenever you need.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/20 mt-1">
                <Plus className="h-4 w-4 text-yellow-500" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Bonus Credits</h4>
                <p className="text-sm text-gray-400">
                  Larger purchases include bonus credits. The more you buy, the more you save!
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
