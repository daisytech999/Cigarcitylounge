'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError('Failed to update password. Please try again or request a new reset link.')
    } else {
      setDone(true)
      setTimeout(() => router.push('/login'), 3000)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-charcoal-950 flex flex-col">
      <div className="p-6">
        <Link href="/" className="inline-block">
          <p className="text-gold-500 font-serif text-xl font-bold tracking-widest">CIGAR CITY LOUNGE</p>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-serif text-gold-500 mb-2">New Password</h1>
            <div className="w-16 h-px bg-gold-500 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Choose a strong new password</p>
          </div>

          <div className="bg-charcoal-900 border border-charcoal-700 rounded-2xl p-8 shadow-2xl">
            {done ? (
              <div className="text-center py-4">
                <CheckCircle size={56} className="text-green-400 mx-auto mb-4" />
                <h2 className="text-2xl font-serif text-white mb-3">Password Updated!</h2>
                <p className="text-gray-400 text-base">Redirecting you to login...</p>
              </div>
            ) : (
              <>
                {error && (
                  <div className="bg-red-900/20 border border-red-500/30 text-red-300 rounded-lg p-4 mb-6">
                    {error}
                  </div>
                )}
                <form onSubmit={handleUpdate} className="space-y-6">
                  <div>
                    <label className="block text-base font-medium text-gray-300 mb-2">
                      New Password <span className="text-gold-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={8}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        className="w-full bg-charcoal-950 border border-charcoal-700 text-white placeholder-charcoal-400 rounded-lg px-4 py-4 text-lg focus:outline-none focus:border-gold-500 transition-colors pr-14"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-white">
                        {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-300 mb-2">
                      Confirm Password <span className="text-gold-500">*</span>
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      placeholder="Repeat your password"
                      className="w-full bg-charcoal-950 border border-charcoal-700 text-white placeholder-charcoal-400 rounded-lg px-4 py-4 text-lg focus:outline-none focus:border-gold-500 transition-colors"
                    />
                  </div>
                  <button type="submit" disabled={loading} className="w-full bg-gold-500 hover:bg-gold-600 disabled:opacity-50 text-black font-bold py-4 px-6 rounded-lg text-xl transition-colors">
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
