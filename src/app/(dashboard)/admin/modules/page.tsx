'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/components/ui/use-toast'
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

interface ApiModule {
  id: string
  name: string
  slug: string
  description: string | null
  example_response: any
  category: string
  endpoint: string
  method: string
  status: string
  is_visible: boolean
  is_premium: boolean
  price_per_query: number
  rate_limit_minute: number
  rate_limit_day: number
  total_queries: number
  created_at: string
  _count: {
    contractor_modules: number
    module_usage_logs: number
  }
}

const CATEGORIES = [
  'Dados Pessoais',
  'Dados Empresariais',
  'Dados Veiculares',
  'Dados Financeiros',
  'Dados de Endereço',
  'Dados Telefônicos',
  'Dados de Email',
  'Dados Sociais',
  'Dados de Crédito',
  'Dados Jurídicos',
  'Outros'
]

const STATUS_OPTIONS = [
  { value: 'active', label: 'Ativo', color: 'text-green-400' },
  { value: 'inactive', label: 'Inativo', color: 'text-gray-400' },
  { value: 'maintenance', label: 'Manutenção', color: 'text-yellow-400' }
]

export default function AdminModulesPage() {
  const [modules, setModules] = useState<ApiModule[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedModule, setSelectedModule] = useState<ApiModule | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    example_response: '',
    category: '',
    endpoint: '',
    method: 'GET',
    status: 'active',
    is_visible: true,
    is_premium: false,
    price_per_query: 1,
    rate_limit_minute: 60,
    rate_limit_day: 1000
  })
  const [saving, setSaving] = useState(false)

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchModules()
  }, [filterCategory, filterStatus])

  const fetchModules = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filterCategory !== 'all') params.set('category', filterCategory)
      if (filterStatus !== 'all') params.set('status', filterStatus)

      const res = await fetch(`/api/admin/modules?${params}`)
      if (!res.ok) {
        if (res.status === 403) {
          router.push('/dashboard')
          return
        }
        throw new Error('Failed to fetch modules')
      }
      const data = await res.json()
      setModules(data)
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      setSaving(true)
      const res = await fetch('/api/admin/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create module')
      }

      toast({
        title: 'Sucesso',
        description: 'Módulo criado com sucesso'
      })
      setIsCreateDialogOpen(false)
      resetForm()
      fetchModules()
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async () => {
    if (!selectedModule) return

    try {
      setSaving(true)
      const res = await fetch(`/api/admin/modules/${selectedModule.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update module')
      }

      toast({
        title: 'Sucesso',
        description: 'Módulo atualizado com sucesso'
      })
      setIsEditDialogOpen(false)
      setSelectedModule(null)
      resetForm()
      fetchModules()
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (module: ApiModule) => {
    if (!confirm(`Tem certeza de que deseja excluir "${module.name}"?`)) return

    try {
      const res = await fetch(`/api/admin/modules/${module.id}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to delete module')
      }

      toast({
        title: 'Sucesso',
        description: 'Módulo excluído com sucesso'
      })
      fetchModules()
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const handleStatusChange = async (module: ApiModule, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/modules/${module.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update status')
      }

      toast({
        title: 'Sucesso',
        description: `Status do módulo alterado para ${newStatus === 'active' ? 'ativo' : newStatus === 'inactive' ? 'inativo' : 'manutenção'}`
      })
      fetchModules()
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const handleVisibilityToggle = async (module: ApiModule) => {
    try {
      const res = await fetch(`/api/admin/modules/${module.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_visible: !module.is_visible })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update visibility')
      }

      toast({
        title: 'Sucesso',
        description: `Módulo agora está ${!module.is_visible ? 'visível' : 'oculto'}`
      })
      fetchModules()
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      example_response: '',
      category: '',
      endpoint: '',
      method: 'GET',
      status: 'active',
      is_visible: true,
      is_premium: false,
      price_per_query: 1,
      rate_limit_minute: 60,
      rate_limit_day: 1000
    })
  }

  const openEditDialog = (module: ApiModule) => {
    setSelectedModule(module)
    setFormData({
      name: module.name,
      slug: module.slug,
      description: module.description || '',
      example_response: typeof module.example_response === 'string'
        ? module.example_response
        : JSON.stringify(module.example_response, null, 2) || '',
      category: module.category,
      endpoint: module.endpoint,
      method: module.method,
      status: module.status,
      is_visible: module.is_visible,
      is_premium: module.is_premium,
      price_per_query: module.price_per_query,
      rate_limit_minute: module.rate_limit_minute,
      rate_limit_day: module.rate_limit_day
    })
    setIsEditDialogOpen(true)
  }

  const filteredModules = modules.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case 'maintenance':
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />
      default:
        return <XCircle className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin" className="text-gray-400 hover:text-white flex items-center gap-1 mb-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar para Admin
          </Link>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Package className="h-8 w-8" />
            Gerenciamento de Módulos API
          </h1>
          <p className="text-gray-400">Criar e gerenciar módulos de consulta da API</p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-[#0069FF] hover:bg-[#0055DD]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Módulo
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-white/5 border-white/10 backdrop-blur">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search Bar - Full Width */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                variant="dark"
                placeholder="Pesquisar módulos por nome, slug, descrição ou endpoint..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[200px] bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  {STATUS_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modules Table */}
      <Card className="bg-white/5 border-white/10 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">Módulos ({filteredModules.length})</CardTitle>
          <CardDescription className="text-gray-400">
            Gerencie seus módulos API como vídeos no YouTube
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-400">Carregando módulos...</div>
          ) : filteredModules.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              Nenhum módulo encontrado. Crie seu primeiro módulo para começar.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead className="text-gray-400">Nome</TableHead>
                    <TableHead className="text-gray-400">Categoria</TableHead>
                    <TableHead className="text-gray-400">Endpoint</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400">Visível</TableHead>
                    <TableHead className="text-gray-400">Preço</TableHead>
                    <TableHead className="text-gray-400 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredModules.map((module) => (
                    <TableRow key={module.id} className="border-white/10">
                      <TableCell>
                        <div>
                          <div className="font-medium text-white">{module.name}</div>
                          <div className="text-xs text-gray-400">{module.slug}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300">{module.category}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-white/10 px-2 py-1 rounded text-gray-300">
                          {module.method} {module.endpoint}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={module.status}
                          onValueChange={(value) => handleStatusChange(module, value)}
                        >
                          <SelectTrigger className="w-[130px] h-8 bg-transparent border-white/10 text-white">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(module.status)}
                              <SelectValue />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map(opt => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVisibilityToggle(module)}
                          className={module.is_visible ? 'text-green-400' : 'text-gray-400'}
                        >
                          {module.is_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </Button>
                      </TableCell>
                      <TableCell className="text-gray-300">{module.price_per_query} créditos</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(module)}
                            className="text-gray-400 hover:text-white"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(module)}
                            className="text-gray-400 hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false)
          setIsEditDialogOpen(false)
          setSelectedModule(null)
          resetForm()
        }
      }}>
        <DialogContent className="bg-[#1A1D3B] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditDialogOpen ? 'Editar Módulo' : 'Criar Novo Módulo'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {isEditDialogOpen ? 'Atualizar as configurações do módulo' : 'Adicionar um novo módulo API ao sistema'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  variant="dark"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Consulta CPF"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  variant="dark"
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s/g, '-') })}
                  placeholder="cpf"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Consultar dados de CPF da Receita Federal Brasileira..."
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="example_response">Exemplo de Resposta da API (JSON)</Label>
              <Textarea
                id="example_response"
                value={formData.example_response}
                onChange={(e) => setFormData({ ...formData, example_response: e.target.value })}
                placeholder='{"status": "sucesso", "data": {"nome": "João Silva", "cpf": "123.456.789-00"}}'
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 font-mono text-sm"
                rows={6}
              />
              <p className="text-xs text-gray-400">Cole um exemplo de resposta JSON para que os clientes possam ver a estrutura da resposta da API</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoria *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="method">Método HTTP</Label>
                <Select
                  value={formData.method}
                  onValueChange={(value) => setFormData({ ...formData, method: value })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endpoint">API Endpoint *</Label>
              <Input
                variant="dark"
                id="endpoint"
                value={formData.endpoint}
                onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                placeholder="/api/v1/cpf"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Preço (créditos)</Label>
                <Input
                  variant="dark"
                  id="price"
                  type="number"
                  min="0"
                  value={formData.price_per_query}
                  onChange={(e) => setFormData({ ...formData, price_per_query: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Opções</Label>
                <div className="flex gap-4 pt-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={formData.is_visible}
                      onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
                      className="rounded"
                    />
                    Visível
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={formData.is_premium}
                      onChange={(e) => setFormData({ ...formData, is_premium: e.target.checked })}
                      className="rounded"
                    />
                    Premium
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rate_minute">Limite de Taxa (por minuto)</Label>
                <Input
                  variant="dark"
                  id="rate_minute"
                  type="number"
                  min="1"
                  value={formData.rate_limit_minute}
                  onChange={(e) => setFormData({ ...formData, rate_limit_minute: parseInt(e.target.value) || 60 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rate_day">Limite de Taxa (por dia)</Label>
                <Input
                  variant="dark"
                  id="rate_day"
                  type="number"
                  min="1"
                  value={formData.rate_limit_day}
                  onChange={(e) => setFormData({ ...formData, rate_limit_day: parseInt(e.target.value) || 1000 })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false)
                setIsEditDialogOpen(false)
                setSelectedModule(null)
                resetForm()
              }}
              className="border-white/10 text-white hover:bg-white/10"
            >
              Cancelar
            </Button>
            <Button
              onClick={isEditDialogOpen ? handleUpdate : handleCreate}
              disabled={saving || !formData.name || !formData.slug || !formData.category || !formData.endpoint}
              className="bg-[#0069FF] hover:bg-[#0055DD]"
            >
              {saving ? 'Salvando...' : isEditDialogOpen ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
