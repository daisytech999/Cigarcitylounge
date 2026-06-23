'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { CheckCircle, XCircle, Camera, RefreshCw, User, Archive, Tag, Clock, Phone } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

type ScanResult = {
  approved: boolean
  checkinId?: string
  member?: {
    name: string
    memberId: string
    membershipPlan: string
    membershipStatus: string
    profileImageUrl?: string
    locker?: { number: string; location: string; status: string } | null
    deals?: any[]
    lastCheckin?: string | null
  }
  reason?: string
  message?: string
  memberName?: string
}

export default function StaffCheckInPage() {
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState('')
  const [location] = useState('Main Entrance')
  const scannerRef = useRef<any>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const html5QrcodeRef = useRef<any>(null)

  const resetScanner = useCallback(() => {
    setResult(null)
    setError('')
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }, [])

  const stopScanner = useCallback(async () => {
    if (html5QrcodeRef.current) {
      try {
        await html5QrcodeRef.current.stop()
        html5QrcodeRef.current.clear()
      } catch {}
      html5QrcodeRef.current = null
    }
    setScanning(false)
  }, [])

  const handleScanSuccess = useCallback(async (decodedText: string) => {
    if (verifying) return
    setVerifying(true)
    await stopScanner()

    try {
      const res = await fetch('/api/staff/verify-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: decodedText, location }),
      })
      const data = await res.json()
      setResult(data)
      timeoutRef.current = setTimeout(resetScanner, 8000)
    } catch {
      setError('Verification failed. Please try again.')
      timeoutRef.current = setTimeout(resetScanner, 3000)
    }
    setVerifying(false)
  }, [verifying, stopScanner, location, resetScanner])

  const startScanner = useCallback(async () => {
    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      const html5Qrcode = new Html5Qrcode('qr-reader')
      html5QrcodeRef.current = html5Qrcode

      await html5Qrcode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 280, height: 280 } },
        handleScanSuccess,
        () => {}
      )
      setScanning(true)
    } catch {
      setError('Camera access denied or not available. Please allow camera access.')
    }
  }, [handleScanSuccess])

  useEffect(() => {
    return () => {
      stopScanner()
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [stopScanner])

  return (
    <div className="min-h-screen bg-charcoal-950">
      {result && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${result.approved ? 'bg-green-950' : 'bg-red-950'}`}>
          <div className="max-w-lg w-full text-center">
            {result.approved ? (
              <>
                <CheckCircle size={80} className="text-green-400 mx-auto mb-4" />
                <h1 className="text-5xl font-serif text-white mb-2">APPROVED</h1>
                <p className="text-green-300 text-2xl mb-8">Welcome to Cigar City Lounge</p>

                <div className="bg-black/30 rounded-2xl p-6 text-left space-y-4 mb-6">
                  {result.member?.profileImageUrl && (
                    <div className="flex justify-center mb-2">
                      <img src={result.member.profileImageUrl} alt="Member" className="w-20 h-20 rounded-full border-2 border-green-400 object-cover" />
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <User size={22} className="text-green-400 shrink-0" />
                    <div>
                      <p className="text-white font-bold text-2xl">{result.member?.name}</p>
                      <p className="text-green-300 font-mono">{result.member?.memberId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Tag size={22} className="text-green-400 shrink-0" />
                    <div>
                      <p className="text-gray-400 text-sm">Membership</p>
                      <p className="text-white text-xl font-medium">{result.member?.membershipPlan}</p>
                    </div>
                  </div>
                  {result.member?.locker && (
                    <div className="flex items-center gap-3">
                      <Archive size={22} className="text-green-400 shrink-0" />
                      <div>
                        <p className="text-gray-400 text-sm">Locker</p>
                        <p className="text-white text-xl font-bold">#{result.member.locker.number}</p>
                        {result.member.locker.location && <p className="text-gray-400 text-sm">{result.member.locker.location}</p>}
                      </div>
                    </div>
                  )}
                  {result.member?.deals && result.member.deals.length > 0 && (
                    <div>
                      <p className="text-green-400 font-medium text-sm mb-2 flex items-center gap-2"><Tag size={16} />Available Deals Today</p>
                      <div className="space-y-1">
                        {result.member.deals.map((deal: any) => (
                          <div key={deal.id} className="bg-green-900/30 border border-green-500/30 rounded-lg px-3 py-2">
                            <p className="text-white font-medium">{deal.title}</p>
                            {deal.description && <p className="text-green-300 text-sm">{deal.description}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.member?.lastCheckin && (
                    <div className="flex items-center gap-3 text-gray-400">
                      <Clock size={18} />
                      <p className="text-sm">Last visit: {formatDateTime(result.member.lastCheckin)}</p>
                    </div>
                  )}
                </div>
                <p className="text-green-400 text-sm mb-4">Membership Active · Entry Approved</p>
              </>
            ) : (
              <>
                <XCircle size={80} className="text-red-400 mx-auto mb-4" />
                <h1 className="text-5xl font-serif text-white mb-2">DENIED</h1>
                <p className="text-red-300 text-2xl mb-6">Entry Not Approved</p>

                <div className="bg-black/30 rounded-2xl p-6 mb-6">
                  {result.memberName && (
                    <p className="text-white text-2xl font-medium mb-4">{result.memberName}</p>
                  )}
                  <p className="text-red-300 text-lg">{result.message || 'Entry denied.'}</p>
                  <p className="text-gray-500 text-sm mt-2 capitalize">{result.reason?.replace(/_/g, ' ')}</p>
                </div>

                <a
                  href="tel:+18135550100"
                  className="inline-flex items-center gap-2 bg-red-700 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-xl text-lg transition-colors"
                >
                  <Phone size={20} />
                  Contact Manager
                </a>
              </>
            )}

            <button
              onClick={resetScanner}
              className="mt-4 flex items-center justify-center gap-2 w-full border border-white/20 text-white/60 hover:text-white hover:border-white/40 py-3 rounded-xl text-base transition-colors"
            >
              <RefreshCw size={18} />
              Scan Next Member
            </button>
          </div>
        </div>
      )}

      {verifying && (
        <div className="fixed inset-0 z-40 bg-charcoal-950/90 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-16 h-16 border-4 border-charcoal-700 border-t-gold-500 rounded-full mx-auto mb-4" />
            <p className="text-gold-500 text-2xl font-serif">Verifying...</p>
          </div>
        </div>
      )}

      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <Camera size={36} className="text-gold-500 mx-auto mb-2" />
          <h1 className="text-3xl font-serif text-gold-500 mb-1">Member Check-In</h1>
          <p className="text-gray-400">Scan member QR code to verify entry</p>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500/30 text-red-300 rounded-xl p-4 mb-6">{error}</div>
        )}

        <div className="bg-charcoal-900 border border-charcoal-700 rounded-2xl overflow-hidden mb-6">
          <div className="p-4">
            <div id="qr-reader" ref={scannerRef} className="w-full rounded-xl overflow-hidden" style={{ minHeight: scanning ? '320px' : '0' }} />
            {!scanning && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-40 h-40 border-2 border-dashed border-charcoal-600 rounded-xl flex items-center justify-center mb-6">
                  <Camera size={48} className="text-charcoal-500" />
                </div>
                <p className="text-gray-400 text-base mb-6 text-center">Click the button below to start<br />scanning member QR codes</p>
                <button
                  onClick={startScanner}
                  className="flex items-center gap-3 bg-gold-500 hover:bg-gold-600 text-black font-bold py-4 px-8 rounded-xl text-xl transition-colors"
                >
                  <Camera size={24} />
                  Start Scanner
                </button>
              </div>
            )}
          </div>
          {scanning && (
            <div className="px-4 pb-4">
              <p className="text-center text-gold-400 text-base mb-3 animate-pulse">Scanning... point camera at QR code</p>
              <button
                onClick={stopScanner}
                className="w-full border border-charcoal-600 text-gray-400 hover:text-white py-2.5 rounded-xl text-sm transition-colors"
              >
                Stop Scanner
              </button>
            </div>
          )}
        </div>

        <div className="bg-charcoal-900 border border-charcoal-700 rounded-2xl p-5">
          <h3 className="text-gold-500 font-serif text-lg mb-3">Instructions</h3>
          <ol className="text-gray-400 text-base space-y-2">
            <li>1. Start the scanner above</li>
            <li>2. Ask member to show their QR code from the member app</li>
            <li>3. Point camera at their QR code</li>
            <li>4. System verifies membership automatically</li>
            <li>5. Green screen = Entry approved, Red screen = Entry denied</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
