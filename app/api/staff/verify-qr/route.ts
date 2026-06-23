import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyQRToken } from '@/lib/qr'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: staffProfile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single()
  if (!staffProfile || !['admin', 'super_admin', 'staff'].includes(staffProfile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { token, location, deviceName } = await request.json()
  if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 })

  const admin = createAdminClient()

  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
  const { count: failCount } = await admin.from('qr_scan_attempts')
    .select('*', { count: 'exact', head: true })
    .eq('ip_address', ip)
    .eq('success', false)
    .gte('created_at', fiveMinAgo)

  if ((failCount || 0) >= 10) {
    return NextResponse.json({ approved: false, reason: 'rate_limited', message: 'Too many failed attempts. Please wait.' }, { status: 429 })
  }

  const verified = await verifyQRToken(token)

  if (!verified) {
    await admin.from('qr_scan_attempts').insert({ token_id: null, scanned_by: user.id, ip_address: ip, success: false, failure_reason: 'invalid_token' })
    return NextResponse.json({ approved: false, reason: 'invalid_token', message: 'QR code is invalid or expired.' })
  }

  const { data: qrRecord } = await admin.from('member_qr_codes').select('*').eq('token_id', verified.tokenId).single()

  if (!qrRecord) {
    await admin.from('qr_scan_attempts').insert({ token_id: verified.tokenId, scanned_by: user.id, ip_address: ip, success: false, failure_reason: 'not_found' })
    return NextResponse.json({ approved: false, reason: 'not_found', message: 'QR code not found.' })
  }

  if (qrRecord.status !== 'active') {
    await admin.from('qr_scan_attempts').insert({ token_id: verified.tokenId, scanned_by: user.id, ip_address: ip, success: false, failure_reason: `qr_${qrRecord.status}` })
    return NextResponse.json({ approved: false, reason: `qr_${qrRecord.status}`, message: `QR code is ${qrRecord.status}.` })
  }

  if (new Date(qrRecord.expires_at) < new Date()) {
    await admin.from('member_qr_codes').update({ status: 'expired' }).eq('id', qrRecord.id)
    await admin.from('qr_scan_attempts').insert({ token_id: verified.tokenId, scanned_by: user.id, ip_address: ip, success: false, failure_reason: 'expired' })
    return NextResponse.json({ approved: false, reason: 'expired', message: 'QR code has expired. Member must refresh.' })
  }

  const { data: profile } = await admin.from('profiles').select('*, subscriptions(*, membership_plan:membership_plans(*))').eq('user_id', qrRecord.user_id).single()

  if (!profile) {
    return NextResponse.json({ approved: false, reason: 'no_profile', message: 'Member profile not found.' })
  }

  const allowedStatuses = ['active']
  if (!allowedStatuses.includes(profile.membership_status)) {
    await admin.from('qr_scan_attempts').insert({ token_id: verified.tokenId, scanned_by: user.id, ip_address: ip, success: false, failure_reason: `membership_${profile.membership_status}` })

    const reasons: Record<string, string> = {
      pending: 'Membership pending activation.',
      cancelled: 'Membership has been cancelled.',
      paused: 'Membership is currently paused.',
      inactive: 'Membership is inactive.',
    }

    return NextResponse.json({
      approved: false,
      reason: `membership_${profile.membership_status}`,
      message: reasons[profile.membership_status] || 'Membership not active.',
      memberName: `${profile.first_name} ${profile.last_name}`,
    })
  }

  const { data: lockerAssignment } = await admin.from('locker_assignments')
    .select('*, locker:lockers(*)')
    .eq('user_id', qrRecord.user_id)
    .eq('status', 'active')
    .single()

  const planSlug = profile.subscriptions?.[0]?.membership_plan?.slug
  const today = new Date().toISOString().split('T')[0]
  const { data: deals } = await admin.from('member_deals')
    .select('*')
    .eq('is_active', true)
    .lte('start_date', today)
    .gte('end_date', today)
    .contains('eligible_plans', planSlug ? [planSlug] : [])

  const { data: lastCheckin } = await admin.from('member_checkins')
    .select('*')
    .eq('user_id', qrRecord.user_id)
    .eq('entry_status', 'approved')
    .order('check_in_time', { ascending: false })
    .limit(1)
    .single()

  await admin.from('qr_scan_attempts').insert({ token_id: verified.tokenId, scanned_by: user.id, ip_address: ip, success: true })
  await admin.from('member_qr_codes').update({ last_scanned_at: new Date().toISOString(), scan_count: (qrRecord.scan_count || 0) + 1 }).eq('id', qrRecord.id)

  const { data: checkin } = await admin.from('member_checkins').insert({
    user_id: qrRecord.user_id,
    qr_code_id: qrRecord.id,
    scanned_by: user.id,
    location: location || 'Main Entrance',
    device_name: deviceName || 'Unknown',
    entry_status: 'approved',
  }).select().single()

  return NextResponse.json({
    approved: true,
    checkinId: checkin?.id,
    member: {
      name: `${profile.first_name} ${profile.last_name}`,
      memberId: profile.member_id,
      membershipPlan: profile.subscriptions?.[0]?.membership_plan?.name || 'Unknown',
      membershipStatus: profile.membership_status,
      profileImageUrl: profile.profile_image_url,
      locker: lockerAssignment ? {
        number: lockerAssignment.locker?.locker_number,
        location: lockerAssignment.locker?.location,
        status: lockerAssignment.locker?.status,
      } : null,
      deals: deals || [],
      lastCheckin: lastCheckin?.check_in_time || null,
    }
  })
}
