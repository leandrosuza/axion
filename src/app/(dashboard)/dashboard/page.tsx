import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Key, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { getPlanLimits } from '@/lib/constants/pricing'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Note: Dashboard uses mock data until database schema is updated
  const subscription = {
    plan_type: 'free',
    status: 'active'
  }

  const planType = 'free'
  const planLimits = getPlanLimits(planType)

  // Mock usage stats (will be real when database schema is updated)
  const usageStats = {
    minute: 0,
    day: 0,
    month: 0,
  }

  const keysCount = 0
  const successRate = 100

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Visão Geral</h1>
          <p className="text-gray-400">Bem-vindo de volta! Aqui está o resumo do uso da sua API.</p>
        </div>
        <Link href="/dashboard/keys">
          <Button className="bg-[#0069FF] hover:bg-[#0069FF]/90 text-white">
            <Key className="mr-2 h-4 w-4" />
            Criar Chave API
          </Button>
        </Link>
      </div>

      {/* Notice about database schema */}
      <Card className="bg-amber-500/10 border-amber-500/20 backdrop-blur">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-500">Dashboard Usando Dados Simulados</h3>
              <p className="text-sm text-amber-200 mt-1">
                O esquema do banco de dados precisa ser atualizado para habilitar as chaves API e recursos de rastreamento de uso.
                As estatísticas de uso serão exibidas aqui assim que o esquema for configurado.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white/5 border-white/10 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Plano Atual</CardTitle>
            <Badge variant="secondary">
              {subscription.plan_type.toUpperCase()}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">Grátis</div>
            <p className="text-xs text-gray-400">
              <Link href="/dashboard/billing" className="text-[#0069FF] hover:underline">
                Atualizar plano →
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Chaves API</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{keysCount}</div>
            <p className="text-xs text-gray-400">
              {keysCount} de {planLimits.maxApiKeys} chaves usadas
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Requisições de Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {usageStats.day.toLocaleString()}
            </div>
            <p className="text-xs text-gray-400">
              {planLimits.dailyRequests === -1 ? 'Ilimitado' : `de ${planLimits.dailyRequests.toLocaleString()} limite diário`}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Taxa de Sucesso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{successRate}%</div>
            <p className="text-xs text-gray-400">Últimas 24 horas</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-white/5 border-white/10 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">Ações Rápidas</CardTitle>
            <CardDescription className="text-gray-400">Tarefas comuns</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/dashboard/keys">
              <Button variant="outline" className="w-full justify-start">
                <Key className="mr-2 h-4 w-4" />
                Gerenciar Chaves API
              </Button>
            </Link>
            <Link href="/dashboard/usage">
              <Button variant="outline" className="w-full justify-start">
                Ver Estatísticas de Uso
              </Button>
            </Link>
            <Link href="/docs">
              <Button variant="outline" className="w-full justify-start">
                Ler Documentação
              </Button>
            </Link>
            <Link href="/dashboard/billing">
              <Button variant="outline" className="w-full justify-start">
                Atualizar Plano
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">Primeiros Passos</CardTitle>
            <CardDescription className="text-gray-400">Comece a usar a API</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-[#0069FF] flex items-center justify-center text-white text-xs">
                  1
                </div>
                <span className="text-sm text-gray-300">Criar uma chave API</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-[#0069FF] flex items-center justify-center text-white text-xs">
                  2
                </div>
                <span className="text-sm text-gray-300">Ler a documentação</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-[#0069FF] flex items-center justify-center text-white text-xs">
                  3
                </div>
                <span className="text-sm text-gray-300">Fazer sua primeira chamada API</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
