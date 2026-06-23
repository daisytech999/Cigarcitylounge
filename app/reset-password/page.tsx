'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    })

    if (resetError) {
      setError('Failed to send reset email. Please check your email address and try again.')
    } else {
      setSent(true)
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
          <Link href="/login" className="inline-flex items-center gap-2 text-gold-500 hover:text-gold-400 mb-8 text-base transition-colors">
            <ArrowLeft size={18} />
            Back to Login
          </Link>

          <div className="text-center mb-10">
            <h1 className="text-4xl font-serif text-gold-500 mb-2">Reset Password</h1>
            <div className="w-16 h-px bg-gold-500 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Enter your email to receive a password reset link</p>
          </div>

          <div className="bg-charcoal-900 border border-charcoal-700 rounded-2xl p-8 shadow-2xl">
            {sent ? (
              <div className="text-center py-4">
                <CheckCircle size={56} className="text-green-400 mx-auto mb-4" />
                <h2 className="text-2xl font-serif text-white mb-3">Email Sent!</h2>
                <p className="text-gray-300 text-base mb-2">
                  We've sent a password reset link to:
                </p>
                <p className="text-gold-500 font-medium text-lg mb-6">{email}</p>
                <p className="text-gray-400 text-base mb-8">
                  Please check your email and click the link to reset your password. 
                  The link expires in 1 hour.
                </p>
                <p className="text-gray-500 text-sm">
                  Didn't receive it? Check your spam folder or{' '}
                  <button onClick={() => setSent(false)} className="text-gold-500 hover:text-gold-400">
                    try again
                  </button>
                </p>
              </div>
            ) : (
              <>
                {error && (
                  <div className="bg-red-900/20 border border-red-500/30 text-red-300 rounded-lg p-4 mb-6">
                    {error}
                  </div>
                )}
                <form onSubmit={handleReset} className="space-y-6">
                  <div>
                    <label className="block text-base font-medium text-gray-300 mb-2">
                      Email Address <span className="text-gold-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-400" size={20} />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full bg-charcoal-950 border border-charcoal-700 text-white placeholder-charcoal-400 rounded-lg pl-12 pr-4 py-4 text-lg focus:outline-none focus:border-gold-500 transition-colors"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gold-500 hover:bg-gold-600 disabled:opacity-50 text-black font-bold py-4 px-6 rounded-lg text-xl transition-colors"
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </form>
              </>
            )}
          </div>

          <div className="mt-8 bg-charcoal-900 border border-charcoal-800 rounded-xl p-6 text-center">
            <p className="text-white font-medium text-lg mb-2">Still Having Trouble?</p>
            <p className="text-gray-400 mb-4">Call us and we'll help you access your account.</p>
            <a href="tel:ADD_PHONE" className="btn-gold w-full flex items-center justify-center gap-2">
              Call for Help
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
