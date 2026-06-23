import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, AlertCircle, CreditCard, Calendar, Download } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { formatDate, formatCurrency } from '@/lib/utils'

export default async function MembershipPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: profile },
    { data: subscription },
    { data: payments },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', user.id).single(),
    supabase.from('subscriptions').select('*, membership_plan:membership_plans(*)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).single(),
    supabase.from('payments').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
  ])

  const plan = (subscription as any)?.membership_plan

  const statusBadge = (status: string) => {
    if (status === 'active') return <Badge variant="green">Active</Badge>
    if (status === 'past_due') return <Badge variant="orange">Past Due</Badge>
    if (status === 'cancelled') return <Badge variant="red">Cancelled</Badge>
    return <Badge variant="gray">{status}</Badge>
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-serif text-gold-500 mb-1">My Membership</h1>
        <p className="text-gray-400">Manage your membership plan and billing</p>
      </div>

      {/* Current plan */}
      <div className="bg-charcoal-900 border border-charcoal-700 rounded-xl p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-charcoal-400 text-sm uppercase tracking-wider mb-1">Current Plan</p>
            <h2 className="text-3xl font-serif text-white">{plan?.name || 'No Plan'} Membership</h2>
          </div>
          {statusBadge(subscription?.status || 'inactive')}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {[
            { label: 'Monthly Price', value: plan ? formatCurrency(plan.price_monthly) + '/month' : 'N/A' },
            { label: 'Billing Cycle', value: subscription?.billing_cycle || 'Monthly' },
            { label: 'Started', value: subscription?.created_at ? formatDate(subscription.created_at) : 'N/A' },
            { label: 'Next Payment', value: subscription?.current_period_end ? formatDate(subscription.current_period_end) : 'N/A' },
          ].map(item => (
            <div key={item.label} className="bg-charcoal-950 rounded-lg p-4">
              <p className="text-charcoal-400 text-sm mb-1">{item.label}</p>
              <p className="text-white font-medium text-base">{item.value}</p>
            </div>
          ))}
        </div>

        {plan?.features && (
          <div>
            <p className="text-charcoal-400 text-sm uppercase tracking-wider mb-3">Your Benefits</p>
            <ul className="space-y-2">
              {JSON.parse(typeof plan.features === 'string' ? plan.features : JSON.stringify(plan.features)).map((feature: string, i: number) => (
                <li key={i} className="flex items-center gap-3 text-gray-300 text-base">
                  <CheckCircle size={18} className="text-gold-500 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Subscription management notice */}
      {subscription?.cancel_at_period_end && (
        <div className="bg-orange-900/20 border border-orange-500/30 rounded-xl p-6 flex gap-4">
          <AlertCircle size={24} className="text-orange-400 shrink-0" />
          <div>
            <h3 className="text-orange-300 font-semibold text-lg mb-1">Cancellation Scheduled</h3>
            <p className="text-gray-400 text-base">
              Your membership will end on {subscription.current_period_end ? formatDate(subscription.current_period_end) : 'your billing date'}.
              You will retain full access until then.
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="bg-charcoal-900 border border-charcoal-700 rounded-xl p-6">
        <h3 className="text-xl font-serif text-gold-500 mb-4">Membership Actions</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-charcoal-950 rounded-lg">
            <div>
              <p className="text-white font-medium">Update Payment Method</p>
              <p className="text-charcoal-400 text-sm">Change your credit or debit card</p>
            </div>
            <Link href="/dashboard/billing" className="bg-gold-500 hover:bg-gold-600 text-black font-bold py-2 px-5 rounded text-sm transition-colors flex items-center gap-2">
              <CreditCard size={16} />
              Update
            </Link>
          </div>
          <div className="flex items-center justify-between p-4 bg-charcoal-950 rounded-lg">
            <div>
              <p className="text-white font-medium">Upgrade Membership</p>
              <p className="text-charcoal-400 text-sm">Switch to Premium or Elite</p>
            </div>
            <Link href="/membership" className="border border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-black font-bold py-2 px-5 rounded text-sm transition-colors">
              Upgrade
            </Link>
          </div>
          <div className="flex items-center justify-between p-4 bg-charcoal-950 rounded-lg">
            <div>
              <p className="text-white font-medium">Contact About Membership</p>
              <p className="text-charcoal-400 text-sm">Questions about cancellation or changes</p>
            </div>
            <Link href="/dashboard/support" className="border border-charcoal-600 text-gray-300 hover:border-gold-500 hover:text-gold-500 font-bold py-2 px-5 rounded text-sm transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      {/* Payment history */}
      <div className="bg-charcoal-900 border border-charcoal-700 rounded-xl">
        <div className="p-6 border-b border-charcoal-700">
          <h3 className="text-xl font-serif text-gold-500">Payment History</h3>
        </div>
        <div className="divide-y divide-charcoal-800">
          {!payments || payments.length === 0 ? (
            <div className="p-8 text-center">
              <CreditCard size={36} className="text-charcoal-600 mx-auto mb-3" />
              <p className="text-charcoal-400 text-base">No payment history yet</p>
            </div>
          ) : (
            payments.map((payment: any) => (
              <div key={payment.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-white font-medium text-base">{payment.description || 'Membership Payment'}</p>
                  <p className="text-charcoal-400 text-sm">{formatDate(payment.created_at)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-white font-bold">{formatCurrency(payment.amount)}</span>
                  {payment.status === 'succeeded' ? (
                    <Badge variant="green">Paid</Badge>
                  ) : (
                    <Badge variant="red">Failed</Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
