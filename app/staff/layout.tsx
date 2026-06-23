import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, first_name, last_name')
    .eq('user_id', user.id)
    .single()

  if (!profile || !['admin', 'super_admin', 'staff'].includes(profile.role)) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-charcoal-950">
      <header className="bg-charcoal-900 border-b border-charcoal-800 px-4 py-4 flex items-center justify-between">
        <div>
          <p className="text-gold-500 font-serif text-xl font-bold tracking-widest">CIGAR CITY LOUNGE</p>
          <p className="text-charcoal-400 text-xs tracking-[0.2em]">STAFF PORTAL</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">{profile.first_name} {profile.last_name}</span>
          <Link href="/admin" className="text-gold-500 hover:text-gold-400 text-sm">Admin</Link>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
