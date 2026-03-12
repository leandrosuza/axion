'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
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

export function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Check if user is logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        // Fetch user name
        const response = await fetch('/api/user/profile')
        if (response.ok) {
          const data = await response.json()
          setUserName(data.name)
        }
      }
    }
    checkUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    clearSession()
    setUser(null)
    router.push('/')
    router.refresh()
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-blue-600">
      <div className="container mx-auto px-6 max-w-[1200px]">
        <div className="flex items-center justify-between h-[70px]">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
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
          <nav className="hidden lg:flex items-center gap-8 flex-1 justify-end">
            <Link
              href="#services"
              className="text-white text-[14px] font-normal hover:text-white/80 transition-colors"
            >
              Services
            </Link>
            <Link
              href="#pricing"
              className="text-white text-[14px] font-normal hover:text-white/80 transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="#get-in-touch"
              className="text-white text-[14px] font-normal hover:text-white/80 transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* Auth Buttons / User Menu - Desktop */}
          <div className="hidden lg:flex items-center gap-4 ml-8">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-3 rounded-full hover:bg-white/10 pr-3 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20">
                  <UserAvatar
                    name={userName}
                    email={user.email}
                    size="sm"
                  />
                  <span className="text-white text-[14px] font-medium">
                    {userName || user.email?.split('@')[0] || 'User'}
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {userName || 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/dashboard')} className="cursor-pointer">
                    <UserIcon className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/dashboard/settings')} className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/dashboard/billing')} className="cursor-pointer">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Billing
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-white/10 font-normal text-[14px] h-10 px-5"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-white text-[#0069FF] hover:bg-white/90 font-medium text-[14px] h-10 px-6 rounded-md">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
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
                href="#services"
                className="text-white text-[14px] font-normal hover:text-white/80 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Services
              </Link>
              <Link
                href="#pricing"
                className="text-white text-[14px] font-normal hover:text-white/80 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="#get-in-touch"
                className="text-white text-[14px] font-normal hover:text-white/80 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="flex flex-col gap-2 pt-4 border-t border-white/10">
                {user ? (
                  <>
                    <div className="px-4 py-2 text-white">
                      <p className="text-sm font-medium">{userName || 'User'}</p>
                      <p className="text-xs opacity-80">{user.email}</p>
                    </div>
                    <Link href="/dashboard">
                      <Button
                        variant="ghost"
                        className="w-full text-white hover:bg-white/10 font-normal text-[14px] justify-start"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <UserIcon className="mr-2 h-4 w-4" />
                        Dashboard
                      </Button>
                    </Link>
                    <Link href="/dashboard/settings">
                      <Button
                        variant="ghost"
                        className="w-full text-white hover:bg-white/10 font-normal text-[14px] justify-start"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Button>
                    </Link>
                    <Link href="/dashboard/billing">
                      <Button
                        variant="ghost"
                        className="w-full text-white hover:bg-white/10 font-normal text-[14px] justify-start"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        Billing
                      </Button>
                    </Link>
                    <Button
                      onClick={() => {
                        handleSignOut()
                        setMobileMenuOpen(false)
                      }}
                      variant="ghost"
                      className="w-full text-white hover:bg-red-500/20 font-normal text-[14px] justify-start"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login">
                      <Button
                        variant="ghost"
                        className="w-full text-white hover:bg-white/10 font-normal text-[14px]"
                      >
                        Login
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button className="w-full bg-white text-[#0069FF] hover:bg-white/90 font-medium text-[14px]">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
