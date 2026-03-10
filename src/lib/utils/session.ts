/**
 * Session persistence utilities for localStorage
 */

const SESSION_KEY = 'bdc_session'
const SESSION_EXPIRY_KEY = 'bdc_session_expiry'
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds

export interface SessionData {
  userId: string
  email: string
  accessToken: string
  refreshToken: string
  expiresAt: number
}

/**
 * Save session to localStorage
 */
export function saveSession(session: SessionData): void {
  if (typeof window === 'undefined') return

  try {
    const expiryTime = Date.now() + SESSION_DURATION
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    localStorage.setItem(SESSION_EXPIRY_KEY, expiryTime.toString())
  } catch (error) {
    console.error('Failed to save session:', error)
  }
}

/**
 * Get session from localStorage
 */
export function getSession(): SessionData | null {
  if (typeof window === 'undefined') return null

  try {
    const sessionData = localStorage.getItem(SESSION_KEY)
    const expiryTime = localStorage.getItem(SESSION_EXPIRY_KEY)

    if (!sessionData || !expiryTime) return null

    // Check if session is expired
    if (Date.now() > parseInt(expiryTime, 10)) {
      clearSession()
      return null
    }

    return JSON.parse(sessionData)
  } catch (error) {
    console.error('Failed to get session:', error)
    return null
  }
}

/**
 * Clear session from localStorage
 */
export function clearSession(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(SESSION_EXPIRY_KEY)
  } catch (error) {
    console.error('Failed to clear session:', error)
  }
}

/**
 * Check if session exists and is valid
 */
export function hasValidSession(): boolean {
  return getSession() !== null
}

/**
 * Update session expiry (extend session)
 */
export function extendSession(): void {
  const session = getSession()
  if (session) {
    saveSession(session)
  }
}
