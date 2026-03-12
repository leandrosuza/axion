'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { saveSession, hasValidSession } from '@/lib/utils/session'
import { Eye, EyeOff, Mail, Lock, User, Phone, CreditCard, Building } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    cpfCnpj: '',
    phone: '',
    accountType: 'individual' as 'individual' | 'business',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    if (hasValidSession()) {
      router.push('/dashboard')
    }
  }, [router])

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'As senhas não coincidem',
        description: 'Certifique-se de que suas senhas coincidem.',
        variant: 'destructive',
      })
      return
    }

    if (formData.password.length < 8) {
      toast({
        title: 'Senha muito curta',
        description: 'A senha deve ter pelo menos 8 caracteres.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      // Call our registration API endpoint
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          cpfCnpj: formData.cpfCnpj,
          phone: formData.phone,
          accountType: formData.accountType,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: 'Falha no Registro',
          description: data.error || 'Ocorreu um erro durante o registro',
          variant: 'destructive',
        })
        return
      }

      // If registration includes auto-login, save session
      if (data.session) {
        saveSession({
          userId: data.user.id,
          email: data.user.email || formData.email,
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: data.session.expires_at || 0,
        })
      }

      toast({
        title: 'Bem-vindo à BigDataCorp!',
        description: 'Sua conta foi criada com sucesso.',
      })

      // Redirect to dashboard
      router.push('/dashboard')
      router.refresh()
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Ocorreu um erro inesperado',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-block mb-8">
            <Image
              src="/assets/bdc-branco-01.avif"
              alt="BigDataCorp"
              width={180}
              height={26}
              className="h-[26px] w-auto brightness-0"
              priority
            />
          </Link>

          <div className="mb-8">
            <h1 className="text-[32px] font-bold text-[#1D203A] mb-2">
              Crie sua conta
            </h1>
            <p className="text-[16px] text-[#555866]">
              Comece com 1.000 chamadas API grátis por mês
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[14px] font-semibold text-[#1D203A]">
                Nome Completo
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="h-12 pl-11 border-gray-200 focus:border-[#0069FF] focus:ring-[#0069FF] rounded-md text-[15px]"
                  placeholder="João Silva"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[14px] font-semibold text-[#1D203A]">
                Endereço de E-mail
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="h-12 pl-11 border-gray-200 focus:border-[#0069FF] focus:ring-[#0069FF] rounded-md text-[15px]"
                  placeholder="nome@exemplo.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cpfCnpj" className="text-[14px] font-semibold text-[#1D203A]">
                  CPF/CNPJ
                </Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="cpfCnpj"
                    type="text"
                    value={formData.cpfCnpj}
                    onChange={(e) => handleChange('cpfCnpj', e.target.value.replace(/\D/g, ''))}
                    className="h-12 pl-11 border-gray-200 focus:border-[#0069FF] focus:ring-[#0069FF] rounded-md text-[15px]"
                    placeholder="123.456.789-01"
                    required
                    disabled={loading}
                    maxLength={14}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-[14px] font-semibold text-[#1D203A]">
                  Telefone
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, ''))}
                    className="h-12 pl-11 border-gray-200 focus:border-[#0069FF] focus:ring-[#0069FF] rounded-md text-[15px]"
                    placeholder="(11) 98765-4321"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountType" className="text-[14px] font-semibold text-[#1D203A]">
                Tipo de Conta
              </Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                <Select
                  value={formData.accountType}
                  onValueChange={(value) => handleChange('accountType', value)}
                  disabled={loading}
                >
                  <SelectTrigger className="h-12 pl-11 border-gray-200 focus:border-[#0069FF] focus:ring-[#0069FF] rounded-md text-[15px]">
                    <SelectValue placeholder="Selecione o tipo de conta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="business">Empresa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[14px] font-semibold text-[#1D203A]">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className="h-12 pl-11 pr-11 border-gray-200 focus:border-[#0069FF] focus:ring-[#0069FF] rounded-md text-[15px]"
                  placeholder="Mín. 8 caracteres"
                  required
                  disabled={loading}
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-[14px] font-semibold text-[#1D203A]">
                Confirmar Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  className="h-12 pl-11 pr-11 border-gray-200 focus:border-[#0069FF] focus:ring-[#0069FF] rounded-md text-[15px]"
                  placeholder="Confirme sua senha"
                  required
                  disabled={loading}
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-start space-x-2 pt-2">
              <input
                type="checkbox"
                id="terms"
                required
                disabled={loading}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-[#0069FF] focus:ring-[#0069FF]"
              />
              <label htmlFor="terms" className="text-[13px] text-[#555866]">
                Eu concordo com os{' '}
                <Link href="/terms" className="text-[#0069FF] hover:underline font-medium">
                  Termos de Serviço
                </Link>{' '}
                e{' '}
                <Link href="/privacy" className="text-[#0069FF] hover:underline font-medium">
                  Política de Privacidade
                </Link>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#0069FF] hover:bg-[#0055DD] text-white text-[16px] font-semibold h-12 rounded-md mt-2"
              disabled={loading}
            >
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[14px] text-[#555866]">
              Já tem uma conta?{' '}
              <Link href="/login" className="text-[#0069FF] hover:underline font-semibold">
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Gradient */}
      <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-[#0069FF] via-[#667eea] to-[#764ba2] relative">
        <div className="relative h-full flex items-center justify-center p-12">
          <div className="text-white max-w-md">
            <h2 className="text-[42px] font-bold mb-4">
              Junte-se a milhares de desenvolvedores!
            </h2>
            <p className="text-[18px] opacity-90 mb-8">
              Obtenha acesso instantâneo a APIs de dados poderosas e comece a construir aplicações incríveis hoje.
            </p>
            <ul className="space-y-4 text-[16px]">
              <li className="flex items-center">
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                1.000 chamadas API grátis mensalmente
              </li>
              <li className="flex items-center">
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Não é necessário cartão de crédito
              </li>
              <li className="flex items-center">
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Integração e documentação fáceis
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
