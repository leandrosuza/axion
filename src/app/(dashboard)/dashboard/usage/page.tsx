import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Clock, 
  Download,
  Calendar,
  Filter
} from 'lucide-react'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'

export default async function UsagePage() {
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

  // Fetch rate limits
  const { data: rateLimits } = await supabase
    .from('rate_limits')
    .select('*')
    .eq('plan_type', subscription?.plan_type || 'free')
    .single()

  // Get date ranges
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Fetch usage statistics
  const { count: todayCount } = await supabase
    .from('api_usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', today.toISOString())

  const { count: monthCount } = await supabase
    .from('api_usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', startOfMonth.toISOString())

  const { count: last7DaysCount } = await supabase
    .from('api_usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', last7Days.toISOString())

  // Fetch recent logs
  const { data: recentLogs } = await supabase
    .from('api_usage_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  // Calculate statistics
  const successfulRequests = recentLogs?.filter(log => log.status_code >= 200 && log.status_code < 300).length || 0
  const failedRequests = recentLogs?.filter(log => log.status_code >= 400).length || 0
  const avgResponseTime = recentLogs?.length 
    ? Math.round(recentLogs.reduce((sum, log) => sum + log.response_time, 0) / recentLogs.length)
    : 0

  // Group by endpoint
  const endpointStats = recentLogs?.reduce((acc, log) => {
    const endpoint = log.endpoint
    if (!acc[endpoint]) {
      acc[endpoint] = { count: 0, success: 0, failed: 0, totalTime: 0 }
    }
    acc[endpoint].count++
    if (log.status_code >= 200 && log.status_code < 300) {
      acc[endpoint].success++
    } else if (log.status_code >= 400) {
      acc[endpoint].failed++
    }
    acc[endpoint].totalTime += log.response_time
    return acc
  }, {} as Record<string, { count: number; success: number; failed: number; totalTime: number }>)

  const endpointStatsArray = Object.entries(endpointStats || {}).map(([endpoint, stats]) => {
    const s = stats as { count: number; success: number; failed: number; totalTime: number }
    return {
      endpoint,
      count: s.count,
      success: s.success,
      failed: s.failed,
      avgResponseTime: Math.round(s.totalTime / s.count),
      successRate: Math.round((s.success / s.count) * 100)
    }
  }).sort((a, b) => b.count - a.count)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Uso e Análises</h1>
          <p className="text-gray-400">Monitore seu uso de API e métricas de desempenho</p>
        </div>
        <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
          <Download className="mr-2 h-4 w-4" />
          Exportar Dados
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white/5 border-white/10 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Requisições de Hoje</CardTitle>
            <Activity className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{todayCount?.toLocaleString() || 0}</div>
            <p className="text-xs text-gray-400">
              {rateLimits?.requests_per_day.toLocaleString()} limite diário
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Este Mês</CardTitle>
            <Calendar className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{monthCount?.toLocaleString() || 0}</div>
            <p className="text-xs text-gray-400">
              {rateLimits?.requests_per_month.toLocaleString()} limite mensal
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Taxa de Sucesso</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {recentLogs?.length ? Math.round((successfulRequests / recentLogs.length) * 100) : 0}%
            </div>
            <p className="text-xs text-gray-400">
              {successfulRequests} bem-sucedidas / {recentLogs?.length || 0} total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Tempo Médio de Resposta</CardTitle>
            <Clock className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{avgResponseTime}ms</div>
            <p className="text-xs text-gray-400">
              Últimas 50 requisições
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Endpoint Statistics */}
      <Card className="bg-white/5 border-white/10 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">Estatísticas de Endpoint</CardTitle>
          <CardDescription className="text-gray-400">Métricas de desempenho por endpoint da API</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-white">Endpoint</TableHead>
                <TableHead className="text-right text-white">Requisições</TableHead>
                <TableHead className="text-right text-white">Taxa de Sucesso</TableHead>
                <TableHead className="text-right text-white">Resposta Média</TableHead>
                <TableHead className="text-right text-white">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {endpointStatsArray.length > 0 ? (
                endpointStatsArray.map((stat) => (
                  <TableRow key={stat.endpoint}>
                    <TableCell className="font-medium text-gray-300">{stat.endpoint}</TableCell>
                    <TableCell className="text-right text-gray-300">{stat.count.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={stat.successRate >= 95 ? 'default' : stat.successRate >= 80 ? 'secondary' : 'destructive'}>
                        {stat.successRate}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-gray-300">{stat.avgResponseTime}ms</TableCell>
                    <TableCell className="text-right">
                      <div className="text-xs text-gray-400">
                        {stat.success} / {stat.failed}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-400">
                    Nenhuma requisição de API ainda. Crie uma chave API e comece a fazer requisições!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Request Logs */}
      <Card className="bg-white/5 border-white/10 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">Requisições Recentes</CardTitle>
          <CardDescription className="text-gray-400">Últimas 50 requisições de API</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="success">Sucesso</TabsTrigger>
              <TabsTrigger value="failed">Falhou</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="space-y-4">
              <div className="rounded-md border border-white/10">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-white">Data/Hora</TableHead>
                      <TableHead className="text-white">Endpoint</TableHead>
                      <TableHead className="text-white">Método</TableHead>
                      <TableHead className="text-right text-white">Status</TableHead>
                      <TableHead className="text-right text-white">Tempo de Resposta</TableHead>
                      <TableHead className="text-white">Endereço IP</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentLogs && recentLogs.length > 0 ? (
                      recentLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-xs text-gray-300">
                            {format(new Date(log.created_at), 'MMM dd, HH:mm:ss')}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-gray-300">{log.endpoint}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.method}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge
                              variant={
                                log.status_code >= 200 && log.status_code < 300
                                  ? 'default'
                                  : log.status_code >= 400
                                  ? 'destructive'
                                  : 'secondary'
                              }
                            >
                              {log.status_code}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right text-xs text-gray-300">{log.response_time}ms</TableCell>
                          <TableCell className="text-xs text-gray-400">
                            {log.ip_address || 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                          Nenhuma requisição ainda. Comece a usar suas chaves API para ver logs aqui.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            <TabsContent value="success">
              <div className="rounded-md border border-white/10">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-white">Data/Hora</TableHead>
                      <TableHead className="text-white">Endpoint</TableHead>
                      <TableHead className="text-white">Método</TableHead>
                      <TableHead className="text-right text-white">Status</TableHead>
                      <TableHead className="text-right text-white">Tempo de Resposta</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentLogs?.filter(log => log.status_code >= 200 && log.status_code < 300).map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-xs text-gray-300">
                          {format(new Date(log.created_at), 'MMM dd, HH:mm:ss')}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-gray-300">{log.endpoint}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.method}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="default">{log.status_code}</Badge>
                        </TableCell>
                        <TableCell className="text-right text-xs text-gray-300">{log.response_time}ms</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            <TabsContent value="failed">
              <div className="rounded-md border border-white/10">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-white">Data/Hora</TableHead>
                      <TableHead className="text-white">Endpoint</TableHead>
                      <TableHead className="text-white">Método</TableHead>
                      <TableHead className="text-right text-white">Status</TableHead>
                      <TableHead className="text-right text-white">Tempo de Resposta</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentLogs?.filter(log => log.status_code >= 400).map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-xs text-gray-300">
                          {format(new Date(log.created_at), 'MMM dd, HH:mm:ss')}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-gray-300">{log.endpoint}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.method}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="destructive">{log.status_code}</Badge>
                        </TableCell>
                        <TableCell className="text-right text-xs text-gray-300">{log.response_time}ms</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}


