import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ApiKeysTable } from '@/components/dashboard/api-keys-table'
import { CreateKeyDialog } from '@/components/dashboard/create-key-dialog'
import { decryptApiKey } from '@/lib/utils/encryption'
import { getPlanLimits } from '@/lib/constants/pricing'
import { canCreateApiKey } from '@/lib/utils/rate-limiter'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle, Lock } from 'lucide-react'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export default async function ApiKeysPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch user's subscription to check plan limits
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const planType = (subscription?.plan_type as 'free' | 'basic' | 'pro' | 'enterprise') || 'free'
  const planLimits = getPlanLimits(planType)
  const canCreate = await canCreateApiKey(user.id, planType)

  // Fetch user's API keys using Prisma
  const keys = await prisma.api_keys.findMany({
    where: { user_id: user.id },
    orderBy: { created_at: 'desc' },
  })

  // Decrypt keys for display
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
      key_preview: key.key_preview || '',
      key_hash: key.key_hash || '',
      full_key: fullKey,
      permissions: key.permissions as 'read' | 'full',
      is_active: key.is_active,
      last_used_at: key.last_used_at ? key.last_used_at.toISOString() : null,
      created_at: key.created_at.toISOString(),
    }
  })

  const activeKeysCount = keys.filter(k => k.is_active).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Chaves API</h1>
          <p className="text-gray-400">Gerencie suas chaves API para acessar os serviços da BigDataCorp</p>
        </div>
        <CreateKeyDialog>
          <Button disabled={!canCreate} className="bg-[#0069FF] hover:bg-[#0069FF]/90 text-white">
            Criar Nova Chave
          </Button>
        </CreateKeyDialog>
      </div>

      {/* API Key Limit Info */}
      <Card className="border-[#0069FF]/30 bg-[#0069FF]/10 backdrop-blur">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#0069FF]/20 flex items-center justify-center">
                <Lock className="h-5 w-5 text-[#0069FF]" />
              </div>
              <div>
                <p className="font-semibold text-white">Uso de Chaves API</p>
                <p className="text-sm text-gray-300">
                  {activeKeysCount} de {planLimits.maxApiKeys === -1 ? 'Ilimitado' : planLimits.maxApiKeys} chaves usadas
                </p>
              </div>
            </div>
            {!canCreate && planLimits.maxApiKeys !== -1 && (
              <Link href="/dashboard/billing">
                <Button size="sm" variant="outline" className="border-[#0069FF] text-[#0069FF] hover:bg-[#0069FF] hover:text-white">
                  Atualizar Plano
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Warning Alert if limit reached */}
      {!canCreate && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Limite de Chaves API Atingido</AlertTitle>
          <AlertDescription>
            <p className="mb-3">
              Você atingiu o número máximo de chaves API ({planLimits.maxApiKeys}) para o seu plano <strong>{planType}</strong>.
            </p>
            <p className="mb-3">
              Para criar mais chaves API, atualize seu plano ou exclua uma chave existente.
            </p>
            <Link href="/dashboard/billing">
              <Button size="sm" variant="default">
                Atualizar Plano
              </Button>
            </Link>
          </AlertDescription>
        </Alert>
      )}

      <Card className="bg-white/5 border-white/10 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">Suas Chaves API</CardTitle>
          <CardDescription className="text-gray-400">
            Mantenha suas chaves API seguras. Elas fornecem acesso total à sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {apiKeys && apiKeys.length > 0 ? (
            <ApiKeysTable keys={apiKeys} />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">Você ainda não criou nenhuma chave API.</p>
              <CreateKeyDialog>
                <Button className="bg-[#0069FF] hover:bg-[#0069FF]/90 text-white">
                  Criar Sua Primeira Chave
                </Button>
              </CreateKeyDialog>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white/5 border-white/10 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">Como Usar Chaves API</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2 text-white">1. Incluir no Cabeçalho de Autorização</h4>
            <pre className="bg-black/30 border border-white/10 p-3 rounded text-sm overflow-x-auto">
              <code className="text-gray-300">Authorization: Bearer SUA_CHAVE_API</code>
            </pre>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-white">2. Fazer Requisição à API</h4>
            <pre className="bg-black/30 border border-white/10 p-3 rounded text-sm overflow-x-auto">
              <code className="text-gray-300">{`curl -H "Authorization: Bearer SUA_CHAVE_API" \\
  ${process.env.NEXT_PUBLIC_APP_URL}/api/v1/data`}</code>
            </pre>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-white">Melhores Práticas</h4>
            <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
              <li>Nunca commit chaves API no controle de versão</li>
              <li>Armazene chaves com segurança em variáveis de ambiente</li>
              <li>Rotacione chaves periodicamente para maior segurança</li>
              <li>Use chaves diferentes para desenvolvimento e produção</li>
              <li>Revogue chaves imediatamente se comprometidas</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
