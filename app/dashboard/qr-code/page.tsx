'use client'
import { useState, useEffect, useCallback } from 'react'
import { QrCode, RefreshCw, Download, CheckCircle, XCircle, Clock, Shield, Archive } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatDateTime } from '@/lib/utils'

export default function QRCodePage() {
  const [qrData, setQrData] = useState<{ qrCode: any; qrDataUrl: string } | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [locker, setLocker] = useState<any>(null)
  const [checkins, setCheckins] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [message, setMessage] = useState('')

  const loadData = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [qrRes, profileRes, lockerRes, checkinRes] = await Promise.all([
      fetch('/api/member/qr'),
      supabase.from('profiles')
        .select('*, subscriptions(*, membership_plan:membership_plans(*))')
        .eq('user_id', user.id)
        .single(),
      supabase.from('locker_assignments')
        .select('*, locker:lockers(locker_number, location, status)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single(),
      fetch('/api/member/checkins'),
    ])

    const qrJson = await qrRes.json()
    const checkinJson = await checkinRes.json()

    setQrData(qrJson)
    setProfile(profileRes.data)
    setLocker(lockerRes.data)
    setCheckins(checkinJson.checkins || [])
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const refreshQR = async () => {
    setRefreshing(true)
    const res = await fetch('/api/member/qr', { method: 'POST' })
    const data = await res.json()
    setQrData(data)
    setMessage('QR code refreshed successfully.')
    setTimeout(() => setMessage(''), 3000)
    setRefreshing(false)
  }

  const downloadQR = () => {
    if (!qrData?.qrDataUrl) return
    const link = document.createElement('a')
    link.href = qrData.qrDataUrl
    link.download = `cigar-city-lounge-member-qr-${profile?.member_id || 'code'}.png`
    link.click()
  }

  const qrStatus = qrData?.qrCode?.status || 'unknown'
  const statusConfig = {
    active: { color: 'text-green-400', bg: 'bg-green-900/20 border-green-500/30', label: 'Active', Icon: CheckCircle },
    suspended: { color: 'text-red-400', bg: 'bg-red-900/20 border-red-500/30', label: 'Suspended', Icon: XCircle },
    expired: { color: 'text-orange-400', bg: 'bg-orange-900/20 border-orange-500/30', label: 'Expired', Icon: Clock },
    unknown: { color: 'text-gray-400', bg: 'bg-charcoal-800 border-charcoal-700', label: 'Unknown', Icon: Clock },
  }
  const statusInfo = statusConfig[qrStatus as keyof typeof statusConfig] || statusConfig.unknown
  const StatusIcon = statusInfo.Icon

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-10 h-10 border-2 border-charcoal-700 border-t-gold-500 rounded-full" />
      </div>
    )
  }

  const plan = profile?.subscriptions?.[0]?.membership_plan

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-serif text-gold-500 mb-1 flex items-center gap-3">
          <QrCode size={32} />
          My Lounge Entry QR Code
        </h1>
        <p className="text-gray-400">Use this QR code for lounge entry, member benefits, and locker access.</p>
      </div>

      {message && (
        <div className="bg-green-900/20 border border-green-500/30 text-green-300 rounded-xl p-4">{message}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-charcoal-900 border border-charcoal-700 rounded-2xl p-8">
          <div className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-xl shadow-2xl mb-6">
              {qrData?.qrDataUrl ? (
                <img src={qrData.qrDataUrl} alt="Member QR Code" className="w-56 h-56 block" />
              ) : (
                <div className="w-56 h-56 bg-gray-100 flex items-center justify-center rounded-lg">
                  <QrCode size={64} className="text-gray-400" />
                </div>
              )}
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${statusInfo.bg} ${statusInfo.color} mb-4`}>
              <StatusIcon size={16} />
              <span className="text-sm font-medium">QR Code {statusInfo.label}</span>
            </div>
            {qrData?.qrCode?.expires_at && (
              <p className="text-charcoal-400 text-sm mb-2">Expires: {formatDateTime(qrData.qrCode.expires_at)}</p>
            )}
            {qrData?.qrCode?.last_scanned_at && (
              <p className="text-charcoal-400 text-sm mb-6">Last scanned: {formatDateTime(qrData.qrCode.last_scanned_at)}</p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button onClick={refreshQR} disabled={refreshing} className="flex-1 flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-600 disabled:opacity-50 text-black font-bold py-3 px-5 rounded-xl text-base transition-colors">
                <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                {refreshing ? 'Refreshing...' : 'Refresh QR Code'}
              </button>
              <button onClick={downloadQR} className="flex-1 flex items-center justify-center gap-2 border border-charcoal-600 hover:border-gold-500 text-gray-300 hover:text-gold-500 font-bold py-3 px-5 rounded-xl text-base transition-colors">
                <Download size={18} />
                Download
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-charcoal-900 border border-charcoal-700 rounded-2xl p-6">
            <h2 className="text-xl font-serif text-gold-500 mb-4">Member Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-charcoal-800">
                <span className="text-charcoal-400 text-base">Name</span>
                <span className="text-white font-medium text-base">{profile?.first_name} {profile?.last_name}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-charcoal-800">
                <span className="text-charcoal-400 text-base">Member ID</span>
                <span className="text-gold-500 font-mono font-bold text-base">{profile?.member_id}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-charcoal-800">
                <span className="text-charcoal-400 text-base">Membership Plan</span>
                <span className="text-white text-base">{plan?.name || 'Unknown'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-charcoal-800">
                <span className="text-charcoal-400 text-base">Status</span>
                <span className={`text-base font-medium capitalize ${profile?.membership_status === 'active' ? 'text-green-400' : 'text-red-400'}`}>
                  {profile?.membership_status}
                </span>
              </div>
              {locker && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-charcoal-400 text-base flex items-center gap-2"><Archive size={16} />Locker</span>
                  <span className="text-white text-base">#{locker.locker?.locker_number}</span>
                </div>
              )}
            </div>
          </div>
          <div className="bg-charcoal-900 border border-charcoal-700 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Shield size={20} className="text-gold-500" />
              <h3 className="text-lg font-serif text-gold-500">QR Code Security</h3>
            </div>
            <ul className="text-charcoal-400 text-sm space-y-1.5">
              <li>• This QR code contains no personal information</li>
              <li>• Tokens are verified securely by our system</li>
              <li>• Automatically expires every 24 hours</li>
              <li>• Immediately invalidated if membership is cancelled</li>
              <li>• Refresh anytime if you suspect unauthorized use</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-gold-500/10 border border-gold-500/30 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <QrCode size={24} className="text-gold-500" />
          <h3 className="text-xl font-serif text-gold-500">How to Use Your QR Code</h3>
        </div>
        <p className="text-gray-300 text-lg leading-relaxed">
          Present this QR code at Cigar City Lounge for member entry, exclusive deals, locker verification, and lounge services.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {[
            { icon: '🚪', label: 'Lounge Entry' },
            { icon: '🔐', label: 'Locker Access' },
            { icon: '💰', label: 'Member Deals' },
            { icon: '🎉', label: 'Event Check-In' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 bg-charcoal-900 border border-charcoal-700 rounded-xl p-4">
              <span className="text-2xl">{item.icon}</span>
              <span className="text-white text-sm font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {checkins.length > 0 && (
        <div className="bg-charcoal-900 border border-charcoal-700 rounded-2xl p-6">
          <h2 className="text-xl font-serif text-gold-500 mb-4">Recent Visits</h2>
          <div className="space-y-3">
            {checkins.map((checkin: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-charcoal-800 last:border-0">
                <div>
                  <p className="text-white font-medium">{formatDateTime(checkin.check_in_time)}</p>
                  <p className="text-charcoal-400 text-sm">{checkin.location || 'Cigar City Lounge'}</p>
                </div>
                <span className="text-green-400 text-sm font-medium flex items-center gap-1">
                  <CheckCircle size={14} />
                  Approved
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
