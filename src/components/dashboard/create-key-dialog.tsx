'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Copy, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'

interface CreateKeyDialogProps {
  children: React.ReactNode
}

export function CreateKeyDialog({ children }: CreateKeyDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [keyName, setKeyName] = useState('')
  const [generatedKey, setGeneratedKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleCreate = async () => {
    if (!keyName.trim()) {
      toast({
        title: 'Nome Obrigatório',
        description: 'Por favor, insira um nome para sua chave API.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: keyName, permissions: 'full' }),
      })

      const data = await response.json()

      if (response.ok) {
        setGeneratedKey(data.full_key)
      } else {
        toast({
          title: 'Erro',
          description: data.error || 'Falha ao criar chave API. Por favor, tente novamente.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error creating key:', error)
      toast({
        title: 'Erro',
        description: 'Falha ao criar chave API. Por favor, tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setKeyName('')
    setGeneratedKey(null)
    setCopied(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {generatedKey ? 'Chave API Criada!' : 'Criar Nova Chave API'}
          </DialogTitle>
          <DialogDescription>
            {generatedKey
              ? 'Salve esta chave agora. Por motivos de segurança, você não poderá vê-la novamente.'
              : 'Insira um nome para sua chave API para ajudá-lo a identificá-la mais tarde.'}
          </DialogDescription>
        </DialogHeader>

        {!generatedKey ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Chave</Label>
              <Input
                id="name"
                placeholder="ex: Chave API de Produção"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Sua Chave API</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={generatedKey}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
              <p className="font-semibold text-yellow-900 mb-1">⚠️ Importante</p>
              <p className="text-yellow-800">
                Armazene esta chave com segurança. Você não poderá vê-la novamente após fechar este diálogo.
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          {!generatedKey ? (
            <>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                Cancelar
              </Button>
              <Button onClick={handleCreate} disabled={loading}>
                {loading ? 'Criando...' : 'Criar Chave API'}
              </Button>
            </>
          ) : (
            <Button onClick={handleClose} className="w-full">
              Salvei Minha Chave
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
