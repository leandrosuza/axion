'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Play, Copy, Check } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface ApiKey {
  id: string
  name: string
  key_preview: string
  full_key: string // Decrypted full key for API calls
}

interface ApiPlaygroundProps {
  apiKeys: ApiKey[]
}

const endpoints = [
  {
    value: 'cpf',
    label: 'CPF - Consulta de Pessoa Física',
    path: '/api/v1/cpf',
    params: [{ name: 'cpf', label: 'CPF (11 dígitos)', placeholder: '12345678901', required: true }]
  },
  {
    value: 'cnpj',
    label: 'CNPJ - Consulta de Empresa',
    path: '/api/v1/cnpj',
    params: [{ name: 'cnpj', label: 'CNPJ (14 dígitos)', placeholder: '12345678000190', required: true }]
  },
  {
    value: 'telefone',
    label: 'Telefone - Consulta de Número',
    path: '/api/v1/telefone',
    params: [{ name: 'telefone', label: 'Telefone com DDD', placeholder: '11987654321', required: true }]
  },
  {
    value: 'veiculos',
    label: 'Veículos - Consulta de Veículos',
    path: '/api/v1/veiculos',
    params: [
      { name: 'cpf', label: 'CPF (11 dígitos)', placeholder: '12345678901', required: false },
      { name: 'cnpj', label: 'CNPJ (14 dígitos)', placeholder: '12345678000190', required: false }
    ]
  },
  {
    value: 'relacionados',
    label: 'Relacionados - Busca de Vínculos',
    path: '/api/v1/relacionados',
    params: [{ name: 'cpf', label: 'CPF (11 dígitos)', placeholder: '12345678901', required: true }]
  },
  {
    value: 'beneficios',
    label: 'Benefícios - Consulta de Programas Sociais',
    path: '/api/v1/beneficios',
    params: [{ name: 'cpf', label: 'CPF (11 dígitos)', placeholder: '12345678901', required: true }]
  },
]

export function ApiPlayground({ apiKeys }: ApiPlaygroundProps) {
  const [selectedEndpoint, setSelectedEndpoint] = useState('')
  const [selectedApiKeyId, setSelectedApiKeyId] = useState('')
  const [params, setParams] = useState<{ [key: string]: string }>({})
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<any>(null)
  const [responseTime, setResponseTime] = useState<number | null>(null)
  const [statusCode, setStatusCode] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const currentEndpoint = endpoints.find(e => e.value === selectedEndpoint)
  const selectedApiKey = apiKeys.find(k => k.id === selectedApiKeyId)

  const handleSendRequest = async () => {
    if (!selectedEndpoint || !selectedApiKey) {
      toast({
        title: 'Error',
        description: 'Please select an endpoint and API key',
        variant: 'destructive',
      })
      return
    }

    // Validate required params
    const missingParams = currentEndpoint?.params
      .filter(p => p.required && !params[p.name])
      .map(p => p.label)

    if (missingParams && missingParams.length > 0) {
      toast({
        title: 'Missing Parameters',
        description: `Please provide: ${missingParams.join(', ')}`,
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    setResponse(null)
    setResponseTime(null)
    setStatusCode(null)

    const startTime = Date.now()

    try {
      // Build query string
      const queryParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value)
      })

      const url = `${currentEndpoint?.path}?${queryParams.toString()}`

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${selectedApiKey.full_key}`, // Use decrypted full key
          'Content-Type': 'application/json',
        },
      })

      const data = await res.json()
      const endTime = Date.now()

      setResponse(data)
      setStatusCode(res.status)
      setResponseTime(endTime - startTime)

      if (!res.ok) {
        toast({
          title: 'Request Failed',
          description: data.error || 'An error occurred',
          variant: 'destructive',
        })
      }
    } catch (error: any) {
      toast({
        title: 'Request Failed',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      })
      setResponse({ error: error.message })
      setStatusCode(0)
    } finally {
      setLoading(false)
    }
  }

  const copyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(JSON.stringify(response, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: 'Copied!',
        description: 'Response copied to clipboard',
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Configuration Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="endpoint">Endpoint</Label>
          <Select value={selectedEndpoint} onValueChange={setSelectedEndpoint}>
            <SelectTrigger id="endpoint">
              <SelectValue placeholder="Select an endpoint" />
            </SelectTrigger>
            <SelectContent>
              {endpoints.map(endpoint => (
                <SelectItem key={endpoint.value} value={endpoint.value}>
                  {endpoint.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="apikey">API Key</Label>
          <Select value={selectedApiKeyId} onValueChange={setSelectedApiKeyId}>
            <SelectTrigger id="apikey">
              <SelectValue placeholder="Select an API key" />
            </SelectTrigger>
            <SelectContent>
              {apiKeys.length === 0 ? (
                <SelectItem value="none" disabled>No API keys available</SelectItem>
              ) : (
                apiKeys.map(key => (
                  <SelectItem key={key.id} value={key.id}>
                    {key.name} ({key.key_preview})
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Parameters Section */}
      {currentEndpoint && (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-3">Parameters</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {currentEndpoint.params.map(param => (
                <div key={param.name} className="space-y-2">
                  <Label htmlFor={param.name}>
                    {param.label}
                    {param.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  <Input
                    id={param.name}
                    placeholder={param.placeholder}
                    value={params[param.name] || ''}
                    onChange={(e) => setParams({ ...params, [param.name]: e.target.value })}
                  />
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={handleSendRequest}
            disabled={loading || !selectedApiKey}
            className="w-full"
          >
            {loading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Sending Request...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Send Request
              </>
            )}
          </Button>
        </div>
      )}

      {/* Response Section */}
      {response && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Response</h3>
            <div className="flex items-center gap-2">
              {statusCode !== null && (
                <Badge variant={statusCode >= 200 && statusCode < 300 ? 'default' : 'destructive'}>
                  {statusCode} {statusCode >= 200 && statusCode < 300 ? 'Success' : 'Error'}
                </Badge>
              )}
              {responseTime !== null && (
                <Badge variant="outline">{responseTime}ms</Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={copyResponse}
              >
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          <pre className="bg-muted p-4 rounded-lg overflow-x-auto max-h-[600px] overflow-y-auto">
            <code className="text-sm">{JSON.stringify(response, null, 2)}</code>
          </pre>
        </div>
      )}
    </div>
  )
}
