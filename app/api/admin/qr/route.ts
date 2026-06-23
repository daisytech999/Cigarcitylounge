import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: p } = await supabase.from('profiles').select('role').eq('user_id', user.id).single()
  if (!p || !['admin', 'super_admin'].includes(p.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const admin = createAdminClient()

  const { data } = await admin.from('member_qr_codes')
    .select('*, profile:profiles!user_id(first_name, last_name, email, member_id, membership_status)')
    .order('updated_at', { ascending: false })
    .limit(100)

  const filtered = search ? data?.filter((r: any) =>
    r.profile?.first_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.profile?.last_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.profile?.email?.toLowerCase().includes(search.toLowerCase()) ||
    r.profile?.member_id?.toLowerCase().includes(search.toLowerCase())
  ) : data

  return NextResponse.json({ qrCodes: filtered || [] })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: p } = await supabase.from('profiles').select('role').eq('user_id', user.id).single()
  if (!p || !['admin', 'super_admin'].includes(p.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { userId, action } = await request.json()
  const admin = createAdminClient()

  if (action === 'suspend') {
    await admin.from('member_qr_codes').update({ status: 'suspended', updated_at: new Date().toISOString() }).eq('user_id', userId)
  } else if (action === 'activate') {
    await admin.from('member_qr_codes').update({ status: 'active', updated_at: new Date().toISOString() }).eq('user_id', userId)
  } else if (action === 'regenerate') {
    await admin.from('member_qr_codes').update({
      token_id: crypto.randomUUID(),
      status: 'active',
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('user_id', userId)
  }

  await admin.from('audit_logs').insert({ user_id: user.id, action: `qr_${action}`, resource_type: 'member_qr_codes', details: { target_user_id: userId } })
  return NextResponse.json({ success: true })
}
