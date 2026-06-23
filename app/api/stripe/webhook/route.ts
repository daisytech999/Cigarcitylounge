import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/send'
import { welcomeEmailTemplate, paymentFailedEmailTemplate, adminNewMemberEmailTemplate } from '@/lib/email/templates'
import Stripe from 'stripe'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createAdminClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.CheckoutSession
        if (session.mode !== 'subscription') break

        const planId = session.metadata?.plan_id
        const planName = session.metadata?.plan_name || 'Membership'
        const billingCycle = session.metadata?.billing_cycle || 'monthly'
        const customerEmail = session.customer_details?.email
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string

        if (!customerEmail) break

        // Create pending registration
        await supabase.from('pending_registrations').upsert({
          email: customerEmail,
          stripe_customer_id: customerId,
          stripe_session_id: session.id,
          plan_id: planId,
          plan_name: planName,
          completed: false,
        })

        // Send admin notification
        const adminEmail = process.env.ADMIN_EMAIL
        if (adminEmail) {
          await sendEmail({
            to: adminEmail,
            subject: `New Membership Purchase - ${planName}`,
            html: adminNewMemberEmailTemplate(customerEmail, planName, customerEmail),
          })
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const { data: profile } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (!profile) break

        const status = subscription.status === 'active' ? 'active' : 
                       subscription.status === 'past_due' ? 'past_due' :
                       subscription.status === 'canceled' ? 'cancelled' : subscription.status as any

        await supabase.from('subscriptions')
          .update({
            status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)

        // Update profile membership status
        if (subscription.status === 'active') {
          await supabase.from('profiles').update({ membership_status: 'active' }).eq('user_id', profile.user_id)
        } else if (subscription.status === 'canceled') {
          await supabase.from('profiles').update({ membership_status: 'cancelled' }).eq('user_id', profile.user_id)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        await supabase.from('subscriptions')
          .update({ status: 'cancelled', cancelled_at: new Date().toISOString(), updated_at: new Date().toISOString() })
          .eq('stripe_subscription_id', subscription.id)

        const { data: profile } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (profile) {
          await supabase.from('profiles')
            .update({ membership_status: 'cancelled' })
            .eq('user_id', profile.user_id)

          await supabase.from('notifications').insert({
            user_id: profile.user_id,
            title: 'Membership Cancelled',
            message: 'Your membership has been cancelled. We hope to see you again soon.',
            type: 'warning',
          })
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string
        const subscriptionId = invoice.subscription as string

        const { data: profile } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (profile) {
          await supabase.from('payments').insert({
            user_id: profile.user_id,
            stripe_invoice_id: invoice.id,
            amount: invoice.amount_paid / 100,
            currency: invoice.currency,
            status: 'succeeded',
            description: `Membership payment`,
          })
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        const { data: profile } = await supabase
          .from('profiles')
          .select('user_id, first_name, email')
          .eq('stripe_customer_id', customerId)
          .single()

        if (profile) {
          await supabase.from('payments').insert({
            user_id: profile.user_id,
            stripe_invoice_id: invoice.id,
            amount: invoice.amount_due / 100,
            currency: invoice.currency,
            status: 'failed',
            description: 'Membership payment failed',
          })

          await supabase.from('notifications').insert({
            user_id: profile.user_id,
            title: 'Payment Failed',
            message: 'We were unable to process your membership payment. Please update your payment method.',
            type: 'error',
            link: '/dashboard/membership',
          })

          await sendEmail({
            to: profile.email,
            subject: 'Payment Failed - Action Required',
            html: paymentFailedEmailTemplate(profile.first_name, 'your membership', 'within 3 days'),
          })
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
