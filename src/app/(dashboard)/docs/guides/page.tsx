'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { BookOpen, Search, Star, FileText, ArrowRight, Eye, BookMarked } from 'lucide-react'

interface Documentation {
  id: string
  title: string
  slug: string
  description: string | null
  category: string
  is_featured: boolean
  tags: string[]
  views: number
  created_at: string
  api_modules: {
    id: string
    name: string
    slug: string
  } | null
}

interface GroupedDocs {
  [category: string]: Documentation[]
}

export default function GuidesPage() {
  const { toast } = useToast()
  const [documentation, setDocumentation] = useState<Documentation[]>([])
  const [groupedDocs, setGroupedDocs] = useState<GroupedDocs>({})
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchDocumentation()
  }, [])

  const fetchDocumentation = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/documentation')
      if (!res.ok) throw new Error('Failed to fetch documentation')
      const data = await res.json()
      setDocumentation(data.documentation)
      setGroupedDocs(data.grouped)
      setCategories(data.categories.map((c: any) => c.name))
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

  const filteredDocs = documentation.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const featuredDocs = documentation.filter(doc => doc.is_featured)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <BookMarked className="h-8 w-8" />
              Documentação e Guias
            </h1>
            <p className="text-gray-400">Aprenda como integrar e usar nossas APIs</p>
          </div>
          <Link href="/docs">
            <Badge variant="outline" className="cursor-pointer hover:bg-white/10">
              <FileText className="h-3 w-3 mr-1" />
              API Reference
            </Badge>
          </Link>
        </div>

        {/* Search */}
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Buscar documentação..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 text-base bg-white/5 border-white/10 text-white"
          />
        </div>
      </div>

      {/* Featured Documentation */}
      {featuredDocs.length > 0 && !searchQuery && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            <h2 className="text-xl font-bold text-white">Guias em Destaque</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {featuredDocs.map((doc) => (
              <Link key={doc.id} href={`/docs/${doc.slug}`}>
                <Card className="bg-white/5 border-white/10 backdrop-blur hover:bg-white/10 hover:border-[#0069FF]/50 transition-all cursor-pointer h-full group">
                  <CardHeader>
                    <CardTitle className="text-white group-hover:text-[#0069FF] transition-colors flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {doc.title}
                      <ArrowRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </CardTitle>
                    {doc.description && (
                      <CardDescription className="text-gray-400">
                        {doc.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <Badge variant="secondary">{doc.category}</Badge>
                      <div className="flex items-center gap-1 text-gray-400">
                        <Eye className="h-3 w-3" />
                        <span>{doc.views}</span>
                      </div>
                    </div>
                    {doc.api_modules && (
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs">
                          {doc.api_modules.name}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* All Documentation by Category */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Carregando documentação...</div>
      ) : filteredDocs.length === 0 ? (
        <Card className="bg-white/5 border-white/10 backdrop-blur">
          <CardContent className="pt-6 text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">
              {searchQuery
                ? 'Nenhuma documentação encontrada para sua busca.'
                : 'Nenhuma documentação disponível ainda. Volte em breve!'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {searchQuery ? (
            // Show search results
            <div>
              <h2 className="text-xl font-bold text-white mb-4">
                Resultados da Busca ({filteredDocs.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {filteredDocs.map((doc) => (
                  <Link key={doc.id} href={`/docs/${doc.slug}`}>
                    <Card className="bg-white/5 border-white/10 backdrop-blur hover:bg-white/10 hover:border-[#0069FF]/50 transition-all cursor-pointer group">
                      <CardHeader>
                        <CardTitle className="text-white group-hover:text-[#0069FF] transition-colors flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          {doc.title}
                          <ArrowRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </CardTitle>
                        {doc.description && (
                          <CardDescription className="text-gray-400">
                            {doc.description}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary">{doc.category}</Badge>
                          {doc.api_modules && (
                            <Badge variant="outline" className="text-xs">
                              {doc.api_modules.name}
                            </Badge>
                          )}
                          {doc.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            // Show by category
            categories.map((category) => {
              const docs = groupedDocs[category] || []
              if (docs.length === 0) return null

              return (
                <div key={category}>
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    {category}
                    <Badge variant="secondary" className="ml-2">{docs.length}</Badge>
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {docs.map((doc) => (
                      <Link key={doc.id} href={`/docs/${doc.slug}`}>
                        <Card className="bg-white/5 border-white/10 backdrop-blur hover:bg-white/10 hover:border-[#0069FF]/50 transition-all cursor-pointer h-full group">
                          <CardHeader>
                            <CardTitle className="text-white group-hover:text-[#0069FF] transition-colors flex items-center gap-2">
                              <FileText className="h-5 w-5 flex-shrink-0" />
                              <span className="line-clamp-2">{doc.title}</span>
                              <ArrowRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                            </CardTitle>
                            {doc.description && (
                              <CardDescription className="text-gray-400 line-clamp-2">
                                {doc.description}
                              </CardDescription>
                            )}
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {doc.api_modules && (
                                <Badge variant="outline" className="text-xs">
                                  {doc.api_modules.name}
                                </Badge>
                              )}
                              <div className="flex items-center gap-1 text-xs text-gray-400">
                                <Eye className="h-3 w-3" />
                                <span>{doc.views} views</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
