import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/send'

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, subject, message } = await request.json()

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    await supabase.from('contact_messages').insert({ name, email, phone, subject, message })

    // Notify admin
    const adminEmail = process.env.ADMIN_EMAIL
    if (adminEmail) {
      await sendEmail({
        to: adminEmail,
        subject: `New Contact Message: ${subject}`,
        html: `<p><strong>From:</strong> ${name} (${email})</p><p><strong>Phone:</strong> ${phone || 'Not provided'}</p><p><strong>Message:</strong></p><p>${message}</p>`,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
