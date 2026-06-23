'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, CreditCard, Archive, Coffee, Calendar,
  Image, Bell, HelpCircle, Settings, Shield, BarChart3, MessageSquare,
  Globe, Menu, X, LogOut, ChevronRight, QrCode, UserCheck, Tag, ShoppingCart
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

const navItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/members', label: 'Members', icon: Users },
  { href: '/admin/plans', label: 'Membership Plans', icon: CreditCard },
  { href: '/admin/payments', label: 'Payments', icon: BarChart3 },
  { href: '/admin/lockers', label: 'Lockers', icon: Archive },
  { href: '/admin/cigars', label: 'Cigar List', icon: Coffee },
  { href: '/admin/events', label: 'Events', icon: Calendar },
  { href: '/admin/gallery', label: 'Gallery', icon: Image },
  { href: '/admin/notifications', label: 'Notifications', icon: Bell },
  { href: '/admin/support', label: 'Support Requests', icon: HelpCircle },
  { href: '/admin/content', label: 'Website Content', icon: Globe },
  { href: '/admin/messages', label: 'Contact Messages', icon: MessageSquare },
  { href: '/admin/checkins', label: 'Check-Ins', icon: UserCheck },
  { href: '/admin/qr-codes', label: 'QR Codes', icon: QrCode },
  { href: '/admin/deals', label: 'Member Deals', icon: Tag },
  { href: '/admin/pos', label: 'POS Integration', icon: ShoppingCart },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
  { href: '/admin/admins', label: 'Admin Users', icon: Shield },
]

export default function AdminLayout({ children, profile }: { children: React.ReactNode; profile: Profile }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-charcoal-800">
        <Link href="/" className="block">
          <p className="text-gold-500 font-serif text-base font-bold tracking-widest">CIGAR CITY LOUNGE</p>
          <p className="text-red-400 text-xs tracking-widest mt-1">ADMIN PANEL</p>
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                active
                  ? 'bg-gold-500/10 text-gold-500 border border-gold-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-charcoal-800'
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="p-3 border-t border-charcoal-800">
        <div className="px-3 py-2 mb-2">
          <p className="text-gray-300 text-sm font-medium">{profile.first_name} {profile.last_name}</p>
          <p className="text-gold-500 text-xs">{profile.role?.replace('_', ' ').toUpperCase()}</p>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-900/20 w-full transition-colors">
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-charcoal-950 flex">
      <div className="hidden lg:flex lg:w-60 lg:flex-col lg:fixed lg:inset-y-0 bg-charcoal-900 border-r border-charcoal-800">
        <Sidebar />
      </div>
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-charcoal-900 border-r border-charcoal-800">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
              <X size={24} />
            </button>
            <Sidebar />
          </div>
        </div>
      )}
      <div className="lg:ml-60 flex-1 flex flex-col min-h-screen">
        <header className="lg:hidden bg-charcoal-900 border-b border-charcoal-800 px-4 py-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-400 hover:text-white">
            <Menu size={24} />
          </button>
          <p className="text-gold-500 font-serif text-sm font-bold tracking-widest">ADMIN</p>
          <div className="w-8" />
        </header>
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
