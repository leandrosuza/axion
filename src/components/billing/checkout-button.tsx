'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface CheckoutButtonProps {
  packageId: string  // starter, basic, pro, enterprise
  children: React.ReactNode
  variant?: 'default' | 'outline'
  className?: string
  disabled?: boolean
}

export function CheckoutButton({
  packageId,
  children,
  variant = 'default',
  className = '',
  disabled = false,
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleCheckout = async () => {
    try {
      setLoading(true)

      const response = await fetch('/api/credits/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId: packageId.toLowerCase(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error: any) {
      console.error('Checkout error:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to start checkout process',
        variant: 'destructive',
      })
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleCheckout}
      disabled={disabled || loading}
      variant={variant}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        children
      )}
    </Button>
  )
}
