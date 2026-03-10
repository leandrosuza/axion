"use client"

import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface UserAvatarProps {
  name?: string | null
  email?: string | null
  avatarUrl?: string | null
  size?: "sm" | "md" | "lg" | "xl" | "2xl"
  className?: string
  showBadge?: boolean
  badgeColor?: string
}

// Generate consistent initials from name or email
function getInitials(name?: string | null, email?: string | null): string {
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

// Generate consistent gradient based on string
function getGradientClass(str?: string | null): string {
  const gradients = [
    'from-blue-500 to-purple-600',
    'from-purple-500 to-pink-600',
    'from-pink-500 to-rose-600',
    'from-rose-500 to-orange-600',
    'from-orange-500 to-amber-600',
    'from-green-500 to-emerald-600',
    'from-teal-500 to-cyan-600',
    'from-cyan-500 to-sky-600',
    'from-indigo-500 to-violet-600',
  ]

  if (!str) return gradients[0]

  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }

  const index = Math.abs(hash) % gradients.length
  return gradients[index]
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
  "2xl": "h-24 w-24 text-2xl",
}

const badgeSizes = {
  sm: "h-2 w-2",
  md: "h-2.5 w-2.5",
  lg: "h-3 w-3",
  xl: "h-4 w-4",
  "2xl": "h-5 w-5",
}

export function UserAvatar({
  name,
  email,
  avatarUrl,
  size = "md",
  className,
  showBadge = false,
  badgeColor = "bg-green-500",
}: UserAvatarProps) {
  const initials = getInitials(name, email)
  const gradientClass = getGradientClass(name || email)

  return (
    <div className="relative inline-block">
      <Avatar className={cn(sizeClasses[size], className)}>
        {avatarUrl && (
          <AvatarImage
            src={avatarUrl}
            alt={name || email || "User avatar"}
          />
        )}
        <AvatarFallback
          className={cn(
            "bg-gradient-to-br",
            gradientClass,
            "text-white font-semibold"
          )}
        >
          {initials}
        </AvatarFallback>
      </Avatar>

      {showBadge && (
        <span
          className={cn(
            "absolute bottom-0 right-0 block rounded-full ring-2 ring-white",
            badgeColor,
            badgeSizes[size]
          )}
          aria-label="Online status"
        />
      )}
    </div>
  )
}
