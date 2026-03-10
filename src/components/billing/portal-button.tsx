'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface PortalButtonProps {
  children: React.ReactNode
  variant?: 'default' | 'outline'
  className?: string
}

export function PortalButton({
  children,
  variant = 'outline',
  className = '',
}: PortalButtonProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handlePortal = async () => {
    try {
      setLoading(true)

      const response = await fetch('/api/subscriptions/portal', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to open billing portal')
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error: any) {
      console.error('Portal error:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to open billing portal',
        variant: 'destructive',
      })
      setLoading(false)
    }
  }

  return (
    <Button onClick={handlePortal} disabled={loading} variant={variant} className={className}>
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        children
      )}
    </Button>
  )
}
