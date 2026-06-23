'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ArrowRight, AlertCircle, Phone, Mail } from 'lucide-react'
import PublicLayout from '@/components/layout/PublicLayout'
import { formatCurrency } from '@/lib/utils'

const plans = [
  {
    id: 'classic',
    name: 'Classic',
    priceMonthly: 79,
    priceYearly: 850,
    description: 'Perfect for the casual cigar enthusiast.',
    features: [
      'Lounge access during all operating hours',
      'Member pricing on all cigars',
      'Access to member events',
      'One complimentary locker (pending assignment)',
      'Monthly newsletter',
    ],
    badge: null,
  },
  {
    id: 'premium',
    name: 'Premium',
    priceMonthly: 149,
    priceYearly: 1590,
    description: 'Elevated membership with priority access.',
    features: [
      'All Classic membership benefits',
      'Priority event access and early registration',
      'Enhanced member pricing',
      'One complimentary locker (pending assignment)',
      '2 guest passes per month',
      'Quarterly featured cigar selection',
      'Reserved seating option',
    ],
    badge: 'Most Popular',
  },
  {
    id: 'elite',
    name: 'Elite',
    priceMonthly: 249,
    priceYearly: 2650,
    description: 'The ultimate VIP lounge experience.',
    features: [
      'All Premium membership benefits',
      'VIP event access and private gatherings',
      'Maximum member discounts',
      'One complimentary locker (pending assignment)',
      'Unlimited guest passes',
      'Personal cigar consultant',
      'Concierge-level service',
      'Priority reservation benefits',
      'Annual gift selection',
    ],
    badge: 'VIP',
  },
]

