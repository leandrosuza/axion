'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import {
  Store,
  Search,
  Package,
  Zap,
  Star,
  AlertTriangle,
  Code,
  Copy,
  Check,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface ApiModule {
  id: string
  name: string
  slug: string
  description: string | null
  long_description: string | null
  category: string
  icon: string | null
  endpoint: string
  method: string
  status: string
  is_premium: boolean
  price_per_query: number
  rate_limit_minute: number
  rate_limit_day: number
  documentation_url: string | null
  example_request: any
  example_response: any
  required_fields: any
  response_fields: any
  tags: string[]
  total_queries: number
}

interface GroupedModules {
  [category: string]: ApiModule[]
}

export default function MarketplacePage() {
  const [modules, setModules] = useState<ApiModule[]>([])
  const [groupedModules, setGroupedModules] = useState<GroupedModules>({})
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedModule, setSelectedModule] = useState<ApiModule | null>(null)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchModules()
  }, [])

  const fetchModules = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/modules')
      if (!res.ok) throw new Error('Failed to fetch modules')
      const data = await res.json()
      setModules(data.modules)
      setGroupedModules(data.grouped)
      setCategories(data.categories)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredGrouped = searchQuery === ''
    ? groupedModules
    : Object.entries(groupedModules).reduce((acc, [category, mods]) => {
        const filtered = mods.filter(m =>
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.slug.toLowerCase().includes(searchQuery.toLowerCase())
        )
        if (filtered.length > 0) {
          acc[category] = filtered
        }
        return acc
      }, {} as GroupedModules)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'Personal Data': '👤',
      'Company Data': '🏢',
      'Vehicle Data': '🚗',
      'Phone Data': '📱',
      'Address Data': '📍',
      'Email Data': '📧',
      'Credit Data': '💳',
      'Financial Data': '💰',
      'Legal Data': '⚖️',
      'Social Data': '🌐',
    }
    return icons[category] || '📦'
  }

  const translateCategory = (category: string) => {
    const translations: Record<string, string> = {
      'Personal Data': 'Dados Pessoais',
      'Company Data': 'Dados Empresariais',
      'Vehicle Data': 'Dados de Veículos',
      'Phone Data': 'Dados de Telefone',
      'Address Data': 'Dados de Endereço',
      'Email Data': 'Dados de E-mail',
      'Credit Data': 'Dados de Crédito',
      'Financial Data': 'Dados Financeiros',
      'Legal Data': 'Dados Legais',
      'Social Data': 'Dados Sociais',
    }
    return translations[category] || category
  }

  const scrollCategory = (category: string, direction: 'left' | 'right') => {
    const container = document.getElementById(`category-${category}`)
    if (container) {
      const scrollAmount = direction === 'left' ? -400 : 400
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Store className="h-8 w-8" />
            Marketplace de APIs
          </h1>
          <p className="text-gray-400">Navegue e descubra os módulos de API disponíveis</p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            variant="dark"
            placeholder="Buscar APIs por nome, descrição ou endpoint..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 text-base"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white/5 border-white/10 backdrop-blur">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-[#0069FF]/20">
                <Package className="h-6 w-6 text-[#0069FF]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{modules.length}</p>
                <p className="text-sm text-gray-400">Total de APIs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10 backdrop-blur">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/20">
                <Zap className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{modules.filter(m => m.status === 'active').length}</p>
                <p className="text-sm text-gray-400">APIs Ativas</p>
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
                <p className="text-2xl font-bold text-white">{modules.filter(m => m.is_premium).length}</p>
                <p className="text-sm text-gray-400">APIs Premium</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Netflix-Style Category Sections */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Carregando APIs...</div>
      ) : Object.keys(filteredGrouped).length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          Nenhuma API encontrada para sua busca.
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(filteredGrouped).map(([category, mods]) => (
            <div key={category} className="space-y-4">
              {/* Category Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="text-3xl">{getCategoryIcon(category)}</span>
                  {translateCategory(category)}
                  <Badge variant="secondary" className="ml-2">{mods.length}</Badge>
                </h2>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => scrollCategory(category, 'left')}
                    className="text-white hover:bg-white/10"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => scrollCategory(category, 'right')}
                    className="text-white hover:bg-white/10"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Horizontal Scrollable Module Cards */}
              <div
                id={`category-${category}`}
                className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {mods.map((module) => (
                  <Card
                    key={module.id}
                    className="bg-white/5 border-white/10 backdrop-blur hover:bg-white/10 transition-all duration-200 cursor-pointer flex-shrink-0 w-[320px] group hover:border-[#0069FF]/50"
                    style={{ willChange: 'transform, border-color' }}
                    onClick={() => setSelectedModule(module)}
                  >
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-white group-hover:text-[#0069FF] transition-colors flex items-center gap-2">
                              {module.name}
                              {module.is_premium && (
                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              )}
                            </h3>
                            <p className="text-xs text-gray-400 mt-1">{module.slug}</p>
                          </div>
                          {module.status === 'maintenance' && (
                            <Badge variant="outline" className="border-yellow-500 text-yellow-500 text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Maint.
                            </Badge>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-300 line-clamp-2 min-h-[40px]">
                          {module.description || 'Descrição não disponível'}
                        </p>

                        {/* Price & Limits */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Preço:</span>
                            <span className="font-bold text-[#0069FF] flex items-center gap-1">
                              <Zap className="h-4 w-4" />
                              {module.price_per_query} {module.price_per_query === 1 ? 'crédito' : 'créditos'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Limite de Taxa:</span>
                            <span className="text-gray-300">{module.rate_limit_minute}/min</span>
                          </div>
                        </div>

                        {/* Action */}
                        <Button
                          variant="outline"
                          className="w-full border-white/10 text-white hover:bg-[#0069FF] hover:text-white hover:border-[#0069FF] transition-all"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedModule(module)
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Module Detail Dialog */}
      <Dialog open={!!selectedModule} onOpenChange={(open) => !open && setSelectedModule(null)}>
        <DialogContent className="bg-[#1A1D3B] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedModule && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedModule.name}
                  {selectedModule.is_premium && (
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  )}
                  {selectedModule.status === 'maintenance' && (
                    <Badge variant="outline" className="border-yellow-500 text-yellow-500 ml-2">
                      Manutenção
                    </Badge>
                  )}
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  {selectedModule.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Endpoint */}
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Endpoint</h4>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-white/5 px-3 py-2 rounded text-sm">
                      <span className="text-green-400">{selectedModule.method}</span>{' '}
                      <span className="text-gray-300">{selectedModule.endpoint}</span>
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(selectedModule.endpoint)}
                      className="border-white/10 text-white hover:bg-white/10"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Pricing & Limits */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/5 p-4 rounded">
                    <p className="text-xs text-gray-400 mb-1">Custo por Consulta</p>
                    <p className="text-xl font-bold text-white">{selectedModule.price_per_query}</p>
                    <p className="text-xs text-gray-400">créditos</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded">
                    <p className="text-xs text-gray-400 mb-1">Limite/Min</p>
                    <p className="text-xl font-bold text-white">{selectedModule.rate_limit_minute}</p>
                    <p className="text-xs text-gray-400">consultas</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded">
                    <p className="text-xs text-gray-400 mb-1">Limite/Dia</p>
                    <p className="text-xl font-bold text-white">{selectedModule.rate_limit_day}</p>
                    <p className="text-xs text-gray-400">consultas</p>
                  </div>
                </div>

                {/* Exemplo de Requisição */}
                {selectedModule.example_request && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      Exemplo de Requisição
                    </h4>
                    <pre className="bg-white/5 p-4 rounded text-sm overflow-x-auto">
                      <code className="text-gray-300">
                        {JSON.stringify(selectedModule.example_request, null, 2)}
                      </code>
                    </pre>
                  </div>
                )}

                {/* Exemplo de Resposta */}
                {selectedModule.example_response && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      Exemplo de Resposta
                    </h4>
                    <pre className="bg-white/5 p-4 rounded text-sm overflow-x-auto">
                      <code className="text-gray-300">
                        {JSON.stringify(selectedModule.example_response, null, 2)}
                      </code>
                    </pre>
                  </div>
                )}

                {/* Tags */}
                {selectedModule.tags && selectedModule.tags.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Tags</h4>
                    <div className="flex gap-2 flex-wrap">
                      {selectedModule.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
