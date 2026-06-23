import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/send'
import { welcomeEmailTemplate } from '@/lib/email/templates'
import { generateMemberId } from '@/lib/utils'
import { stripe } from '@/lib/stripe/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      sessionId, token, email, password,
      firstName, lastName, phone, dateOfBirth,
      address, city, state, zipCode,
      emergencyContactName, emergencyContactPhone,
      membershipAccepted, rulesAccepted, ageVerified,
    } = body

    const supabase = createAdminClient()

    // Find pending registration by session ID or token
    const query = sessionId 
      ? supabase.from('pending_registrations').select('*').eq('stripe_session_id', sessionId).eq('completed', false).single()
      : supabase.from('pending_registrations').select('*').eq('registration_token', token).eq('completed', false).single()

    const { data: pending, error: pendingError } = await query

    if (pendingError || !pending) {
      return NextResponse.json({ error: 'Invalid or expired registration link. Please contact support.' }, { status: 400 })
    }

    if (new Date(pending.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Registration link has expired. Please contact support.' }, { status: 400 })
    }

    // Create the auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email || pending.email,
      password,
      email_confirm: true,
    })

    if (authError || !authData.user) {
      if (authError?.message?.includes('already registered')) {
        return NextResponse.json({ error: 'An account with this email already exists. Please log in.' }, { status: 400 })
      }
      return NextResponse.json({ error: 'Failed to create account. Please try again.' }, { status: 500 })
    }

    const userId = authData.user.id
    const memberId = generateMemberId()

    // Get Stripe customer ID from session
    let stripeCustomerId = pending.stripe_customer_id
    if (!stripeCustomerId && sessionId) {
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId)
        stripeCustomerId = session.customer as string
      } catch {}
    }

    // Create profile
    const { error: profileError } = await supabase.from('profiles').insert({
      user_id: userId,
      first_name: firstName,
      last_name: lastName,
      email: email || pending.email,
      phone,
      date_of_birth: dateOfBirth,
      address,
      city,
      state,
      zip_code: zipCode,
      emergency_contact_name: emergencyContactName,
      emergency_contact_phone: emergencyContactPhone,
      member_id: memberId,
      role: 'member',
      membership_status: 'active',
      membership_accepted_at: membershipAccepted ? new Date().toISOString() : null,
      rules_accepted_at: rulesAccepted ? new Date().toISOString() : null,
      age_verified: ageVerified,
      stripe_customer_id: stripeCustomerId,
    })

    if (profileError) {
      await supabase.auth.admin.deleteUser(userId)
      return NextResponse.json({ error: 'Failed to create profile. Please contact support.' }, { status: 500 })
    }

    // Get subscription from Stripe
    if (stripeCustomerId) {
      try {
        const subscriptions = await stripe.subscriptions.list({ customer: stripeCustomerId, limit: 1 })
        if (subscriptions.data.length > 0) {
          const sub = subscriptions.data[0]
          await supabase.from('subscriptions').insert({
            user_id: userId,
            plan_id: pending.plan_id,
            stripe_subscription_id: sub.id,
            stripe_customer_id: stripeCustomerId,
            status: sub.status as any,
            billing_cycle: 'monthly',
            current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          })
        }
      } catch {}
    }

    // Create locker request notification for admin
    await supabase.from('notifications').insert({
      user_id: userId,
      title: 'Welcome to Cigar City Lounge!',
      message: `Welcome ${firstName}! Your ${pending.plan_name} membership is now active. Your complimentary locker will be assigned soon.`,
      type: 'success',
    })

    // Mark pending registration as completed
    await supabase.from('pending_registrations').update({ completed: true }).eq('id', pending.id)

    // Send welcome email
    await sendEmail({
      to: email || pending.email,
      subject: 'Welcome to Cigar City Lounge!',
      html: welcomeEmailTemplate(firstName, pending.plan_name || 'Classic'),
    })

    return NextResponse.json({ success: true, message: 'Registration complete!' })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Registration failed. Please contact support.' }, { status: 500 })
  }
}
