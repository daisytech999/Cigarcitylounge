'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, LogOut, User, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).single()
        setProfile(data)
      }
      setLoading(false)
    }
    getProfile()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => getProfile())
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setProfile(null)
    window.location.href = '/'
  }

  const publicLinks = [
    { href: '/', label: 'Home' },
    { href: '/membership', label: 'Membership' },
    { href: '/cigars', label: 'Cigar List' },
    { href: '/events', label: 'Events' },
    { href: '/contact', label: 'Contact' },
  ]

  return (
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled ? 'bg-charcoal-950/98 backdrop-blur-sm shadow-xl border-b border-charcoal-800' : 'bg-transparent'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex flex-col">
            <span className="text-gold-500 font-serif text-xl font-bold tracking-widest leading-tight">CIGAR CITY</span>
            <span className="text-gray-400 text-xs tracking-[0.3em] uppercase">Lounge</span>
          </Link>
          <div className="hidden lg:flex items-center gap-8">
            {publicLinks.map(link => (
              <Link key={link.href} href={link.href} className={cn('text-base font-medium transition-colors hover:text-gold-500', pathname === link.href ? 'text-gold-500' : 'text-gray-300')}>
                {link.label}
              </Link>
            ))}
          </div>
          <div className="hidden lg:flex items-center gap-3">
            {!loading && (
              profile ? (
                <div className="flex items-center gap-3">
                  {(profile.role === 'admin' || profile.role === 'super_admin') && (
                    <Link href="/admin" className="flex items-center gap-2 text-gold-500 hover:text-gold-400 text-sm font-medium">
                      <Shield size={16} />Admin
                    </Link>
                  )}
                  <Link href="/dashboard" className="flex items-center gap-2 text-gray-300 hover:text-gold-500 text-sm font-medium transition-colors">
                    <User size={16} />My Profile
                  </Link>
                  <button onClick={handleLogout} className="flex items-center gap-2 text-gray-400 hover:text-red-400 text-sm font-medium transition-colors">
                    <LogOut size={16} />Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href="/login" className="text-gray-300 hover:text-gold-500 text-sm font-medium transition-colors">Login</Link>
                  <Link href="/membership" className="bg-gold-500 hover:bg-gold-600 text-black font-bold py-2 px-5 rounded text-sm transition-colors">Join Now</Link>
                </div>
              )
            )}
          </div>
          <button className="lg:hidden text-gray-300 hover:text-gold-500 transition-colors p-2" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>
      {isOpen && (
        <div className="lg:hidden bg-charcoal-950 border-t border-charcoal-800">
          <div className="px-4 py-6 space-y-4">
            {publicLinks.map(link => (
              <Link key={link.href} href={link.href} className={cn('block text-xl py-3 font-medium border-b border-charcoal-800', pathname === link.href ? 'text-gold-500' : 'text-gray-300 hover:text-gold-500')} onClick={() => setIsOpen(false)}>
                {link.label}
              </Link>
            ))}
            <div className="pt-4 space-y-3">
              {profile ? (
                <>
                  <Link href="/dashboard" className="flex items-center gap-2 text-gray-300 text-xl py-3 font-medium" onClick={() => setIsOpen(false)}><User size={20} />My Profile</Link>
                  <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 text-xl py-3 font-medium w-full"><LogOut size={20} />Logout</button>
                </>
              ) : (
                <>
                  <Link href="/login" className="block text-xl py-3 font-medium text-gray-300" onClick={() => setIsOpen(false)}>Login</Link>
                  <Link href="/membership" className="block bg-gold-500 text-black font-bold py-4 px-6 rounded text-center text-xl" onClick={() => setIsOpen(false)}>Become a Member</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
