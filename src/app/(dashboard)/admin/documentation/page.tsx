'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  BookOpen,
  Star,
  Link as LinkIcon
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface ApiModule {
  id: string
  name: string
  slug: string
}

interface Documentation {
  id: string
  module_id: string | null
  title: string
  slug: string
  content: string
  description: string | null
  category: string
  order: number
  is_published: boolean
  is_featured: boolean
  tags: string[]
  views: number
  created_at: string
  updated_at: string
  api_modules: ApiModule | null
}

export default function AdminDocumentationPage() {
  const { toast } = useToast()
  const [documentation, setDocumentation] = useState<Documentation[]>([])
  const [modules, setModules] = useState<ApiModule[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategoria, setSelectedCategoria] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingDoc, setEditingDoc] = useState<Documentation | null>(null)
  const [formData, setFormData] = useState({
    module_id: '',
    title: '',
    slug: '',
    content: '',
    description: '',
    category: 'General',
    order: 0,
    is_published: true,
    is_featured: false,
    tags: ''
  })

  useEffect(() => {
    fetchDocumentation()
    fetchModules()
  }, [])

  const fetchDocumentation = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/documentation')
      if (!res.ok) throw new Error('Failed to fetch documentation')
      const data = await res.json()
      setDocumentation(data.documentation)
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

  const fetchModules = async () => {
    try {
      const res = await fetch('/api/modules')
      if (!res.ok) throw new Error('Failed to fetch modules')
      const data = await res.json()
      setModules(data.modules)
    } catch (error: any) {
      console.error('Error fetching modules:', error)
    }
  }

  const handleOpenDialog = (doc?: Documentation) => {
    if (doc) {
      setEditingDoc(doc)
      setFormData({
        module_id: doc.module_id || '',
        title: doc.title,
        slug: doc.slug,
        content: doc.content,
        description: doc.description || '',
        category: doc.category,
        order: doc.order,
        is_published: doc.is_published,
        is_featured: doc.is_featured,
        tags: doc.tags.join(', ')
      })
    } else {
      setEditingDoc(null)
      setFormData({
        module_id: '',
        title: '',
        slug: '',
        content: '',
        description: '',
        category: 'General',
        order: 0,
        is_published: true,
        is_featured: false,
        tags: ''
      })
    }
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    try {
      const url = editingDoc
        ? `/api/admin/documentation/${editingDoc.id}`
        : '/api/admin/documentation'

      const method = editingDoc ? 'PUT' : 'POST'

      const payload = {
        ...formData,
        module_id: formData.module_id || null,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to save documentation')
      }

      toast({
        title: 'Sucesso',
        description: `Documentação ${editingDoc ? 'atualizada' : 'criada'} com sucesso`
      })

      setDialogOpen(false)
      fetchDocumentation()
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza de que deseja excluir esta documentação?')) return

    try {
      const res = await fetch(`/api/admin/documentation/${id}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('Failed to delete documentation')

      toast({
        title: 'Sucesso',
        description: 'Documentação excluída com sucesso'
      })

      fetchDocumentation()
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const filteredDocs = documentation.filter(doc => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.slug.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategoria = selectedCategoria === 'all' || doc.category === selectedCategoria

    return matchesSearch && matchesCategoria
  })

  const categories = [...new Set(documentation.map(d => d.category))]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <BookOpen className="h-8 w-8" />
            Gerenciamento de Documentação
          </h1>
          <p className="text-gray-400">Criar e gerenciar documentação da API</p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-[#0069FF] hover:bg-[#0069FF]/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Documentação
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-white/5 border-white/10 backdrop-blur">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-[#0069FF]/20">
                <FileText className="h-6 w-6 text-[#0069FF]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{documentation.length}</p>
                <p className="text-sm text-gray-400">Total de Docs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10 backdrop-blur">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/20">
                <Eye className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {documentation.filter(d => d.is_published).length}
                </p>
                <p className="text-sm text-gray-400">Publicado</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10 backdrop-blur">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-yellow-500/20">
                <Star className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {documentation.filter(d => d.is_featured).length}
                </p>
                <p className="text-sm text-gray-400">Em Destaque</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10 backdrop-blur">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-500/20">
                <LinkIcon className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {documentation.filter(d => d.module_id).length}
                </p>
                <p className="text-sm text-gray-400">Vinculado a APIs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white/5 border-white/10 backdrop-blur">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar documentação..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white"
              />
            </div>
            <Select value={selectedCategoria} onValueChange={setSelectedCategoria}>
              <SelectTrigger className="w-[200px] bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Categorias</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documentation Table */}
      <Card className="bg-white/5 border-white/10 backdrop-blur">
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-gray-300">Título</TableHead>
                <TableHead className="text-gray-300">Categoria</TableHead>
                <TableHead className="text-gray-300">Módulo Vinculado</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-gray-300">Visualizações</TableHead>
                <TableHead className="text-gray-300 w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocs.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-white flex items-center gap-2">
                        {doc.title}
                        {doc.is_featured && (
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        )}
                      </p>
                      <p className="text-xs text-gray-400">{doc.slug}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{doc.category}</Badge>
                  </TableCell>
                  <TableCell>
                    {doc.api_modules ? (
                      <Badge variant="secondary" className="text-xs">
                        {doc.api_modules.name}
                      </Badge>
                    ) : (
                      <span className="text-gray-500 text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={doc.is_published ? 'default' : 'secondary'}>
                      {doc.is_published ? 'Publicado' : 'Rascunho'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-300">{doc.views}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-300 hover:text-white"
                        onClick={() => handleOpenDialog(doc)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-400 hover:text-red-300"
                        onClick={() => handleDelete(doc.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Criar/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#1A1D3B] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingDoc ? 'Editar Documentação' : 'Criar Documentação'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingDoc ? 'Atualizar detalhes da documentação' : 'Adicionar nova documentação'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      title: e.target.value,
                      slug: !editingDoc ? generateSlug(e.target.value) : formData.slug
                    })
                  }}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div>
                <Label htmlFor="category">Categoria</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="ex: Começando, Referência da API"
                />
              </div>

              <div>
                <Label htmlFor="order">Ordem</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="module">Vincular ao Módulo API (Opcional)</Label>
                <Select
                  value={formData.module_id || 'none'}
                  onValueChange={(value) => setFormData({ ...formData, module_id: value === 'none' ? '' : value })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Selecione um módulo..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {modules.map(mod => (
                      <SelectItem key={mod.id} value={mod.id}>
                        {mod.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2">
                <Label htmlFor="description">Descrição Curta</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  rows={2}
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="content">Conteúdo (Markdown) *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="bg-white/5 border-white/10 text-white font-mono text-sm"
                  rows={10}
                  placeholder="# Título da Documentação&#10;&#10;Escreva sua documentação em Markdown..."
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="authentication, api, guide"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="published"
                  checked={formData.is_published}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                />
                <Label htmlFor="published">Publicado</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                />
                <Label htmlFor="featured">Em Destaque</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} className="bg-[#0069FF] hover:bg-[#0069FF]/90">
              {editingDoc ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
