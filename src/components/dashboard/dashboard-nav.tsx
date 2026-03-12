'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

// Import icons dynamically to avoid webpack issues
const LayoutDashboard = dynamic(() => import('lucide-react').then(mod => mod.LayoutDashboard), { ssr: false })
const Key = dynamic(() => import('lucide-react').then(mod => mod.Key), { ssr: false })
const Play = dynamic(() => import('lucide-react').then(mod => mod.Play), { ssr: false })
const FileText = dynamic(() => import('lucide-react').then(mod => mod.FileText), { ssr: false })
const BarChart3 = dynamic(() => import('lucide-react').then(mod => mod.BarChart3), { ssr: false })
const CreditCard = dynamic(() => import('lucide-react').then(mod => mod.CreditCard), { ssr: false })
const Shield = dynamic(() => import('lucide-react').then(mod => mod.Shield), { ssr: false })
const Settings = dynamic(() => import('lucide-react').then(mod => mod.Settings), { ssr: false })
const ChevronLeft = dynamic(() => import('lucide-react').then(mod => mod.ChevronLeft), { ssr: false })
const ChevronRight = dynamic(() => import('lucide-react').then(mod => mod.ChevronRight), { ssr: false })
const Store = dynamic(() => import('lucide-react').then(mod => mod.Store), { ssr: false })
const BookOpen = dynamic(() => import('lucide-react').then(mod => mod.BookOpen), { ssr: false })
const BookMarked = dynamic(() => import('lucide-react').then(mod => mod.BookMarked), { ssr: false })

const baseNavigation = [
  { name: 'Visão Geral', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Marketplace', href: '/dashboard/marketplace', icon: Store },
  { name: 'Chaves API', href: '/dashboard/keys', icon: Key },
  { name: 'Playground API', href: '/playground', icon: Play },
  { name: 'Guias e Tutoriais', href: '/docs/guides', icon: BookMarked },
  { name: 'Referência API', href: '/docs', icon: FileText },
  { name: 'Uso e Análises', href: '/dashboard/usage', icon: BarChart3 },
  { name: 'Cobrança', href: '/dashboard/billing', icon: CreditCard },
  { name: 'Configurações', href: '/dashboard/settings', icon: Settings },
]

const adminNavItems = [
  { name: 'Painel Admin', href: '/admin', icon: Shield },
  { name: 'Gerenciar Docs', href: '/admin/documentation', icon: BookOpen },
]

export function DashboardNav() {
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    // Check if user is admin
    const checkAdmin = async () => {
      try {
        const response = await fetch('/api/user/profile')
        if (response.ok) {
          const data = await response.json()
          setIsAdmin(data.isAdmin || false)
        }
      } catch (error) {
        console.error('Error checking admin status:', error)
      }
    }
    checkAdmin()

    // Check localStorage for collapsed state
    const savedState = localStorage.getItem('sidebarCollapsed')
    if (savedState === 'true') {
      setIsCollapsed(true)
    }
  }, [])

  const toggleSidebar = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('sidebarCollapsed', String(newState))
    // Dispatch custom event for content wrapper to listen
    window.dispatchEvent(new Event('sidebarToggle'))
  }

  // Add Admin items before Settings if user is admin
  const navigation = isAdmin
    ? [...baseNavigation.slice(0, -1), ...adminNavItems, baseNavigation[baseNavigation.length - 1]]
    : baseNavigation

  return (
    <div className={cn(
      "hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:flex-col transition-all duration-300",
      isCollapsed ? "lg:w-20" : "lg:w-64"
    )}>
      <div className="flex grow flex-col overflow-y-auto bg-gradient-to-b from-[#1A1D3B] to-[#0F1123] pb-4 pt-[70px] shadow-xl">
        {/* Logo Area - Hidden behind header */}
        <div className={cn(
          "flex h-[70px] shrink-0 items-center -mt-[70px] px-3",
          isCollapsed ? "justify-center" : "px-4"
        )}>
          <Link href="/dashboard" className="inline-block">
            {isCollapsed ? (
              <div className="w-10 h-10 bg-[#0069FF] rounded-lg flex items-center justify-center text-white font-bold text-lg">
                BD
              </div>
            ) : (
              <Image
                src="/assets/bdc-branco-01.avif"
                alt="BigDataCorp"
                width={160}
                height={23}
                className="h-[23px] w-auto"
                priority
              />
            )}
          </Link>
        </div>

        <nav className="flex flex-1 flex-col px-3 pt-6">
          <ul role="list" className="flex flex-1 flex-col gap-y-2">
            <li>
              <ul role="list" className="space-y-1.5">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                  const Icon = item.icon
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          isActive
                            ? 'bg-[#0069FF] text-white shadow-lg shadow-[#0069FF]/50'
                            : 'text-gray-300 hover:text-white hover:bg-white/10',
                          'group flex gap-x-3 rounded-lg text-[14px] font-medium transition-all duration-200',
                          isCollapsed ? 'justify-center px-3 py-3' : 'px-3 py-2.5'
                        )}
                        title={isCollapsed ? item.name : undefined}
                      >
                        <Icon
                          className={cn(
                            isActive ? 'text-white' : 'text-gray-400 group-hover:text-white',
                            'h-5 w-5 shrink-0'
                          )}
                          aria-hidden="true"
                        />
                        {!isCollapsed && <span>{item.name}</span>}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </li>
          </ul>
        </nav>

        {/* Footer section with branding and toggle button */}
        <div className="pt-4 border-t border-white/10 px-3">
          {isCollapsed ? (
            <div className="flex justify-center py-2">
              <button
                onClick={toggleSidebar}
                className={cn(
                  "flex items-center justify-center rounded-md w-8 h-8 transition-all duration-200",
                  "bg-[#0069FF]/10 hover:bg-[#0069FF]/20 border border-[#0069FF]/30",
                  "text-[#0069FF] hover:text-white hover:border-[#0069FF]"
                )}
                aria-label="Expand sidebar"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between py-2">
              <div className="text-xs text-gray-400">
                <p className="font-medium text-gray-300 mb-1">BigDataCorp</p>
                <p>API Management Platform</p>
              </div>
              <button
                onClick={toggleSidebar}
                className={cn(
                  "flex items-center justify-center rounded-md w-8 h-8 transition-all duration-200",
                  "bg-[#0069FF]/10 hover:bg-[#0069FF]/20 border border-[#0069FF]/30",
                  "text-[#0069FF] hover:text-white hover:border-[#0069FF]",
                  "shrink-0 ml-2"
                )}
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
