/**
 * Avatar utility functions for consistent user avatars
 */

// Predefined gradient colors for avatars
const AVATAR_GRADIENTS = [
  'from-blue-500 to-purple-600',
  'from-purple-500 to-pink-600',
  'from-pink-500 to-rose-600',
  'from-rose-500 to-orange-600',
  'from-orange-500 to-amber-600',
  'from-amber-500 to-yellow-600',
  'from-yellow-500 to-lime-600',
  'from-lime-500 to-green-600',
  'from-green-500 to-emerald-600',
  'from-emerald-500 to-teal-600',
  'from-teal-500 to-cyan-600',
  'from-cyan-500 to-sky-600',
  'from-sky-500 to-blue-600',
  'from-indigo-500 to-violet-600',
  'from-violet-500 to-purple-600',
]

/**
 * Generate consistent gradient class based on string (email or name)
 */
export function getAvatarGradient(str: string): string {
  if (!str) return AVATAR_GRADIENTS[0]

  // Generate consistent hash from string
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }

  // Use hash to pick gradient
  const index = Math.abs(hash) % AVATAR_GRADIENTS.length
  return AVATAR_GRADIENTS[index]
}

/**
 * Get initials from name or email
 */
export function getInitials(name?: string | null, email?: string | null): string {
  if (name && name.trim()) {
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return parts[0].substring(0, 2).toUpperCase()
  }

  if (email) {
    return email.substring(0, 2).toUpperCase()
  }

  return 'U'
}

/**
 * Generate avatar background color (HSL format)
 */
export function getAvatarColor(str: string): string {
  if (!str) return 'hsl(217, 91%, 60%)'

  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }

  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 70%, 50%)`
}
