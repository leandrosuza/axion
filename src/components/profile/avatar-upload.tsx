"use client"

import * as React from "react"
import { Upload, X } from "lucide-react"
import { UserAvatar } from "@/components/ui/user-avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

interface AvatarUploadProps {
  currentAvatarUrl?: string | null
  userName?: string | null
  userEmail?: string | null
  onAvatarChange: (file: File | null, previewUrl: string | null) => void
  className?: string
}

export function AvatarUpload({
  currentAvatarUrl,
  userName,
  userEmail,
  onAvatarChange,
  className,
}: AvatarUploadProps) {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(currentAvatarUrl || null)
  const [isDragging, setIsDragging] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Update preview URL when currentAvatarUrl prop changes
  React.useEffect(() => {
    setPreviewUrl(currentAvatarUrl || null)
  }, [currentAvatarUrl])

  const handleFileChange = (file: File | null) => {
    if (!file) {
      setPreviewUrl(currentAvatarUrl || null)
      onAvatarChange(null, null)
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG, GIF, etc.)",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    // Create preview URL
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    onAvatarChange(file, url)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    handleFileChange(file)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0] || null
    handleFileChange(file)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleRemove = () => {
    setPreviewUrl(null)
    onAvatarChange(null, null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div
        className={cn(
          "relative cursor-pointer transition-all",
          isDragging && "scale-105"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <UserAvatar
          name={userName}
          email={userEmail}
          avatarUrl={previewUrl}
          size="2xl"
          className={cn(
            "transition-all",
            isDragging && "ring-4 ring-primary ring-offset-2"
          )}
        />

        <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 hover:opacity-100 transition-opacity rounded-full">
          <Upload className="h-8 w-8 text-white" />
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 text-center">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
        />

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClick}
          >
            <Upload className="h-4 w-4 mr-2" />
            Choose Photo
          </Button>

          {previewUrl && previewUrl !== currentAvatarUrl && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemove}
            >
              <X className="h-4 w-4 mr-2" />
              Remove
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          JPG, PNG or GIF. Max 5MB.
        </p>
      </div>
    </div>
  )
}
