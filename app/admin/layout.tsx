import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminLayout from '@/components/layout/AdminLayout'

const ADMIN_ROLES = ['admin', 'super_admin', 'staff', 'membership_manager', 'locker_manager', 'event_manager', 'content_manager']

export default async function Layout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!profile || !ADMIN_ROLES.includes(profile.role)) {
    redirect('/')
  }

  return <AdminLayout profile={profile}>{children}</AdminLayout>
}
