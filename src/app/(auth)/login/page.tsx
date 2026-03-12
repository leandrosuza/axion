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
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    if (hasValidSession()) {
      router.push('/dashboard')
    }
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.session) {
        saveSession({
          userId: data.user.id,
          email: data.user.email || '',
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: data.session.expires_at || 0,
        })

        toast({
          title: 'Bem-vindo de volta!',
          description: 'Você entrou com sucesso.',
        })

        router.push('/dashboard')
        router.refresh()
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'E-mail ou senha inválidos',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Login Form */}
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
              Bem-vindo de volta
            </h1>
            <p className="text-[16px] text-[#555866]">
              Entre na sua conta para continuar
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[14px] font-semibold text-[#1D203A]">
                Endereço de E-mail
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 pl-11 border-gray-200 focus:border-[#0069FF] focus:ring-[#0069FF] rounded-md text-[15px]"
                  placeholder="nome@exemplo.com"
                  required
                  disabled={loading}
                />
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 pl-11 pr-11 border-gray-200 focus:border-[#0069FF] focus:ring-[#0069FF] rounded-md text-[15px]"
                  placeholder="Digite sua senha"
                  required
                  disabled={loading}
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

            <Button
              type="submit"
              className="w-full bg-[#0069FF] hover:bg-[#0055DD] text-white text-[16px] font-semibold h-12 rounded-md"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[14px] text-[#555866]">
              Não tem uma conta?{' '}
              <Link href="/register" className="text-[#0069FF] hover:underline font-semibold">
                Criar conta
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
              A datatech mais revolucionária do país!
            </h2>
            <p className="text-[18px] opacity-90">
              Acesse insights de dados poderosos com nossa plataforma de API abrangente.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
