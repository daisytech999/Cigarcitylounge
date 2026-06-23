'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, CreditCard, Archive, Calendar, Heart, Bell, HelpCircle, Menu, X, LogOut, Home, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: Home },
  { href: '/dashboard/membership', label: 'Membership', icon: CreditCard },
  { href: '/dashboard/locker', label: 'My Locker', icon: Archive },
  { href: '/dashboard/events', label: 'Events', icon: Calendar },
  { href: '/dashboard/preferences', label: 'Cigar Preferences', icon: Heart },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { href: '/dashboard/support', label: 'Support', icon: HelpCircle },
]

export default function DashboardLayout({ children, profile }: { children: React.ReactNode; profile: Profile }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-charcoal-800">
        <Link href="/"><p className="text-gold-500 font-serif text-lg font-bold tracking-widest">CIGAR CITY</p><p className="text-gray-500 text-xs tracking-[0.3em]">LOUNGE</p></Link>
      </div>
      <div className="p-4 border-b border-charcoal-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gold-500/20 border border-gold-500/30 rounded-full flex items-center justify-center"><User size={20} className="text-gold-500" /></div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium truncate">{profile.first_name} {profile.last_name}</p>
            <p className="text-charcoal-400 text-xs truncate">{profile.member_id}</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon
          const active = pathname === item.href
          return (
            <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
              className={cn('flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all',
                active ? 'bg-gold-500/10 text-gold-500 border border-gold-500/20' : 'text-gray-400 hover:text-white hover:bg-charcoal-800'
              )}>
              <Icon size={20} />{item.label}
              {active && <ChevronRight size={16} className="ml-auto" />}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-charcoal-800">
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-red-400 hover:bg-red-900/20 w-full transition-colors">
          <LogOut size={20} />Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-charcoal-950 flex">
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-charcoal-900 border-r border-charcoal-800"><Sidebar /></div>
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-charcoal-900 border-r border-charcoal-800">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-white" onClick={() => setSidebarOpen(false)}><X size={24} /></button>
            <Sidebar />
          </div>
        </div>
      )}
      <div className="lg:ml-64 flex-1 flex flex-col min-h-screen">
        <header className="lg:hidden bg-charcoal-900 border-b border-charcoal-800 px-4 py-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-400 hover:text-white"><Menu size={24} /></button>
          <p className="text-gold-500 font-serif text-sm font-bold tracking-widest">CIGAR CITY LOUNGE</p>
          <div className="w-8" />
        </header>
        <main className="flex-1 p-4 lg:p-8 max-w-6xl w-full mx-auto">{children}</main>
      </div>
    </div>
  )
}
