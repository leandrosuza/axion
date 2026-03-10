'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { ArrowLeft, Clock, Eye, FileText, Tag } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Documentation {
  id: string
  title: string
  slug: string
  content: string
  description: string | null
  category: string
  views: number
  tags: string[]
  created_at: string
  updated_at: string
  api_modules: {
    id: string
    name: string
    slug: string
    description: string | null
    endpoint: string
    method: string
    price_per_query: number
  } | null
}

export default function DocViewerPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [doc, setDoc] = useState<Documentation | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.slug) {
      fetchDocumentation(params.slug as string)
    }
  }, [params.slug])

  const fetchDocumentation = async (slug: string) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/documentation/${slug}`)
      if (!res.ok) {
        if (res.status === 404) {
          toast({
            title: 'Not Found',
            description: 'Documentation not found',
            variant: 'destructive'
          })
          router.push('/docs')
          return
        }
        throw new Error('Failed to fetch documentation')
      }
      const data = await res.json()
      setDoc(data)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400">Carregando documentação...</div>
      </div>
    )
  }

  if (!doc) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/docs">
        <Button variant="ghost" className="text-gray-400 hover:text-white">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Documentação
        </Button>
      </Link>

      {/* Header */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary">{doc.category}</Badge>
            {doc.api_modules && (
              <Badge variant="outline">{doc.api_modules.name}</Badge>
            )}
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">{doc.title}</h1>
          {doc.description && (
            <p className="text-xl text-gray-400">{doc.description}</p>
          )}
        </div>

        {/* Meta Information */}
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{doc.views} views</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>Atualizado {new Date(doc.updated_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Tags */}
        {doc.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Tag className="h-4 w-4 text-gray-400" />
            {doc.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Linked API Module Info */}
      {doc.api_modules && (
        <Card className="bg-[#0069FF]/10 border-[#0069FF]/30 backdrop-blur">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-[#0069FF]/20">
                <FileText className="h-6 w-6 text-[#0069FF]" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">
                  API Relacionada: {doc.api_modules.name}
                </h3>
                {doc.api_modules.description && (
                  <p className="text-gray-300 mb-3">{doc.api_modules.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm">
                  <Badge variant="default" className="bg-[#0069FF]">
                    {doc.api_modules.method}
                  </Badge>
                  <code className="text-gray-300">{doc.api_modules.endpoint}</code>
                  <span className="text-gray-400">
                    {doc.api_modules.price_per_query} crédito{doc.api_modules.price_per_query !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documentation Content */}
      <Card className="bg-white/5 border-white/10 backdrop-blur">
        <CardContent className="pt-6">
          <div className="prose prose-invert prose-blue max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({node, ...props}) => <h1 className="text-3xl font-bold text-white mt-8 mb-4" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-white mt-6 mb-3" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-xl font-semibold text-white mt-4 mb-2" {...props} />,
                h4: ({node, ...props}) => <h4 className="text-lg font-semibold text-white mt-3 mb-2" {...props} />,
                p: ({node, ...props}) => <p className="text-gray-300 mb-4 leading-relaxed" {...props} />,
                a: ({node, ...props}) => <a className="text-[#0069FF] hover:text-[#0069FF]/80 underline" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal list-inside text-gray-300 mb-4 space-y-2" {...props} />,
                li: ({node, ...props}) => <li className="text-gray-300" {...props} />,
                code: ({node, inline, ...props}: any) =>
                  inline ? (
                    <code className="bg-black/30 text-[#0069FF] px-1.5 py-0.5 rounded text-sm" {...props} />
                  ) : (
                    <code className="block bg-black/30 border border-white/10 p-4 rounded-lg overflow-x-auto text-sm text-gray-300" {...props} />
                  ),
                pre: ({node, ...props}) => <pre className="bg-black/30 border border-white/10 p-4 rounded-lg overflow-x-auto mb-4" {...props} />,
                blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-[#0069FF] pl-4 italic text-gray-400 my-4" {...props} />,
                table: ({node, ...props}) => <table className="w-full border-collapse border border-white/10 my-4" {...props} />,
                thead: ({node, ...props}) => <thead className="bg-white/5" {...props} />,
                tbody: ({node, ...props}) => <tbody {...props} />,
                tr: ({node, ...props}) => <tr className="border-b border-white/10" {...props} />,
                th: ({node, ...props}) => <th className="p-3 text-left text-white font-semibold" {...props} />,
                td: ({node, ...props}) => <td className="p-3 text-gray-300" {...props} />,
              }}
            >
              {doc.content}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      {/* Footer Navigation */}
      <div className="flex justify-between items-center pt-6 border-t border-white/10">
        <Link href="/docs">
          <Button variant="outline" className="border-white/10 text-white hover:bg-white/10">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Todas as Docs
          </Button>
        </Link>
        {doc.api_modules && (
          <Link href="/dashboard/marketplace">
            <Button className="bg-[#0069FF] hover:bg-[#0069FF]/90">
              Ver no Marketplace
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
