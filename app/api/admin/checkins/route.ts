import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single()
  if (!profile || !['admin', 'super_admin', 'staff'].includes(profile.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  const userId = searchParams.get('userId')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 50

  const admin = createAdminClient()
  let query = admin.from('member_checkins')
    .select('*, profile:profiles!user_id(first_name, last_name, email, member_id, profile_image_url), staff:profiles!scanned_by(first_name, last_name)', { count: 'exact' })
    .order('check_in_time', { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  if (date) {
    query = query.gte('check_in_time', `${date}T00:00:00Z`).lte('check_in_time', `${date}T23:59:59Z`)
  }
  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { data, count } = await query
  return NextResponse.json({ checkins: data || [], total: count || 0 })
}
