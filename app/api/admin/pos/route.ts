import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: p } = await supabase.from('profiles').select('role').eq('user_id', user.id).single()
  if (!p || !['admin', 'super_admin'].includes(p.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const admin = createAdminClient()
  const { data: integrations } = await admin.from('pos_integrations').select('*').order('created_at')
  const { data: logs } = await admin.from('pos_sync_logs').select('*, integration:pos_integrations(display_name)').order('created_at', { ascending: false }).limit(50)
  return NextResponse.json({ integrations: integrations || [], logs: logs || [] })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: p } = await supabase.from('profiles').select('role').eq('user_id', user.id).single()
  if (!p || p.role !== 'super_admin') return NextResponse.json({ error: 'Forbidden — super admin only' }, { status: 403 })
  const body = await request.json()
  const admin = createAdminClient()
  const { data, error } = await admin.from('pos_integrations').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ integration: data })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: p } = await supabase.from('profiles').select('role').eq('user_id', user.id).single()
  if (!p || p.role !== 'super_admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id, ...updates } = await request.json()
  const admin = createAdminClient()
  await admin.from('pos_integrations').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id)
  return NextResponse.json({ success: true })
}
