import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: adminProfile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single()
  if (!adminProfile || !['admin', 'super_admin', 'staff'].includes(adminProfile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

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
  ] = await Promise.all([
    admin.from('profiles').select('*', { count: 'exact', head: true }).eq('membership_status', 'active'),
    admin.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth),
    admin.from('locker_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    admin.from('lockers').select('*', { count: 'exact', head: true }).eq('status', 'available'),
    admin.from('events').select('*', { count: 'exact', head: true }).eq('status', 'upcoming'),
    admin.from('support_requests').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    admin.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'failed'),
  ])

  const { data: revenueData } = await admin.from('payments').select('amount').eq('status', 'succeeded').gte('created_at', startOfMonth)
  const monthlyRevenue = revenueData?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0

  return NextResponse.json({
    totalMembers, newThisMonth, pendingLockers, availableLockers,
    upcomingEvents, pendingSupport, failedPayments, monthlyRevenue,
  })
}
