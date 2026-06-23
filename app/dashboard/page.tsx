import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { User, CreditCard, Archive, Calendar, Bell, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'
import Badge from '@/components/ui/Badge'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: profile },
    { data: subscription },
    { data: locker },
    { data: notifications },
    { data: upcomingRSVPs },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', user.id).single(),
    supabase.from('subscriptions').select('*, membership_plan:membership_plans(*)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).single(),
    supabase.from('locker_assignments').select('*, locker:lockers(*)').eq('user_id', user.id).eq('status', 'active').single(),
    supabase.from('notifications').select('*').eq('user_id', user.id).eq('is_read', false).order('created_at', { ascending: false }).limit(5),
    supabase.from('event_rsvps').select('*, event:events(*)').eq('user_id', user.id).eq('status', 'confirmed').order('created_at', { ascending: false }).limit(3),
  ])

  const membershipStatus = profile?.membership_status
  const statusColor = membershipStatus === 'active' ? 'green' : membershipStatus === 'pending' ? 'orange' : 'red'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif text-gold-500 mb-1">
          Welcome back, {profile?.first_name}
        </h1>
        <p className="text-gray-400 text-base">Member ID: {profile?.member_id}</p>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: User,
            label: 'Membership Status',
            value: membershipStatus?.charAt(0).toUpperCase() + membershipStatus?.slice(1) || 'Pending',
            sub: subscription?.membership_plan?.name || 'No plan',
            color: statusColor,
          },
          {
            icon: CreditCard,
            label: 'Next Payment',
            value: subscription?.current_period_end ? formatDate(subscription.current_period_end) : 'N/A',
            sub: subscription?.membership_plan?.price_monthly ? formatCurrency(subscription.membership_plan.price_monthly) + '/mo' : '',
            color: 'gold',
          },
          {
            icon: Archive,
            label: 'My Locker',
            value: locker?.locker?.locker_number ? `#${locker.locker.locker_number}` : 'Pending',
            sub: locker?.locker?.location || (locker ? 'See locker tab' : 'Awaiting assignment'),
            color: locker ? 'green' : 'orange',
          },
          {
            icon: Bell,
            label: 'Notifications',
            value: String(notifications?.length || 0),
            sub: 'unread messages',
            color: (notifications?.length || 0) > 0 ? 'orange' : 'gray',
          },
        ].map((card, i) => {
          const Icon = card.icon
          return (
            <div key={i} className="bg-charcoal-900 border border-charcoal-700 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gold-500/10 rounded-full flex items-center justify-center">
                  <Icon size={20} className="text-gold-500" />
                </div>
                <span className="text-charcoal-400 text-sm">{card.label}</span>
              </div>
              <p className="text-white text-xl font-bold mb-1">{card.value}</p>
              <p className="text-charcoal-400 text-sm">{card.sub}</p>
            </div>
          )
        })}
      </div>

      {/* Locker notice if pending */}
      {!locker && (
        <div className="bg-charcoal-900 border border-gold-500/30 rounded-xl p-6 flex gap-4">
          <Clock size={24} className="text-gold-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-white font-semibold text-lg mb-1">Your Locker is Being Assigned</h3>
            <p className="text-gray-400 text-base">
              Your complimentary locker is pending assignment. Our team will notify you once your locker has been assigned.
              You can also submit a locker request from the Locker tab.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent notifications */}
        <div className="bg-charcoal-900 border border-charcoal-700 rounded-xl">
          <div className="p-6 border-b border-charcoal-700 flex items-center justify-between">
            <h2 className="text-xl font-serif text-gold-500">Recent Notifications</h2>
            <Link href="/dashboard/notifications" className="text-gold-500 hover:text-gold-400 text-sm">View all</Link>
          </div>
          <div className="p-4">
            {!notifications || notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell size={36} className="text-charcoal-600 mx-auto mb-3" />
                <p className="text-charcoal-400 text-base">No new notifications</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notif: any) => (
                  <div key={notif.id} className="flex gap-3 p-3 bg-charcoal-950 rounded-lg">
                    <div className={`w-2 h-2 rounded-full shrink-0 mt-2 ${notif.type === 'success' ? 'bg-green-400' : notif.type === 'error' ? 'bg-red-400' : notif.type === 'warning' ? 'bg-orange-400' : 'bg-blue-400'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-base">{notif.title}</p>
                      <p className="text-gray-400 text-sm mt-0.5 line-clamp-2">{notif.message}</p>
                      <p className="text-charcoal-500 text-xs mt-1">{formatDate(notif.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming RSVPs */}
        <div className="bg-charcoal-900 border border-charcoal-700 rounded-xl">
          <div className="p-6 border-b border-charcoal-700 flex items-center justify-between">
            <h2 className="text-xl font-serif text-gold-500">My Event RSVPs</h2>
            <Link href="/dashboard/events" className="text-gold-500 hover:text-gold-400 text-sm">View all</Link>
          </div>
          <div className="p-4">
            {!upcomingRSVPs || upcomingRSVPs.length === 0 ? (
              <div className="text-center py-8">
                <Calendar size={36} className="text-charcoal-600 mx-auto mb-3" />
                <p className="text-charcoal-400 text-base mb-4">No upcoming RSVPs</p>
                <Link href="/events" className="text-gold-500 hover:text-gold-400 text-sm">Browse Events</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingRSVPs.map((rsvp: any) => (
                  <div key={rsvp.id} className="p-3 bg-charcoal-950 rounded-lg">
                    <p className="text-white font-medium text-base">{rsvp.event?.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-gray-400 text-sm flex items-center gap-1">
                        <Calendar size={12} />
                        {rsvp.event?.event_date ? formatDate(rsvp.event.event_date) : ''}
                      </span>
                      <Badge variant="green">Confirmed</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-charcoal-900 border border-charcoal-700 rounded-xl p-6">
        <h2 className="text-xl font-serif text-gold-500 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { href: '/dashboard/membership', label: 'Manage Membership', icon: '💳' },
            { href: '/dashboard/locker', label: 'My Locker', icon: '🔐' },
            { href: '/events', label: 'Browse Events', icon: '🎉' },
            { href: '/dashboard/support', label: 'Get Help', icon: '💬' },
          ].map(action => (
            <Link key={action.href} href={action.href} className="bg-charcoal-950 border border-charcoal-700 hover:border-gold-500/50 rounded-xl p-5 text-center transition-all hover:bg-charcoal-900">
              <div className="text-3xl mb-2">{action.icon}</div>
              <p className="text-white text-sm font-medium">{action.label}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
