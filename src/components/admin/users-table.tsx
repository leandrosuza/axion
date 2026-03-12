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
  TableRow 
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'
import { Search, MoreVertical, UserCog, Ban, CheckCircle } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface User {
  id: string
  email: string
  name: string | null
  cpf_cnpj: string | null
  phone: string | null
  account_type: string
  created_at: string
  subscriptions: Array<{
    plan_type: string
    status: string
  }>
}

interface UsersTableProps {
  users: User[]
}

export function UsersTable({ users }: UsersTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPlan, setFilterPlan] = useState<string>('all')

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesPlan = filterPlan === 'all' || 
      user.subscriptions?.[0]?.plan_type === filterPlan

    return matchesSearch && matchesPlan
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar usuários por email, nome ou ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={filterPlan}
          onChange={(e) => setFilterPlan(e.target.value)}
          className="px-4 py-2 border rounded-md"
        >
          <option value="all">Todos os Planos</option>
          <option value="free">Gratuito</option>
          <option value="basic">Básico</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Empresarial</option>
        </select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Tipo de Conta</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Cadastrado</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.name || 'Sem nome'}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                      <div className="text-xs text-muted-foreground font-mono">{user.id.substring(0, 8)}...</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.account_type === 'admin' ? 'destructive' : 'secondary'}>
                      {user.account_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.subscriptions?.[0]?.plan_type === 'free' ? 'secondary' : 'default'}>
                      {user.subscriptions?.[0]?.plan_type?.toUpperCase() || 'NONE'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        user.subscriptions?.[0]?.status === 'active' 
                          ? 'default' 
                          : 'secondary'
                      }
                    >
                      {user.subscriptions?.[0]?.status || 'inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(user.created_at), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <UserCog className="mr-2 h-4 w-4" />
                          Ver Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Alterar Plano
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Ban className="mr-2 h-4 w-4" />
                          Suspender Usuário
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Nenhum usuário encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-muted-foreground">
        Mostrando {filteredUsers.length} de {users.length} usuários
      </div>
    </div>
  )
}
