import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/send'
import { eventRSVPEmailTemplate } from '@/lib/email/templates'
import { formatDate } from '@/lib/utils'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { eventId, action } = await request.json()
  const admin = createAdminClient()

  if (action === 'cancel') {
    await admin.from('event_rsvps').update({ status: 'cancelled', updated_at: new Date().toISOString() }).eq('event_id', eventId).eq('user_id', user.id)
    await admin.rpc('decrement_rsvp_count', { event_id: eventId })
    return NextResponse.json({ success: true })
  }

  // Check event capacity
  const { data: event } = await admin.from('events').select('*').eq('id', eventId).single()
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  if (event.capacity && event.rsvp_count >= event.capacity) {
    return NextResponse.json({ error: 'This event is at full capacity' }, { status: 400 })
  }

  const { error } = await admin.from('event_rsvps').upsert({
    event_id: eventId, user_id: user.id, status: 'confirmed', updated_at: new Date().toISOString()
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await admin.from('events').update({ rsvp_count: (event.rsvp_count || 0) + 1 }).eq('id', eventId)

  const { data: profile } = await admin.from('profiles').select('first_name, email').eq('user_id', user.id).single()
  if (profile?.email) {
    await sendEmail({
      to: profile.email,
      subject: `RSVP Confirmed: ${event.title}`,
      html: eventRSVPEmailTemplate(profile.first_name, event.title, formatDate(event.event_date), event.start_time),
    })
  }

  return NextResponse.json({ success: true })
}
