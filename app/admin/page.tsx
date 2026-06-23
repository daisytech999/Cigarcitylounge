import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Users, Archive, CreditCard, Calendar, HelpCircle, AlertCircle, TrendingUp, Clock } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default async function AdminOverviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const admin = createAdminClient()
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [
    { count: totalMembers },
    { count: newThisMonth },
    { count: pendingLockers },
    { count: availableLockers },
    { count: upcomingEvents },
    { count: pendingSupport },
    { count: failedPayments },
    { data: revenueData },
  ] = await Promise.all([
    admin.from('profiles').select('*', { count: 'exact', head: true }).eq('membership_status', 'active'),
    admin.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth),
    admin.from('locker_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    admin.from('lockers').select('*', { count: 'exact', head: true }).eq('status', 'available'),
    admin.from('events').select('*', { count: 'exact', head: true }).eq('status', 'upcoming'),
    admin.from('support_requests').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    admin.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'failed'),
    admin.from('payments').select('amount').eq('status', 'succeeded').gte('created_at', startOfMonth),
  ])

  const monthlyRevenue = revenueData?.reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0

  const stats = [
    { label: 'Active Members', value: totalMembers || 0, icon: Users, color: 'text-green-400', bg: 'bg-green-400/10', href: '/admin/members' },
    { label: 'New This Month', value: newThisMonth || 0, icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-400/10', href: '/admin/members' },
    { label: 'Monthly Revenue', value: formatCurrency(monthlyRevenue), icon: CreditCard, color: 'text-gold-500', bg: 'bg-gold-500/10', href: '/admin/payments' },
    { label: 'Pending Locker Requests', value: pendingLockers || 0, icon: Archive, color: 'text-orange-400', bg: 'bg-orange-400/10', href: '/admin/lockers', urgent: (pendingLockers || 0) > 0 },
    { label: 'Available Lockers', value: availableLockers || 0, icon: Archive, color: 'text-gray-400', bg: 'bg-gray-400/10', href: '/admin/lockers' },
    { label: 'Upcoming Events', value: upcomingEvents || 0, icon: Calendar, color: 'text-purple-400', bg: 'bg-purple-400/10', href: '/admin/events' },
    { label: 'Open Support Requests', value: pendingSupport || 0, icon: HelpCircle, color: 'text-yellow-400', bg: 'bg-yellow-400/10', href: '/admin/support', urgent: (pendingSupport || 0) > 0 },
    { label: 'Failed Payments', value: failedPayments || 0, icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-400/10', href: '/admin/payments', urgent: (failedPayments || 0) > 0 },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif text-gold-500 mb-1">Admin Dashboard</h1>
        <p className="text-gray-400">Overview of Cigar City Lounge operations</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <Link key={i} href={stat.href} className={`bg-charcoal-900 border rounded-xl p-5 hover:border-gold-500/50 transition-all ${stat.urgent ? 'border-orange-500/40' : 'border-charcoal-700'}`}>
              <div className={`w-10 h-10 ${stat.bg} rounded-full flex items-center justify-center mb-3`}>
                <Icon size={20} className={stat.color} />
              </div>
              <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-charcoal-400 text-sm">{stat.label}</p>
              {stat.urgent && <p className="text-orange-400 text-xs mt-1 font-medium">Needs attention</p>}
            </Link>
          )
        })}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-charcoal-900 border border-charcoal-700 rounded-xl p-6">
          <h2 className="text-xl font-serif text-gold-500 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {[
              { href: '/admin/lockers', label: 'Assign Pending Lockers', desc: `${pendingLockers || 0} pending requests` },
              { href: '/admin/members', label: 'View New Members', desc: `${newThisMonth || 0} joined this month` },
              { href: '/admin/support', label: 'Handle Support Requests', desc: `${pendingSupport || 0} open tickets` },
              { href: '/admin/events', label: 'Manage Events', desc: `${upcomingEvents || 0} upcoming events` },
            ].map(action => (
              <Link key={action.href} href={action.href} className="flex items-center justify-between p-3 bg-charcoal-950 hover:bg-charcoal-800 rounded-lg transition-colors">
                <div>
                  <p className="text-white font-medium text-base">{action.label}</p>
                  <p className="text-charcoal-400 text-sm">{action.desc}</p>
                </div>
                <span className="text-gold-500">→</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-charcoal-900 border border-charcoal-700 rounded-xl p-6">
          <h2 className="text-xl font-serif text-gold-500 mb-4">Admin Sections</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: '/admin/members', label: 'Members', icon: '👥' },
              { href: '/admin/lockers', label: 'Lockers', icon: '🔐' },
              { href: '/admin/cigars', label: 'Cigar List', icon: '😬' },
              { href: '/admin/events', label: 'Events', icon: '🎉' },
              { href: '/admin/gallery', label: 'Gallery', icon: '🖼️' },
              { href: '/admin/content', label: 'Content', icon: '✏️' },
              { href: '/admin/payments', label: 'Payments', icon: '💳' },
              { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
            ].map(item => (
              <Link key={item.href} href={item.href} className="flex items-center gap-2 p-3 bg-charcoal-950 hover:bg-charcoal-800 rounded-lg transition-colors">
                <span>{item.icon}</span>
                <span className="text-white text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