export default function MembershipPage() {
  const router = useRouter()
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [loading, setLoading] = useState<string | null>(null)
  const [ageConfirmed, setAgeConfirmed] = useState(false)
  const [error, setError] = useState('')

  const handleSelectPlan = async (planSlug: string) => {
    if (!ageConfirmed) {
      setError('Please confirm that you meet the legal age requirement before proceeding.')
      return
    }
    setError('')
    setLoading(planSlug)

    try {
      // Fetch the real plan ID from the database
      const res = await fetch('/api/plans')
      const { plans: dbPlans } = await res.json()
      const dbPlan = dbPlans?.find((p: any) => p.slug === planSlug)

      const checkoutRes = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: dbPlan?.id || planSlug,
          billingCycle,
          planSlug
        }),
      })
      const { url, error: checkoutError } = await checkoutRes.json()
      if (checkoutError) throw new Error(checkoutError)
      if (url) window.location.href = url
    } catch (err: any) {
      setError(err.message || 'Failed to start checkout. Please try again.')
      setLoading(null)
    }
  }

  const savings = (monthly: number, yearly: number) => {
    const monthlyTotal = monthly * 12
    return Math.round(((monthlyTotal - yearly) / monthlyTotal) * 100)
  }

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-charcoal-950 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-gold-500 text-sm tracking-widest uppercase mb-4">Membership Plans</p>
          <h1 className="text-5xl md:text-6xl font-serif text-white mb-6">
            Join Cigar City <span className="text-gold-500">Lounge</span>
          </h1>
          <div className="w-20 h-1 bg-gold-500 mx-auto mb-8" />
          <p className="text-gray-300 text-xl leading-relaxed max-w-2xl mx-auto">
            Choose the membership plan that fits your lifestyle. All memberships include
            lounge access, member pricing, and a complimentary locker.
          </p>
        </div>
      </section>

      {/* Billing toggle */}
      <section className="py-8 bg-charcoal-950">
        <div className="flex justify-center">
          <div className="bg-charcoal-900 border border-charcoal-700 rounded-xl p-1.5 flex gap-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-8 py-3 rounded-lg text-base font-medium transition-all ${billingCycle === 'monthly' ? 'bg-gold-500 text-black' : 'text-gray-400 hover:text-white'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-8 py-3 rounded-lg text-base font-medium transition-all flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-gold-500 text-black' : 'text-gray-400 hover:text-white'}`}
            >
              Yearly
              <span className={`text-xs px-2 py-0.5 rounded-full ${billingCycle === 'yearly' ? 'bg-black/20' : 'bg-green-900/40 text-green-400'}`}>Save up to 10%</span>
            </button>
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="py-12 bg-charcoal-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="max-w-xl mx-auto mb-8 bg-red-900/20 border border-red-500/30 text-red-300 rounded-lg p-4 flex gap-3">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-xl border flex flex-col transition-all ${
                  plan.badge === 'Most Popular'
                    ? 'border-gold-500 bg-charcoal-900 shadow-xl shadow-gold-500/10 scale-105'
                    : 'border-charcoal-700 bg-charcoal-900 hover:border-gold-500/50'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${plan.badge === 'Most Popular' ? 'bg-gold-500 text-black' : 'bg-charcoal-700 text-gold-500 border border-gold-500'}`}>
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="p-8 border-b border-charcoal-700">
                  <h3 className="text-2xl font-serif text-gold-500 mb-2">{plan.name}</h3>
                  <p className="text-gray-400 text-base mb-6">{plan.description}</p>
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-bold text-white">
                      {formatCurrency(billingCycle === 'yearly' ? plan.priceYearly / 12 : plan.priceMonthly)}
                    </span>
                    <span className="text-gray-400 text-base mb-2">/month</span>
                  </div>
                  {billingCycle === 'yearly' && (
                    <p className="text-green-400 text-sm mt-1">
                      {formatCurrency(plan.priceYearly)}/year · Save {savings(plan.priceMonthly, plan.priceYearly)}%
                    </p>
                  )}
                  {billingCycle === 'monthly' && (
                    <p className="text-gray-500 text-sm mt-1">Billed monthly · Cancel anytime</p>
                  )}
                </div>

                <div className="p-8 flex-1">
                  <ul className="space-y-4">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex gap-3 text-base">
                        <Check size={20} className="text-gold-500 shrink-0 mt-0.5" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-8 pt-0">
                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={loading !== null}
                    className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
                      plan.badge === 'Most Popular'
                        ? 'bg-gold-500 hover:bg-gold-600 text-black'
                        : 'border-2 border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-black'
                    }`}
                  >
                    {loading === plan.id ? 'Processing...' : (
                      <>
                        Select {plan.name}
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Age verification */}
      <section className="py-10 bg-charcoal-950">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-charcoal-900 border border-charcoal-700 rounded-xl p-8">
            <label className="flex items-start gap-4 cursor-pointer">
              <input
                type="checkbox"
                checked={ageConfirmed}
                onChange={(e) => setAgeConfirmed(e.target.checked)}
                className="mt-1 w-6 h-6 rounded border-charcoal-600 bg-charcoal-800 accent-gold-500 cursor-pointer shrink-0"
              />
              <span className="text-gray-300 text-base leading-relaxed">
                <strong className="text-white">Age Verification Required:</strong> I confirm that I am 21 years of age or older and meet the legal age requirement for entering a cigar lounge in my location.
              </span>
            </label>
          </div>
        </div>
      </section>

      {/* Locker notice */}
      <section className="pb-16 bg-charcoal-950">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-charcoal-900 border border-gold-500/30 rounded-xl p-8">
            <div className="flex gap-4">
              <div className="text-3xl">🔐</div>
              <div>
                <h3 className="text-gold-500 font-serif text-xl mb-2">About Your Complimentary Locker</h3>
                <p className="text-gray-300 text-base leading-relaxed">
                  Your complimentary locker will be assigned by our team after membership approval and availability confirmation.
                  You will receive a notification once your locker has been assigned.
                  Additional lockers may be requested through your member dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ / Need Help */}
      <section className="py-16 bg-charcoal-900 border-t border-charcoal-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-serif text-white mb-4">Questions About Membership?</h2>
          <p className="text-gray-400 text-lg mb-8">Our team is happy to help you choose the right plan.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:ADD_PHONE" className="btn-gold inline-flex items-center gap-2 justify-center">
              <Phone size={18} />
              Call Us
            </a>
            <a href="mailto:ADD_EMAIL" className="btn-outline-gold inline-flex items-center gap-2 justify-center">
              <Mail size={18} />
              Email Us
            </a>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
