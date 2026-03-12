import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'dark'
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = 'default', ...props }, ref) => {
    const baseStyles = "flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0069FF] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"

    const variantStyles = {
      default: "border-gray-300 bg-white text-gray-900 placeholder:text-gray-500",
      dark: "border-white/10 bg-white/5 text-white placeholder:text-gray-400"
    }

    return (
      <input
        type={type}
        className={cn(
          baseStyles,
          variantStyles[variant],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
