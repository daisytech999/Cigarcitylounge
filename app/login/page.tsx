'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, LogIn, Phone, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      setError('Invalid email or password. Please try again.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-charcoal-950 flex flex-col">
      {/* Header */}
      <div className="p-6">
        <Link href="/" className="inline-block">
          <p className="text-gold-500 font-serif text-xl font-bold tracking-widest">CIGAR CITY LOUNGE</p>
        </Link>
      </div>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo/branding area */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-serif text-gold-500 mb-2">Member Login</h1>
            <div className="w-16 h-px bg-gold-500 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Sign in to your member account</p>
          </div>

          <div className="bg-charcoal-900 border border-charcoal-700 rounded-2xl p-8 shadow-2xl">
            {error && (
              <div className="bg-red-900/20 border border-red-500/30 text-red-300 rounded-lg p-4 mb-6 flex gap-3 items-start">
                <span className="text-red-400 text-xl shrink-0">⚠</span>
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-base font-medium text-gray-300 mb-2">
                  Email Address <span className="text-gold-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-charcoal-950 border border-charcoal-700 text-white placeholder-charcoal-400 rounded-lg px-4 py-4 text-lg focus:outline-none focus:border-gold-500 transition-colors"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-base font-medium text-gray-300">
                    Password <span className="text-gold-500">*</span>
                  </label>
                  <Link href="/reset-password" className="text-gold-500 hover:text-gold-400 text-sm transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Your password"
                    className="w-full bg-charcoal-950 border border-charcoal-700 text-white placeholder-charcoal-400 rounded-lg px-4 py-4 text-lg focus:outline-none focus:border-gold-500 transition-colors pr-14"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-white transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gold-500 hover:bg-gold-600 disabled:opacity-50 text-black font-bold py-4 px-6 rounded-lg text-xl transition-colors flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <span className="animate-spin w-5 h-5 border-2 border-black/30 border-t-black rounded-full" />
                    Signing In...
                  </>
                ) : (
                  <>
                    <LogIn size={22} />
                    Sign In
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400 text-base">
                Not a member yet?{' '}
                <Link href="/membership" className="text-gold-500 hover:text-gold-400 font-medium transition-colors">
                  View Membership Plans
                </Link>
              </p>
            </div>
          </div>

          {/* Help section */}
          <div className="mt-8 bg-charcoal-900 border border-charcoal-800 rounded-xl p-6 text-center">
            <p className="text-white font-medium text-lg mb-2">Need Help Signing In?</p>
            <p className="text-gray-400 text-base mb-4">Our team is happy to assist you.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="tel:ADD_PHONE" className="flex items-center gap-2 justify-center text-gold-500 hover:text-gold-400 text-base transition-colors">
                <Phone size={18} />
                [ADD PHONE NUMBER]
              </a>
              <a href="mailto:ADD_EMAIL" className="flex items-center gap-2 justify-center text-gold-500 hover:text-gold-400 text-base transition-colors">
                <Mail size={18} />
                [ADD BUSINESS EMAIL]
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
