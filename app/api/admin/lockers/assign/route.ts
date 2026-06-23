import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/send'
import { lockerAssignedEmailTemplate } from '@/lib/email/templates'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: adminProfile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single()
  if (!adminProfile || !['admin', 'super_admin'].includes(adminProfile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { lockerId, memberId, isComplimentary } = await request.json()
  const admin = createAdminClient()

  // Update locker status
  await admin.from('lockers').update({ status: 'assigned', updated_at: new Date().toISOString() }).eq('id', lockerId)

  // Create assignment
  const { error } = await admin.from('locker_assignments').insert({
    locker_id: lockerId, user_id: memberId, is_complimentary: isComplimentary ?? true, status: 'active',
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Get locker details and member profile for email
  const { data: locker } = await admin.from('lockers').select('*').eq('id', lockerId).single()
  const { data: profile } = await admin.from('profiles').select('first_name, email').eq('user_id', memberId).single()

  if (profile?.email && locker) {
    await sendEmail({
      to: profile.email,
      subject: 'Your Locker Has Been Assigned!',
      html: lockerAssignedEmailTemplate(profile.first_name, locker.locker_number, locker.location || 'Main Floor'),
    })
  }

  // Add notification for member
  await admin.from('notifications').insert({
    user_id: memberId,
    title: 'Locker Assigned!',
    message: `Your locker #${locker?.locker_number} has been assigned. Please visit the front desk on your next visit.`,
    type: 'success',
    link: '/dashboard/locker',
  })

  // Log admin action
  await admin.from('audit_logs').insert({
    user_id: user.id,
    action: 'locker_assigned',
    resource_type: 'locker',
    resource_id: lockerId,
    details: { locker_number: locker?.locker_number, member_id: memberId },
  })

  return NextResponse.json({ success: true })
}
