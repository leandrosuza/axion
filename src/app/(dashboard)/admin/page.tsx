import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Users, Package, Activity, Settings, ArrowRight } from 'lucide-react'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is admin using Prisma
  const userProfile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true, full_name: true },
  })

  if (userProfile?.role !== 'admin') {
    redirect('/dashboard')
  }

  // Fetch statistics
  const [
    totalUsers,
    activeUsers,
    totalModules,
    activeModules,
    maintenanceModules
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: 'active' } }),
    prisma.api_modules.count(),
    prisma.api_modules.count({ where: { status: 'active' } }),
    prisma.api_modules.count({ where: { status: 'maintenance' } })
  ])

  // Get module categories
  const modulesByCategory = await prisma.api_modules.groupBy({
    by: ['category'],
    _count: { id: true }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <Shield className="h-8 w-8" />
          Painel Administrativo
        </h1>
        <p className="text-gray-400">Bem-vindo de volta, {userProfile.full_name}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white/5 border-white/10 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalUsers}</div>
            <p className="text-xs text-gray-400">{activeUsers} ativos</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Módulos API</CardTitle>
            <Package className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalModules}</div>
            <p className="text-xs text-gray-400">{activeModules} ativos, {maintenanceModules} manutenção</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Categorias</CardTitle>
            <Activity className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{modulesByCategory.length}</div>
            <p className="text-xs text-gray-400">Categorias de módulos</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Status do Sistema</CardTitle>
            <Settings className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">Online</div>
            <p className="text-xs text-gray-400">Todos os sistemas operacionais</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/admin/modules">
          <Card className="bg-white/5 border-white/10 backdrop-blur hover:bg-white/10 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Gerenciamento de Módulos API
                </span>
                <ArrowRight className="h-5 w-5" />
              </CardTitle>
              <CardDescription className="text-gray-400">
                Criar, editar, ativar/desativar módulos da API. Colocar módulos em modo de manutenção.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 text-sm">
                <span className="text-green-400">{activeModules} Ativos</span>
                <span className="text-yellow-400">{maintenanceModules} Manutenção</span>
                <span className="text-gray-400">{totalModules - activeModules - maintenanceModules} Inativos</span>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/users">
          <Card className="bg-white/5 border-white/10 backdrop-blur hover:bg-white/10 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Gerenciamento de Usuários
                </span>
                <ArrowRight className="h-5 w-5" />
              </CardTitle>
              <CardDescription className="text-gray-400">
                Visualizar e gerenciar usuários, atribuir funções e permissões.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 text-sm">
                <span className="text-green-400">{activeUsers} Ativos</span>
                <span className="text-gray-400">{totalUsers - activeUsers} Inativos</span>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Modules by Category */}
      {modulesByCategory.length > 0 && (
        <Card className="bg-white/5 border-white/10 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">Módulos por Categoria</CardTitle>
            <CardDescription className="text-gray-400">
              Distribuição de módulos da API por categorias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-4">
              {modulesByCategory.map((cat) => (
                <div key={cat.category} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <span className="text-white">{cat.category}</span>
                  <span className="text-gray-400">{cat._count.id}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
