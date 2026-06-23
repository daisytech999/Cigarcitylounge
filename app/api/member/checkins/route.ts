import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase.from('member_checkins')
    .select('check_in_time, location, entry_status')
    .eq('user_id', user.id)
    .eq('entry_status', 'approved')
    .order('check_in_time', { ascending: false })
    .limit(10)

  return NextResponse.json({ checkins: data || [] })
}
