import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, User, AlertCircle } from 'lucide-react'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function UserDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if current user is admin
  const currentUserProfile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  })

  if (currentUserProfile?.role !== 'admin') {
    redirect('/dashboard')
  }

  // Fetch target user details
  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      full_name: true,
      phone: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  if (!targetUser) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/admin">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
        </div>
        <Card className="bg-white/5 border-white/10 backdrop-blur">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-500">
              <AlertCircle className="h-5 w-5" />
              <p>User not found</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/admin">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <User className="h-8 w-8" />
              User Details
            </h1>
            <p className="text-gray-400">{targetUser.email}</p>
          </div>
        </div>
      </div>

      <Card className="bg-white/5 border-white/10 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">Profile Information</CardTitle>
          <CardDescription className="text-gray-400">
            Basic user information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400">Full Name</p>
              <p className="text-white">{targetUser.full_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Email</p>
              <p className="text-white">{targetUser.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Phone</p>
              <p className="text-white">{targetUser.phone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Role</p>
              <p className="text-white capitalize">{targetUser.role}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Status</p>
              <p className="text-white capitalize">{targetUser.status}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Member Since</p>
              <p className="text-white">{new Date(targetUser.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/5 border-white/10 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Additional Features
          </CardTitle>
          <CardDescription className="text-gray-400">
            Extended user management features coming soon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300">
            Additional user management features (API keys, usage stats, subscription details) will be added based on the database schema.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
