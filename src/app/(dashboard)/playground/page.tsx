import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ApiPlayground } from '@/components/playground/api-playground'
import { AlertCircle } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { decryptApiKey } from '@/lib/utils/encryption'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function PlaygroundPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Check user's plan
  const userProfile = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      plan_type: true,
      credits_balance: true,
    },
  })

  const isFreePlan = userProfile?.plan_type === 'free'

  // Fetch user's API keys
  const keys = await prisma.api_keys.findMany({
    where: {
      user_id: user.id,
      is_active: true
    },
    orderBy: { created_at: 'desc' },
    select: {
      id: true,
      name: true,
      key_preview: true,
      key_encrypted: true,
      permissions: true,
      is_active: true,
      created_at: true,
    },
  })

  // Decrypt keys for playground use
  const apiKeys = keys.map(key => {
    let fullKey = null
    if (key.key_encrypted) {
      try {
        fullKey = decryptApiKey(key.key_encrypted)
      } catch (error) {
        console.error('Failed to decrypt key:', key.id)
      }
    }
    return {
      id: key.id,
      name: key.name,
      key_preview: key.key_preview,
      full_key: fullKey || '', // Use decrypted full key
    }
  }).filter(k => k.full_key) // Only include keys that were successfully decrypted

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">API Playground</h1>
        <p className="text-gray-400">Test BigDataCorp APIs in real-time</p>
      </div>

      {/* FREE Plan Restriction */}
      {isFreePlan && (
        <Card className="bg-yellow-500/10 border-yellow-500/30 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              FREE Plan - Browse Only
            </CardTitle>
            <CardDescription className="text-gray-300">
              You're on the FREE plan. You can browse the API marketplace and see documentation, but cannot make actual API calls.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-gray-300">
                <strong>To make API calls, you have two options:</strong>
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                <li><strong>Subscribe to a plan</strong> - Get scheduled queries (Basic, Pro, Enterprise)</li>
                <li><strong>Buy credits</strong> - Pay per query as you go</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <Link href="/dashboard/billing">
                <Button className="bg-[#0069FF] hover:bg-[#0069FF]/90 text-white">
                  View Plans
                </Button>
              </Link>
              <Link href="/dashboard/marketplace">
                <Button variant="outline" className="border-white/10 text-white hover:bg-white/10">
                  Browse APIs
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {apiKeys.length === 0 && !isFreePlan && (
        <Card className="bg-white/5 border-white/10 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              API Keys Required
            </CardTitle>
            <CardDescription className="text-gray-400">
              Please create an API key first to use the playground
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-300">
              Go to the API Keys page to create a new key, then return here to test your APIs.
            </p>
            <Link href="/dashboard/keys">
              <Button className="bg-[#0069FF] hover:bg-[#0069FF]/90 text-white">
                Go to API Keys
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {apiKeys.length > 0 && !isFreePlan && (
        <ApiPlayground apiKeys={apiKeys} />
      )}
    </div>
  )
}
