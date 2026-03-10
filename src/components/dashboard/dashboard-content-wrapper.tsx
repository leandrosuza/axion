'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export function DashboardContentWrapper({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    // Check localStorage for sidebar state
    const checkSidebarState = () => {
      const savedState = localStorage.getItem('sidebarCollapsed')
      setIsCollapsed(savedState === 'true')
    }

    checkSidebarState()

    // Listen for storage changes (when sidebar is toggled)
    window.addEventListener('storage', checkSidebarState)

    // Custom event listener for same-window updates
    const handleSidebarToggle = () => {
      checkSidebarState()
    }
    window.addEventListener('sidebarToggle', handleSidebarToggle)

    return () => {
      window.removeEventListener('storage', checkSidebarState)
      window.removeEventListener('sidebarToggle', handleSidebarToggle)
    }
  }, [])

  return (
    <div className={cn(
      "transition-all duration-300",
      isCollapsed ? "lg:pl-20" : "lg:pl-64"
    )}>
      <main className="pt-[94px] px-6 pb-6">{children}</main>
    </div>
  )
}
