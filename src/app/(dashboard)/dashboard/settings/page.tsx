'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { Switch } from '@/components/ui/switch'
import { PasswordStrength } from '@/components/ui/password-strength'
import { UserAvatar } from '@/components/ui/user-avatar'
import { AvatarUpload } from '@/components/profile/avatar-upload'
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
import {
  User,
  Lock,
  Bell,
  Mail,
  Phone,
  Building2,
  Save,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showFinalConfirmDialog, setShowFinalConfirmDialog] = useState(false)
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    cpfCnpj: '',
    phone: '',
    accountType: 'individual',
    avatarUrl: null as string | null
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [notifications, setNotifications] = useState({
    emailAlertsEnabled: true,
    usageAlertsEnabled: true,
    billingAlertsEnabled: true,
    securityAlertsEnabled: true
  })

  // Validation states
  const [nameError, setNameError] = useState('')
  const [cpfError, setCpfError] = useState('')
  const [phoneError, setPhoneError] = useState('')

  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadUserData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadUserData() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)

      // Fetch user profile from database
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile({
          name: data.name || '',
          email: data.email || user.email || '',
          cpfCnpj: data.cpfCnpj || '',
          phone: data.phone || '',
          accountType: data.accountType || 'individual',
          avatarUrl: data.avatarUrl || null
        })
        setNotifications({
          emailAlertsEnabled: data.emailAlertsEnabled ?? true,
          usageAlertsEnabled: data.usageAlertsEnabled ?? true,
          billingAlertsEnabled: data.billingAlertsEnabled ?? true,
          securityAlertsEnabled: data.securityAlertsEnabled ?? true
        })
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  function validateProfileFields() {
    let isValid = true

    // Name validation
    if (!profile.name || profile.name.trim().length < 2) {
      setNameError('O nome deve ter pelo menos 2 caracteres')
      isValid = false
    } else {
      setNameError('')
    }

    // CPF/CNPJ validation
    if (profile.cpfCnpj && profile.cpfCnpj.length > 0) {
      const digits = profile.cpfCnpj.replace(/\D/g, '')
      if (digits.length !== 11 && digits.length !== 14) {
        setCpfError('CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos')
        isValid = false
      } else {
        setCpfError('')
      }
    } else {
      setCpfError('')
    }

    // Phone validation
    if (profile.phone && profile.phone.length > 0) {
      const digits = profile.phone.replace(/\D/g, '')
      if (digits.length < 10 || digits.length > 11) {
        setPhoneError('O telefone deve ter 10-11 dígitos')
        isValid = false
      } else {
        setPhoneError('')
      }
    } else {
      setPhoneError('')
    }

    return isValid
  }

  async function handleProfileUpdate(e: React.FormEvent) {
    e.preventDefault()

    if (!validateProfileFields()) {
      toast({
        title: 'Erro de Validação',
        description: 'Por favor, corrija os erros antes de salvar',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      let avatarUrl = profile.avatarUrl

      // Upload avatar if a new file was selected
      if (avatarFile) {
        const formData = new FormData()
        formData.append('avatar', avatarFile)

        const uploadResponse = await fetch('/api/user/avatar', {
          method: 'POST',
          body: formData
        })

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload avatar')
        }

        const uploadData = await uploadResponse.json()
        avatarUrl = uploadData.avatarUrl
      }

      // Update profile with avatar URL
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...profile,
          avatarUrl
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      const updatedData = await response.json()

      // Update local state with new avatar URL and all profile data
      setProfile({
        name: updatedData.name || '',
        email: updatedData.email || profile.email,
        cpfCnpj: updatedData.cpfCnpj || profile.cpfCnpj,
        phone: updatedData.phone || '',
        accountType: updatedData.accountType || profile.accountType,
        avatarUrl: updatedData.avatarUrl || null
      })
      setAvatarFile(null)
      setAvatarPreview(null)

      toast({
        title: 'Sucesso!',
        description: 'Seu perfil foi atualizado.',
      })
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao atualizar perfil',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Erro',
        description: 'As novas senhas não coincidem',
        variant: 'destructive',
      })
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: 'Erro',
        description: 'A senha deve ter pelo menos 8 caracteres',
        variant: 'destructive',
      })
      return
    }

    // Check password strength
    const hasUpperCase = /[A-Z]/.test(passwordData.newPassword)
    const hasLowerCase = /[a-z]/.test(passwordData.newPassword)
    const hasNumber = /\d/.test(passwordData.newPassword)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(passwordData.newPassword)

    const strengthChecks = [hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(Boolean).length

    if (strengthChecks < 3) {
      toast({
        title: 'Senha Fraca',
        description: 'Por favor, use uma senha mais forte com maiúsculas, minúsculas, números e caracteres especiais',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (error) throw error

      toast({
        title: 'Sucesso!',
        description: 'Sua senha foi alterada.',
      })

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao alterar senha',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleNotificationUpdate() {
    setLoading(true)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notifications)
      })

      if (!response.ok) {
        throw new Error('Failed to update notification preferences')
      }

      toast({
        title: 'Sucesso!',
        description: 'Suas preferências de notificação foram atualizadas.',
      })
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao atualizar preferências de notificação',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  async function confirmDeleteAccount() {
    setShowDeleteDialog(false)
    setShowFinalConfirmDialog(true)
  }

  async function handleDeleteAccount() {
    setShowFinalConfirmDialog(false)
    setLoading(true)

    try {
      const response = await fetch('/api/user/delete', {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete account')
      }

      toast({
        title: 'Conta Excluída',
        description: 'Sua conta foi permanentemente excluída.',
      })

      await supabase.auth.signOut()
      router.push('/')
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao excluir conta',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  function handleAvatarChange(file: File | null, previewUrl: string | null) {
    setAvatarFile(file)
    setAvatarPreview(previewUrl)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Configurações</h1>
        <p className="text-gray-400">Gerencie as configurações e preferências da sua conta</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="h-4 w-4 mr-2" />
            Segurança
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="danger">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Zona de Perigo
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          {/* Avatar Card */}
          <Card className="overflow-hidden bg-white/5 border-white/10 backdrop-blur">
            <div className="h-32 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500" />
            <CardContent className="relative pb-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 -mt-16 sm:-mt-12">
                <AvatarUpload
                  currentAvatarUrl={avatarPreview || profile.avatarUrl}
                  userName={profile.name}
                  userEmail={profile.email}
                  onAvatarChange={handleAvatarChange}
                  className="ring-4 ring-white shadow-xl"
                />
                <div className="flex-1 text-center sm:text-left pt-4">
                  <h3 className="text-2xl font-bold text-white">{profile.name || 'Usuário'}</h3>
                  <p className="text-gray-400">{profile.email}</p>
                  <div className="mt-2 inline-flex items-center gap-2 text-sm text-gray-400">
                    <span className="capitalize">{profile.accountType}</span>
                    <span className="text-gray-400">•</span>
                    <span>Membro desde {new Date().getFullYear()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white">Informações do Perfil</CardTitle>
              <CardDescription className="text-gray-400">Atualize suas informações pessoais</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white">
                      Nome Completo <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        value={profile.name}
                        onChange={(e) => {
                          setProfile({ ...profile, name: e.target.value })
                          setNameError('')
                        }}
                        className={`pl-10 ${nameError ? 'border-red-500' : ''}`}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    {nameError && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        {nameError}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">Endereço de E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="pl-10"
                        placeholder="joao@exemplo.com"
                        disabled
                      />
                    </div>
                    <p className="text-xs text-gray-400">
                      O e-mail não pode ser alterado. Entre em contato com o suporte se necessário.
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cpfCnpj" className="text-white">CPF/CNPJ</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="cpfCnpj"
                        value={profile.cpfCnpj}
                        onChange={(e) => {
                          setProfile({ ...profile, cpfCnpj: e.target.value.replace(/\D/g, '') })
                          setCpfError('')
                        }}
                        className={`pl-10 ${cpfError ? 'border-red-500' : ''}`}
                        placeholder="12345678901 or 12345678901234"
                        maxLength={14}
                      />
                    </div>
                    {cpfError && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        {cpfError}
                      </p>
                    )}
                    {!cpfError && profile.cpfCnpj && (profile.cpfCnpj.length === 11 || profile.cpfCnpj.length === 14) && (
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        {profile.cpfCnpj.length === 11 ? 'CPF' : 'CNPJ'} válido
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-white">Número de Telefone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={profile.phone}
                        onChange={(e) => {
                          setProfile({ ...profile, phone: e.target.value.replace(/\D/g, '') })
                          setPhoneError('')
                        }}
                        className={`pl-10 ${phoneError ? 'border-red-500' : ''}`}
                        placeholder="11987654321"
                        maxLength={11}
                      />
                    </div>
                    {phoneError && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        {phoneError}
                      </p>
                    )}
                    {!phoneError && profile.phone && profile.phone.length >= 10 && profile.phone.length <= 11 && (
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Número de telefone válido
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountType" className="text-white">Tipo de Conta</Label>
                  <Input
                    id="accountType"
                    value={profile.accountType}
                    className="capitalize"
                    disabled
                  />
                  <p className="text-xs text-gray-400">
                    O tipo de conta não pode ser alterado
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button type="submit" disabled={loading} className="bg-[#0069FF] hover:bg-[#0069FF]/90 text-white">
                    <Save className="mr-2 h-4 w-4" />
                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                  <Button type="button" variant="outline" onClick={loadUserData} className="border-white/20 text-white hover:bg-white/10">
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card className="bg-white/5 border-white/10 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white">Alterar Senha</CardTitle>
              <CardDescription className="text-gray-400">Atualize sua senha para manter sua conta segura</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-white">Senha Atual</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="Digite a senha atual"
                  />
                  <p className="text-xs text-gray-400">
                    Sua sessão atual será usada para verificar esta alteração
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-white">
                    Nova Senha <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Digite a nova senha"
                    minLength={8}
                    required
                  />
                  <PasswordStrength password={passwordData.newPassword} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-white">
                    Confirmar Nova Senha <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Confirme a nova senha"
                    minLength={8}
                    required
                  />
                  {passwordData.confirmPassword && (
                    <p className={`text-xs flex items-center gap-1 ${
                      passwordData.newPassword === passwordData.confirmPassword
                        ? 'text-green-600'
                        : 'text-red-500'
                    }`}>
                      {passwordData.newPassword === passwordData.confirmPassword ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          As senhas coincidem
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3" />
                          As senhas não coincidem
                        </>
                      )}
                    </p>
                  )}
                </div>

                <Button type="submit" disabled={loading} className="bg-[#0069FF] hover:bg-[#0069FF]/90 text-white">
                  <Lock className="mr-2 h-4 w-4" />
                  {loading ? 'Atualizando...' : 'Atualizar Senha'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white">Sessões Ativas</CardTitle>
              <CardDescription className="text-gray-400">Gerencie suas sessões ativas em todos os dispositivos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-white/10 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-white">Sessão Atual</p>
                    <p className="text-sm text-gray-400">
                      {typeof window !== 'undefined' && navigator.userAgent.includes('Windows') && 'Windows'}
                      {typeof window !== 'undefined' && navigator.userAgent.includes('Mac') && 'macOS'}
                      {typeof window !== 'undefined' && navigator.userAgent.includes('Linux') && 'Linux'}
                      {' • '}
                      {typeof window !== 'undefined' && navigator.userAgent.includes('Chrome') && 'Chrome'}
                      {typeof window !== 'undefined' && navigator.userAgent.includes('Firefox') && 'Firefox'}
                      {typeof window !== 'undefined' && navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome') && 'Safari'}
                      {' • '}
                      {new Date().toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Última atividade: {new Date().toLocaleTimeString()}
                    </p>
                  </div>
                  <Button variant="outline" onClick={handleLogout} className="border-white/20 text-white hover:bg-white/10">
                    Sair
                  </Button>
                </div>
                <p className="text-sm text-gray-400">
                  Por segurança, você será desconectado automaticamente após 7 dias de inatividade.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="bg-white/5 border-white/10 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white">Notificações por E-mail</CardTitle>
              <CardDescription className="text-gray-400">Escolha quais notificações você deseja receber</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-medium text-white">Alertas por E-mail</p>
                  <p className="text-sm text-gray-400">
                    Receba atualizações importantes por e-mail
                  </p>
                </div>
                <Switch
                  checked={notifications.emailAlertsEnabled}
                  onCheckedChange={(checked: boolean) =>
                    setNotifications({ ...notifications, emailAlertsEnabled: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-medium text-white">Alertas de Uso</p>
                  <p className="text-sm text-gray-400">
                    Seja notificado ao se aproximar dos limites de taxa
                  </p>
                </div>
                <Switch
                  checked={notifications.usageAlertsEnabled}
                  onCheckedChange={(checked: boolean) =>
                    setNotifications({ ...notifications, usageAlertsEnabled: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-medium text-white">Alertas de Cobrança</p>
                  <p className="text-sm text-gray-400">
                    Notificações sobre pagamentos e faturas
                  </p>
                </div>
                <Switch
                  checked={notifications.billingAlertsEnabled}
                  onCheckedChange={(checked: boolean) =>
                    setNotifications({ ...notifications, billingAlertsEnabled: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-medium text-white">Alertas de Segurança</p>
                  <p className="text-sm text-gray-400">
                    Notificações importantes de segurança (recomendado)
                  </p>
                </div>
                <Switch
                  checked={notifications.securityAlertsEnabled}
                  onCheckedChange={(checked: boolean) =>
                    setNotifications({ ...notifications, securityAlertsEnabled: checked })
                  }
                />
              </div>

              <Button onClick={handleNotificationUpdate} disabled={loading} className="bg-[#0069FF] hover:bg-[#0069FF]/90 text-white">
                <Save className="mr-2 h-4 w-4" />
                {loading ? 'Salvando...' : 'Salvar Preferências'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Danger Zone Tab */}
        <TabsContent value="danger" className="space-y-6">
          <Card className="border-destructive bg-white/5 border-white/10 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
              <CardDescription className="text-gray-400">Ações irreversíveis e destrutivas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border border-destructive rounded-lg bg-destructive/5">
                <h4 className="font-semibold text-destructive mb-2">Excluir Conta</h4>
                <p className="text-sm text-gray-400 mb-4">
                  Uma vez que você excluir sua conta, não há volta. Isso excluirá permanentemente:
                </p>
                <ul className="text-sm text-gray-400 space-y-1 mb-4 ml-4 list-disc">
                  <li>Seu perfil e informações da conta</li>
                  <li>Todas as chaves API e tokens de acesso</li>
                  <li>Histórico de uso e dados de análise</li>
                  <li>Informações de assinatura e cobrança</li>
                </ul>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={loading}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {loading ? 'Excluindo...' : 'Excluir Conta'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* First confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Conta</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja excluir sua conta? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteAccount}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Final confirmation dialog */}
      <AlertDialog open={showFinalConfirmDialog} onOpenChange={setShowFinalConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Aviso Final
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p className="font-semibold">Isso excluirá permanentemente todos os seus dados, chaves API e histórico de uso.</p>
              <p>Você tem certeza absoluta?</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Sim, Excluir Tudo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
