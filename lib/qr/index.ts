import { SignJWT, jwtVerify } from 'jose'

const QR_SECRET = new TextEncoder().encode(
  process.env.QR_SECRET || 'cigar-city-lounge-qr-secret-change-in-production'
)

export async function signQRToken(tokenId: string, expiresInHours = 24): Promise<string> {
  return new SignJWT({ tid: tokenId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${expiresInHours}h`)
    .setJwtId(crypto.randomUUID())
    .sign(QR_SECRET)
}

export async function verifyQRToken(token: string): Promise<{ tokenId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, QR_SECRET)
    return { tokenId: payload.tid as string }
  } catch {
    return null
  }
}
