import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardLandingHeader } from '@/components/dashboard/dashboard-landing-header'
import { DashboardNav } from '@/components/dashboard/dashboard-nav'
import { DashboardContentWrapper } from '@/components/dashboard/dashboard-content-wrapper'
<<<<<<< HEAD
=======
import { prisma } from '@/lib/prisma'
>>>>>>> upstream/master

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

<<<<<<< HEAD
  // Fetch user profile from Supabase
  const { data: profile } = await supabase
    .from('users')
    .select('name, avatar_url')
    .eq('id', user.id)
    .single()
=======
  // Fetch user name and avatar from database
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      full_name: true,
      avatar_url: true
    },
  })
>>>>>>> upstream/master

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0C1B] via-[#0F1123] to-[#1A1D3B]">
      <DashboardLandingHeader
<<<<<<< HEAD
        userName={profile?.name}
        userEmail={user.email}
        userAvatar={profile?.avatar_url}
=======
        userName={dbUser?.full_name}
        userEmail={user.email}
        userAvatar={dbUser?.avatar_url}
>>>>>>> upstream/master
      />
      <DashboardNav />
      <DashboardContentWrapper>
        {children}
      </DashboardContentWrapper>
    </div>
  )
}
