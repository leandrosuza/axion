'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { saveSession, clearSession } from '@/lib/utils/session'

/**
 * Component to sync Supabase session with localStorage
 * This ensures that if a user is logged in via Supabase but doesn't have localStorage session,
 * we sync it automatically
 */
export function SessionSync() {
  useEffect(() => {
    const supabase = createClient()

    // Check current Supabase session
    const syncSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        // User is logged in with Supabase, sync to localStorage
        saveSession({
          userId: session.user.id,
          email: session.user.email || '',
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
          expiresAt: new Date(session.expires_at || 0).getTime(),
        })
      }
    }

    syncSession()

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        saveSession({
          userId: session.user.id,
          email: session.user.email || '',
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
          expiresAt: new Date(session.expires_at || 0).getTime(),
        })
      } else if (event === 'SIGNED_OUT') {
        clearSession()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return null
}
