import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const { planId, billingCycle } = await request.json()

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data: plan, error: planError } = await supabase
      .from('membership_plans')
      .select('*')
      .eq('id', planId)
      .eq('is_active', true)
      .single()

    if (planError || !plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    const priceId = billingCycle === 'yearly' ? plan.stripe_price_id_yearly : plan.stripe_price_id_monthly
    const price = billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: priceId
        ? [{ price: priceId, quantity: 1 }]
        : [{
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${plan.name} Membership - Cigar City Lounge`,
                description: plan.description || undefined,
              },
              unit_amount: Math.round(price * 100),
              recurring: { interval: billingCycle === 'yearly' ? 'year' : 'month' },
            },
            quantity: 1,
          }],
      success_url: `${appUrl}/register?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/membership?cancelled=true`,
      metadata: {
        plan_id: planId,
        plan_name: plan.name,
        billing_cycle: billingCycle || 'monthly',
      },
      subscription_data: {
        metadata: {
          plan_id: planId,
          plan_name: plan.name,
        },
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout session error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
