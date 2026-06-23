import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', user.id).single()
  const { data: subscription } = await supabase.from('subscriptions').select('*, membership_plan:membership_plans(*)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).single()
  const { data: locker } = await supabase.from('locker_assignments').select('*, locker:lockers(*)').eq('user_id', user.id).eq('status', 'active').single()
  const { data: notifications } = await supabase.from('notifications').select('*').eq('user_id', user.id).eq('is_read', false).order('created_at', { ascending: false }).limit(10)

  return NextResponse.json({ profile, subscription, locker, notifications: notifications || [] })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { first_name, last_name, phone, address, city, state, zip_code, emergency_contact_name, emergency_contact_phone } = body

  const { data, error } = await supabase.from('profiles')
    .update({ first_name, last_name, phone, address, city, state, zip_code, emergency_contact_name, emergency_contact_phone, updated_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ profile: data })
}
