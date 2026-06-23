import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import Badge from '@/components/ui/Badge'
import { formatDate, formatCurrency } from '@/lib/utils'

export default async function AdminPaymentsPage() {
  const supabase = createAdminClient()
  const { data: payments } = await supabase
    .from('payments')
    .select('*, profile:profiles(first_name, last_name, email, member_id)')
    .order('created_at', { ascending: false })
    .limit(100)

  const total = payments?.filter(p => p.status === 'succeeded').reduce((sum, p) => sum + (p.amount || 0), 0) || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif text-gold-500 mb-1">Payments</h1>
        <p className="text-gray-400">Total collected: {formatCurrency(total)}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Collected', value: formatCurrency(total), color: 'text-green-400' },
          { label: 'Successful', value: payments?.filter(p => p.status === 'succeeded').length || 0, color: 'text-green-400' },
          { label: 'Failed', value: payments?.filter(p => p.status === 'failed').length || 0, color: 'text-red-400' },
        ].map(stat => (
          <div key={stat.label} className="bg-charcoal-900 border border-charcoal-700 rounded-xl p-5">
            <p className="text-charcoal-400 text-sm mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-charcoal-900 border border-charcoal-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-charcoal-700">
                {['Member', 'Amount', 'Status', 'Description', 'Date'].map(h => (
                  <th key={h} className="text-left p-4 text-charcoal-400 text-sm font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-800">
              {!payments || payments.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-charcoal-400">No payments yet</td></tr>
              ) : (
                payments.map(payment => (
                  <tr key={payment.id} className="hover:bg-charcoal-800/50 transition-colors">
                    <td className="p-4">
                      <p className="text-white text-sm">{(payment as any).profile?.first_name} {(payment as any).profile?.last_name}</p>
                      <p className="text-charcoal-400 text-xs">{(payment as any).profile?.email}</p>
                    </td>
                    <td className="p-4 text-gold-500 font-bold text-sm">{formatCurrency(payment.amount)}</td>
                    <td className="p-4">
                      {payment.status === 'succeeded' ? <Badge variant="green">Paid</Badge> :
                       payment.status === 'failed' ? <Badge variant="red">Failed</Badge> :
                       <Badge variant="gray">{payment.status}</Badge>}
                    </td>
                    <td className="p-4 text-gray-300 text-sm">{payment.description || 'Membership Payment'}</td>
                    <td className="p-4 text-charcoal-400 text-sm">{formatDate(payment.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
