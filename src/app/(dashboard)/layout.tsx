import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardLandingHeader } from '@/components/dashboard/dashboard-landing-header'
import { DashboardNav } from '@/components/dashboard/dashboard-nav'
import { DashboardContentWrapper } from '@/components/dashboard/dashboard-content-wrapper'
import { prisma } from '@/lib/prisma'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user name and avatar from database
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      full_name: true,
      avatar_url: true
    },
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0C1B] via-[#0F1123] to-[#1A1D3B]">
      <DashboardLandingHeader
        userName={dbUser?.full_name}
        userEmail={user.email}
        userAvatar={dbUser?.avatar_url}
      />
      <DashboardNav />
      <DashboardContentWrapper>
        {children}
      </DashboardContentWrapper>
    </div>
  )
}
