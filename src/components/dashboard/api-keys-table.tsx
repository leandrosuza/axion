'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Copy, MoreVertical, Trash2, Eye, EyeOff, Check, Code, Terminal } from 'lucide-react'
import { format } from 'date-fns'
import { maskApiKey } from '@/lib/utils/api-key'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'

interface ApiKey {
  id: string
  name: string
  key_hash: string
  key_preview: string
  full_key: string | null
  permissions: 'read' | 'full'
  is_active: boolean
  last_used_at: string | null
  created_at: string
}

interface ApiKeysTableProps {
  keys: ApiKey[]
}

export function ApiKeysTable({ keys }: ApiKeysTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [keyToDelete, setKeyToDelete] = useState<string | null>(null)

  const handleCopy = (key: ApiKey, type: 'key' | 'curl' | 'header' = 'key') => {
    if (!key.full_key) {
      toast({
        title: 'Chave Não Disponível',
        description: 'Esta chave foi criada antes da criptografia ser habilitada. Por favor, crie uma nova chave.',
        variant: 'destructive',
      })
      return
    }

    let textToCopy = ''
    let description = ''

    switch (type) {
      case 'key':
        textToCopy = key.full_key
        description = 'A chave API foi copiada para sua área de transferência.'
        break
      case 'curl':
        textToCopy = `curl -H "Authorization: Bearer ${key.full_key}" \\
  ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/v1/cpf?cpf=12345678901`
        description = 'O comando curl foi copiado. Substitua o CPF pelo seu parâmetro de consulta real.'
        break
      case 'header':
        textToCopy = `Authorization: Bearer ${key.full_key}`
        description = 'O cabeçalho de autorização foi copiado para sua área de transferência.'
        break
    }

    navigator.clipboard.writeText(textToCopy)
    setCopiedId(key.id)
    setTimeout(() => setCopiedId(null), 2000)
    toast({
      title: 'Copiado!',
      description,
    })
  }

  const confirmDelete = async () => {
    if (!keyToDelete) return

    setDeletingId(keyToDelete)
    const supabase = createClient()

    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', keyToDelete)

    if (error) {
      console.error('Error deleting key:', error)
      toast({
        title: 'Erro',
        description: 'Falha ao revogar chave API. Por favor, tente novamente.',
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Chave API Revogada',
        description: 'A chave API foi revogada com sucesso.',
      })
      router.refresh()
    }

    setDeletingId(null)
    setKeyToDelete(null)
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const supabase = createClient()

    const { error } = await supabase
      .from('api_keys')
      .update({ is_active: !currentStatus })
      .eq('id', id)

    if (error) {
      console.error('Error updating key:', error)
      toast({
        title: 'Erro',
        description: 'Falha ao atualizar chave API. Por favor, tente novamente.',
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Chave API Atualizada',
        description: `Chave API foi ${!currentStatus ? 'ativada' : 'desativada'}.`,
      })
      router.refresh()
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Chave</TableHead>
            <TableHead>Permissões</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Último Uso</TableHead>
            <TableHead>Criado</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {keys.map((key) => (
            <TableRow key={key.id}>
              <TableCell className="font-medium">{key.name}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {key.key_preview}
                  </code>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        title="Copiar chave API ou exemplos"
                      >
                        {copiedId === key.id ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                      <DropdownMenuItem onClick={() => handleCopy(key, 'key')}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copiar Chave API
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleCopy(key, 'header')}>
                        <Code className="mr-2 h-4 w-4" />
                        Copiar Cabeçalho de Auth
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleCopy(key, 'curl')}>
                        <Terminal className="mr-2 h-4 w-4" />
                        Copiar Exemplo cURL
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{key.permissions}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={key.is_active ? 'success' : 'secondary'}>
                  {key.is_active ? 'Ativa' : 'Inativa'}
                </Badge>
              </TableCell>
              <TableCell>
                {key.last_used_at
                  ? format(new Date(key.last_used_at), 'MMM dd, yyyy')
                  : 'Nunca'}
              </TableCell>
              <TableCell>{format(new Date(key.created_at), 'MMM dd, yyyy')}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleToggleActive(key.id, key.is_active)}>
                      {key.is_active ? (
                        <>
                          <EyeOff className="mr-2 h-4 w-4" />
                          Desativar
                        </>
                      ) : (
                        <>
                          <Eye className="mr-2 h-4 w-4" />
                          Ativar
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setKeyToDelete(key.id)}
                      disabled={deletingId === key.id}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {deletingId === key.id ? 'Revogando...' : 'Revogar'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={!!keyToDelete} onOpenChange={(open) => !open && setKeyToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revogar Chave API</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja revogar esta chave API? Esta ação não pode ser desfeita e todos os aplicativos que usam esta chave perderão o acesso imediatamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Revogar Chave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
