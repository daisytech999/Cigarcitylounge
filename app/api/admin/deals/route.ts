import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function checkAdmin(supabase: any, userId: string) {
  const { data: p } = await supabase.from('profiles').select('role').eq('user_id', userId).single()
  return p && ['admin', 'super_admin'].includes(p.role)
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !await checkAdmin(supabase, user.id)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const admin = createAdminClient()
  const { data } = await admin.from('member_deals').select('*').order('created_at', { ascending: false })
  return NextResponse.json({ deals: data || [] })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !await checkAdmin(supabase, user.id)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await request.json()
  const admin = createAdminClient()
  const { data, error } = await admin.from('member_deals').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ deal: data })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !await checkAdmin(supabase, user.id)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id, ...updates } = await request.json()
  const admin = createAdminClient()
  await admin.from('member_deals').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id)
  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !await checkAdmin(supabase, user.id)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const admin = createAdminClient()
  await admin.from('member_deals').update({ is_active: false }).eq('id', id)
  return NextResponse.json({ success: true })
}
