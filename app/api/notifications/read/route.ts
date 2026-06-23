import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { notificationId } = await request.json()

  if (notificationId) {
    await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId).eq('user_id', user.id)
  } else {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id)
  }

  return NextResponse.json({ success: true })
}
