import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Cigar City Lounge - Premium Members Club',
  description: 'Experience the finest cigars in an upscale, relaxing environment. Join Cigar City Lounge for exclusive membership access.',
  keywords: 'cigar lounge, premium cigars, cigar club, membership, Tampa',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-charcoal-950">{children}</body>
    </html>
  )
}
