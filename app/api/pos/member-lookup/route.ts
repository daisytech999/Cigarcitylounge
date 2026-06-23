import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyQRToken } from '@/lib/qr'

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get('X-POS-API-Key')
  const expectedKey = process.env.POS_API_KEY

  if (!expectedKey || apiKey !== expectedKey) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
  }

  const { token } = await request.json()
  if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 })

  const verified = await verifyQRToken(token)
  if (!verified) return NextResponse.json({ error: 'Invalid or expired QR token' }, { status: 400 })

  const admin = createAdminClient()
  const { data: qrRecord } = await admin.from('member_qr_codes').select('*').eq('token_id', verified.tokenId).single()

  if (!qrRecord || qrRecord.status !== 'active') {
    return NextResponse.json({ error: 'QR code not active', approved: false }, { status: 400 })
  }

  const { data: profile } = await admin.from('profiles')
    .select('*, subscriptions(*, membership_plan:membership_plans(*))')
    .eq('user_id', qrRecord.user_id)
    .single()

  if (!profile || profile.membership_status !== 'active') {
    return NextResponse.json({ approved: false, reason: 'membership_not_active' })
  }

  const { data: locker } = await admin.from('locker_assignments')
    .select('*, locker:lockers(locker_number, location)')
    .eq('user_id', qrRecord.user_id).eq('status', 'active').single()

  const today = new Date().toISOString().split('T')[0]
  const planSlug = profile.subscriptions?.[0]?.membership_plan?.slug
  const { data: deals } = await admin.from('member_deals')
    .select('id, title, description, deal_type, discount_value, pos_product_id')
    .eq('is_active', true)
    .lte('start_date', today)
    .gte('end_date', today)
    .contains('eligible_plans', planSlug ? [planSlug] : [])

  return NextResponse.json({
    approved: true,
    memberId: profile.member_id,
    membershipPlan: profile.subscriptions?.[0]?.membership_plan?.name,
    membershipStatus: profile.membership_status,
    locker: locker ? `#${locker.locker?.locker_number}` : null,
    deals: deals || [],
    eventAccess: true,
  })
}
