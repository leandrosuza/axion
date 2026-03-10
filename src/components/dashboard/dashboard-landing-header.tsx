'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { UserAvatar } from '@/components/ui/user-avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, Settings, User as UserIcon, CreditCard } from 'lucide-react'
import { clearSession } from '@/lib/utils/session'

interface DashboardLandingHeaderProps {
  userName?: string | null
  userEmail?: string | null
  userAvatar?: string | null
}

export function DashboardLandingHeader({ userName, userEmail, userAvatar }: DashboardLandingHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    clearSession()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#1A1D3B] to-[#0F1123] border-b border-white/10">
      <div className="container mx-auto px-6 max-w-full">
        <div className="flex items-center justify-between h-[70px]">
          {/* Logo */}
          <Link href="/dashboard" className="flex-shrink-0">
            <Image
              src="/assets/bdc-branco-01.avif"
              alt="BigDataCorp"
              width={180}
              height={26}
              className="h-[26px] w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 flex-1 justify-end">
            <Link
              href="/dashboard"
              className="text-white text-[14px] font-normal hover:text-white/80 transition-colors"
            >
              Visão Geral
            </Link>
            <Link
              href="/dashboard/keys"
              className="text-white text-[14px] font-normal hover:text-white/80 transition-colors"
            >
              Chaves API
            </Link>
            <Link
              href="/playground"
              className="text-white text-[14px] font-normal hover:text-white/80 transition-colors"
            >
              Playground API
            </Link>
            <Link
              href="/docs"
              className="text-white text-[14px] font-normal hover:text-white/80 transition-colors"
            >
              Documentação
            </Link>
            <Link
              href="/dashboard/usage"
              className="text-white text-[14px] font-normal hover:text-white/80 transition-colors"
            >
              Uso e Análises
            </Link>
            <Link
              href="/dashboard/billing"
              className="text-white text-[14px] font-normal hover:text-white/80 transition-colors"
            >
              Cobrança
            </Link>
            <Link
              href="/dashboard/settings"
              className="text-white text-[14px] font-normal hover:text-white/80 transition-colors"
            >
              Configurações
            </Link>
          </nav>

          {/* User Menu - Desktop */}
          <div className="hidden lg:flex items-center gap-4 ml-8">
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center rounded-full hover:bg-white/10 p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20">
                  <UserAvatar
                    name={userName}
                    email={userEmail}
                    avatarUrl={userAvatar}
                    size="sm"
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56" onCloseAutoFocus={(e) => e.preventDefault()}>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {userName || 'Usuário'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {userEmail}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/dashboard/settings')} className="cursor-pointer">
                  <UserIcon className="mr-2 h-4 w-4" />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/dashboard/settings')} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/dashboard/billing')} className="cursor-pointer">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Cobrança
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-white/10">
            <nav className="flex flex-col gap-4">
              <Link
                href="/dashboard"
                className="text-white text-[14px] font-normal hover:text-white/80 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Visão Geral
              </Link>
              <Link
                href="/dashboard/keys"
                className="text-white text-[14px] font-normal hover:text-white/80 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Chaves API
              </Link>
              <Link
                href="/playground"
                className="text-white text-[14px] font-normal hover:text-white/80 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Playground API
              </Link>
              <Link
                href="/docs"
                className="text-white text-[14px] font-normal hover:text-white/80 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Documentação
              </Link>
              <Link
                href="/dashboard/usage"
                className="text-white text-[14px] font-normal hover:text-white/80 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Uso e Análises
              </Link>
              <Link
                href="/dashboard/billing"
                className="text-white text-[14px] font-normal hover:text-white/80 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Cobrança
              </Link>
              <Link
                href="/dashboard/settings"
                className="text-white text-[14px] font-normal hover:text-white/80 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Configurações
              </Link>
              <div className="flex flex-col gap-2 pt-4 border-t border-white/10">
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  className="w-full text-white hover:bg-red-500/20 font-normal text-[14px] justify-start"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
