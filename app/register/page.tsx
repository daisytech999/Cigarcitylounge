'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, ChevronRight, ChevronLeft, Eye, EyeOff, Phone, Mail, AlertCircle } from 'lucide-react'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const token = searchParams.get('token')

  const [step, setStep] = useState(1)
  const totalSteps = 4

  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '',
    firstName: '', lastName: '', phone: '', dateOfBirth: '',
    address: '', city: '', state: '', zipCode: '',
    emergencyContactName: '', emergencyContactPhone: '',
    membershipAccepted: false, rulesAccepted: false, ageVerified: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [validating, setValidating] = useState(true)
  const [valid, setValid] = useState(false)

  useEffect(() => {
    async function validate() {
      if (!sessionId && !token) {
        setValid(false)
        setValidating(false)
        return
      }
      setValid(true)
      setValidating(false)
    }
    validate()
  }, [sessionId, token])

  const update = (field: string, value: any) => setForm(f => ({ ...f, [field]: value }))

  const handleSubmit = async () => {
    setError('')

    if (!form.membershipAccepted || !form.rulesAccepted || !form.ageVerified) {
      setError('Please accept all agreements before completing registration.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, sessionId, token }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setDone(true)
      setTimeout(() => router.push('/login'), 3000)
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please contact support.')
    }
    setLoading(false)
  }

  if (validating) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-10 h-10 border-2 border-charcoal-700 border-t-gold-500 rounded-full" />
      </div>
    )
  }

  if (!valid) {
    return (
      <div className="text-center py-10">
        <AlertCircle size={56} className="text-red-400 mx-auto mb-4" />
        <h2 className="text-2xl font-serif text-white mb-3">Invalid Registration Link</h2>
        <p className="text-gray-400 text-lg mb-6">
          This registration link is invalid or has expired. 
          Please complete a membership purchase first or contact support.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/membership" className="btn-gold">View Membership Plans</Link>
          <Link href="/contact" className="btn-outline-gold">Contact Support</Link>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="text-center py-10">
        <CheckCircle size={72} className="text-green-400 mx-auto mb-6" />
        <h2 className="text-3xl font-serif text-white mb-3">Welcome to Cigar City Lounge!</h2>
        <p className="text-gray-300 text-xl mb-2">Your account has been created successfully.</p>
        <p className="text-gray-400 text-base mb-8">Redirecting you to login...</p>
      </div>
    )
  }

  const inputClass = "w-full bg-charcoal-950 border border-charcoal-700 text-white placeholder-charcoal-400 rounded-lg px-4 py-4 text-lg focus:outline-none focus:border-gold-500 transition-colors"

  return (
    <div>
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          {['Account', 'Personal Info', 'Address & Emergency', 'Agreements'].map((label, i) => (
            <div key={i} className="flex flex-col items-center flex-1">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold mb-1 transition-all ${
                i + 1 < step ? 'bg-green-500 text-white' : i + 1 === step ? 'bg-gold-500 text-black' : 'bg-charcoal-700 text-charcoal-400'
              }`}>
                {i + 1 < step ? '✓' : i + 1}
              </div>
              <span className={`text-xs hidden sm:block ${i + 1 === step ? 'text-gold-500' : 'text-charcoal-400'}`}>{label}</span>
            </div>
          ))}
        </div>
        <div className="w-full bg-charcoal-800 rounded-full h-2">
          <div className="bg-gold-500 h-2 rounded-full transition-all" style={{ width: `${(step / totalSteps) * 100}%` }} />
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/30 text-red-300 rounded-lg p-4 mb-6 flex gap-3">
          <AlertCircle size={20} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Step 1: Account */}
      {step === 1 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-serif text-gold-500 mb-6">Create Your Account</h2>
          <div>
            <label className="block text-base font-medium text-gray-300 mb-2">Email Address <span className="text-gold-500">*</span></label>
            <input type="email" required value={form.email} onChange={e => update('email', e.target.value)} placeholder="your@email.com" className={inputClass} />
          </div>
          <div>
            <label className="block text-base font-medium text-gray-300 mb-2">Password <span className="text-gold-500">*</span></label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} required minLength={8} value={form.password} onChange={e => update('password', e.target.value)} placeholder="At least 8 characters" className={`${inputClass} pr-14`} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-white">
                {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-base font-medium text-gray-300 mb-2">Confirm Password <span className="text-gold-500">*</span></label>
            <input type={showPassword ? 'text' : 'password'} required value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} placeholder="Repeat your password" className={inputClass} />
          </div>
        </div>
      )}

      {/* Step 2: Personal Info */}
      {step === 2 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-serif text-gold-500 mb-6">Personal Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-base font-medium text-gray-300 mb-2">First Name <span className="text-gold-500">*</span></label>
              <input type="text" required value={form.firstName} onChange={e => update('firstName', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-base font-medium text-gray-300 mb-2">Last Name <span className="text-gold-500">*</span></label>
              <input type="text" required value={form.lastName} onChange={e => update('lastName', e.target.value)} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-base font-medium text-gray-300 mb-2">Phone Number <span className="text-gold-500">*</span></label>
            <input type="tel" required value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="(555) 000-0000" className={inputClass} />
          </div>
          <div>
            <label className="block text-base font-medium text-gray-300 mb-2">Date of Birth <span className="text-gold-500">*</span> <span className="text-charcoal-400 text-sm">(Must be 21+)</span></label>
            <input type="date" required value={form.dateOfBirth} onChange={e => update('dateOfBirth', e.target.value)} className={inputClass} />
          </div>
        </div>
      )}

      {/* Step 3: Address & Emergency */}
      {step === 3 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-serif text-gold-500 mb-6">Address & Emergency Contact</h2>
          <div>
            <label className="block text-base font-medium text-gray-300 mb-2">Street Address</label>
            <input type="text" value={form.address} onChange={e => update('address', e.target.value)} className={inputClass} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className="block text-base font-medium text-gray-300 mb-2">City</label>
              <input type="text" value={form.city} onChange={e => update('city', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-base font-medium text-gray-300 mb-2">State</label>
              <input type="text" maxLength={2} value={form.state} onChange={e => update('state', e.target.value)} placeholder="FL" className={inputClass} />
            </div>
            <div>
              <label className="block text-base font-medium text-gray-300 mb-2">ZIP Code</label>
              <input type="text" value={form.zipCode} onChange={e => update('zipCode', e.target.value)} className={inputClass} />
            </div>
          </div>
          
          <div className="border-t border-charcoal-700 pt-6">
            <h3 className="text-xl font-serif text-gold-400 mb-4">Emergency Contact</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-base font-medium text-gray-300 mb-2">Emergency Contact Name <span className="text-gold-500">*</span></label>
                <input type="text" required value={form.emergencyContactName} onChange={e => update('emergencyContactName', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-base font-medium text-gray-300 mb-2">Emergency Contact Phone <span className="text-gold-500">*</span></label>
                <input type="tel" required value={form.emergencyContactPhone} onChange={e => update('emergencyContactPhone', e.target.value)} placeholder="(555) 000-0000" className={inputClass} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Agreements */}
      {step === 4 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-serif text-gold-500 mb-6">Agreements & Confirmation</h2>
          <p className="text-gray-400 text-base">Please read and accept the following agreements to complete your registration.</p>

          {[
            {
              key: 'ageVerified',
              title: 'Age Verification',
              text: 'I confirm that I am 21 years of age or older and meet the legal age requirement for entering a cigar lounge in my location. I agree to show valid identification upon request.',
            },
            {
              key: 'membershipAccepted',
              title: 'Membership Agreement',
              text: 'I have read and agree to the Membership Terms. I understand that membership is billed monthly/annually, that lockers are assigned by staff, and that membership may be cancelled at any time.',
            },
            {
              key: 'rulesAccepted',
              title: 'Lounge Rules',
              text: 'I agree to follow all Cigar City Lounge rules including respectful behavior toward staff and fellow members, proper handling of lounge equipment, and compliance with any dress code requirements for events.',
            },
          ].map(agreement => (
            <label key={agreement.key} className="flex items-start gap-4 cursor-pointer bg-charcoal-950 border border-charcoal-700 hover:border-gold-500/50 rounded-xl p-5 transition-colors">
              <input
                type="checkbox"
                checked={(form as any)[agreement.key]}
                onChange={e => update(agreement.key, e.target.checked)}
                className="mt-1 w-6 h-6 accent-gold-500 cursor-pointer shrink-0"
              />
              <div>
                <p className="text-white font-semibold text-base mb-1">{agreement.title}</p>
                <p className="text-gray-400 text-base leading-relaxed">{agreement.text}</p>
              </div>
            </label>
          ))}
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-4 mt-10">
        {step > 1 && (
          <button onClick={() => setStep(s => s - 1)} className="flex-1 border-2 border-charcoal-600 text-gray-300 hover:border-gold-500 hover:text-gold-500 font-bold py-4 px-6 rounded-lg text-lg transition-all flex items-center justify-center gap-2">
            <ChevronLeft size={20} />
            Back
          </button>
        )}
        {step < totalSteps ? (
          <button
            onClick={() => {
              setError('')
              setStep(s => s + 1)
            }}
            className="flex-1 bg-gold-500 hover:bg-gold-600 text-black font-bold py-4 px-6 rounded-lg text-lg transition-colors flex items-center justify-center gap-2"
          >
            Continue
            <ChevronRight size={20} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-gold-500 hover:bg-gold-600 disabled:opacity-50 text-black font-bold py-4 px-6 rounded-lg text-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin w-5 h-5 border-2 border-black/30 border-t-black rounded-full" />
                Creating Account...
              </>
            ) : (
              <>
                <CheckCircle size={20} />
                Complete Registration
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-charcoal-950 flex flex-col">
      <div className="p-6">
        <Link href="/" className="inline-block">
          <p className="text-gold-500 font-serif text-xl font-bold tracking-widest">CIGAR CITY LOUNGE</p>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-serif text-gold-500 mb-2">Complete Your Registration</h1>
            <div className="w-16 h-px bg-gold-500 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Welcome! Please complete your member profile below.</p>
          </div>

          <div className="bg-charcoal-900 border border-charcoal-700 rounded-2xl p-8 shadow-2xl">
            <Suspense fallback={<div className="text-center py-10"><div className="animate-spin w-10 h-10 border-2 border-charcoal-700 border-t-gold-500 rounded-full mx-auto" /></div>}>
              <RegisterForm />
            </Suspense>
          </div>

          <div className="mt-8 bg-charcoal-900 border border-charcoal-800 rounded-xl p-6 text-center">
            <p className="text-white font-medium text-lg mb-2">Need Help?</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="tel:ADD_PHONE" className="flex items-center gap-2 justify-center text-gold-500 hover:text-gold-400">
                <Phone size={18} />
                [ADD PHONE NUMBER]
              </a>
              <a href="mailto:ADD_EMAIL" className="flex items-center gap-2 justify-center text-gold-500 hover:text-gold-400">
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
