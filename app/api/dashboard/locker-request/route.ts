import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/send'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { requestType, notes } = await request.json()

  const admin = createAdminClient()
  const { data, error } = await admin.from('locker_requests').insert({
    user_id: user.id,
    request_type: requestType,
    notes,
    status: 'pending',
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Notify admin
  const adminEmail = process.env.ADMIN_EMAIL
  if (adminEmail) {
    const { data: profile } = await admin.from('profiles').select('first_name, last_name, email').eq('user_id', user.id).single()
    await sendEmail({
      to: adminEmail,
      subject: `Locker Request - ${requestType}`,
      html: `<p>Member ${profile?.first_name} ${profile?.last_name} (${profile?.email}) submitted a locker ${requestType} request.</p><p>Notes: ${notes || 'None'}</p>`,
    })
  }

  return NextResponse.json({ success: true, request: data })
}
