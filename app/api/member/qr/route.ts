import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { signQRToken } from '@/lib/qr'
import QRCode from 'qrcode'

async function getOrCreateQR(userId: string) {
  const admin = createAdminClient()

  const { data: existing } = await admin
    .from('member_qr_codes')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (existing && existing.status === 'active') {
    const expiresAt = new Date(existing.expires_at)
    const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000)
    if (expiresAt > oneHourFromNow) {
      const jwt = await signQRToken(existing.token_id)
      const qrDataUrl = await QRCode.toDataURL(jwt, {
        width: 300,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
      })
      return { qrCode: existing, qrDataUrl }
    }
  }

  const tokenId = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

  if (existing) {
    await admin.from('member_qr_codes').update({
      token_id: tokenId,
      expires_at: expiresAt.toISOString(),
      status: 'active',
      updated_at: new Date().toISOString(),
    }).eq('user_id', userId)
  } else {
    await admin.from('member_qr_codes').insert({
      user_id: userId,
      token_id: tokenId,
      expires_at: expiresAt.toISOString(),
      status: 'active',
    })
  }

  const { data: qrCode } = await admin.from('member_qr_codes').select('*').eq('user_id', userId).single()
  const jwt = await signQRToken(tokenId)
  const qrDataUrl = await QRCode.toDataURL(jwt, {
    width: 300,
    margin: 2,
    color: { dark: '#000000', light: '#ffffff' },
  })

  return { qrCode, qrDataUrl }
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { qrCode, qrDataUrl } = await getOrCreateQR(user.id)
  return NextResponse.json({ qrCode, qrDataUrl })
}

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  await admin.from('member_qr_codes').update({ status: 'expired', updated_at: new Date().toISOString() }).eq('user_id', user.id)

  const { qrCode, qrDataUrl } = await getOrCreateQR(user.id)

  await admin.from('audit_logs').insert({
    user_id: user.id,
    action: 'qr_refreshed',
    resource_type: 'member_qr_codes',
    resource_id: qrCode?.id,
  })

  return NextResponse.json({ qrCode, qrDataUrl })
}
