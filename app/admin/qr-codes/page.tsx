'use client'
import { useState, useEffect, useCallback } from 'react'
import { Search, RefreshCw, ShieldOff, ShieldCheck, QrCode, AlertCircle, CheckCircle } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import Badge from '@/components/ui/Badge'

type QRCode = {
  id: string
  member_id: string
  status: 'active' | 'suspended' | 'expired'
  last_scanned_at: string | null
  expires_at: string | null
  profile?: { first_name: string; last_name: string; member_id: string; membership_plan: string }
}

export default function AdminQRCodesPage() {
  const [qrCodes, setQrCodes] = useState<QRCode[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (search) params.set('search', search)
    const res = await fetch(`/api/admin/qr?${params}`)
    const data = await res.json()
    setQrCodes(data.qrCodes || [])
    setTotal(data.total || 0)
    setLoading(false)
  }, [page, search])

  useEffect(() => { load() }, [load])

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 4000)
  }

  const handleAction = async (id: string, action: 'suspend' | 'activate' | 'regenerate') => {
    setActionLoading(`${id}-${action}`)
    try {
      const res = await fetch('/api/admin/qr', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      })
      const data = await res.json()
      if (!res.ok) showMessage('error', data.error || 'Action failed')
      else { showMessage('success', data.message || 'Action completed'); await load() }
    } catch {
      showMessage('error', 'Request failed. Please try again.')
    }
    setActionLoading(null)
  }

  const statusBadge = (status: string) => {
    if (status === 'active') return <Badge variant="green">Active</Badge>
    if (status === 'suspended') return <Badge variant="red">Suspended</Badge>
    return <Badge variant="gray">Expired</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-gold-500 mb-1">QR Code Management</h1>
          <p className="text-gray-400">{total} total QR codes</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 border border-charcoal-600 text-gray-300 hover:text-white hover:border-gold-500 py-2.5 px-4 rounded-lg text-sm transition-colors">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {message && (
        <div className={`flex items-center gap-3 rounded-xl p-4 border ${message.type === 'success' ? 'bg-green-900/20 border-green-500/30 text-green-300' : 'bg-red-900/20 border-red-500/30 text-red-300'}`}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </div>
      )}

      <div className="bg-charcoal-900 border border-charcoal-700 rounded-xl p-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
          <input type="text" placeholder="Search by member name or ID..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} className="w-full bg-charcoal-950 border border-charcoal-700 text-white rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-gold-500 placeholder:text-charcoal-500" />
        </div>
      </div>

      <div className="bg-charcoal-900 border border-charcoal-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-charcoal-700">
                <th className="text-left p-4 text-charcoal-400 text-sm font-medium">Member</th>
                <th className="text-left p-4 text-charcoal-400 text-sm font-medium">Plan</th>
                <th className="text-left p-4 text-charcoal-400 text-sm font-medium">Status</th>
                <th className="text-left p-4 text-charcoal-400 text-sm font-medium">Last Scanned</th>
                <th className="text-left p-4 text-charcoal-400 text-sm font-medium">Expires</th>
                <th className="text-left p-4 text-charcoal-400 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-800">
              {loading ? (
                <tr><td colSpan={6} className="p-12 text-center"><div className="animate-spin w-8 h-8 border-2 border-charcoal-700 border-t-gold-500 rounded-full mx-auto" /></td></tr>
              ) : qrCodes.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center"><QrCode size={40} className="text-charcoal-600 mx-auto mb-3" /><p className="text-charcoal-400">No QR codes found</p></td></tr>
              ) : qrCodes.map((qr) => (
                <tr key={qr.id} className="hover:bg-charcoal-800/50">
                  <td className="p-4">
                    <p className="text-white font-medium">{qr.profile?.first_name} {qr.profile?.last_name}</p>
                    <p className="text-charcoal-400 text-xs font-mono">{qr.profile?.member_id}</p>
                  </td>
                  <td className="p-4 text-gray-300 text-sm capitalize">{qr.profile?.membership_plan}</td>
                  <td className="p-4">{statusBadge(qr.status)}</td>
                  <td className="p-4 text-charcoal-400 text-sm">{qr.last_scanned_at ? formatDateTime(qr.last_scanned_at) : '—'}</td>
                  <td className="p-4 text-charcoal-400 text-sm">{qr.expires_at ? formatDateTime(qr.expires_at) : '—'}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {qr.status === 'active' ? (
                        <button onClick={() => handleAction(qr.id, 'suspend')} disabled={actionLoading === `${qr.id}-suspend`} className="flex items-center gap-1.5 text-xs bg-red-900/30 hover:bg-red-900/50 border border-red-500/30 text-red-400 py-1.5 px-3 rounded-lg transition-colors disabled:opacity-50">
                          <ShieldOff size={14} /> Suspend
                        </button>
                      ) : (
                        <button onClick={() => handleAction(qr.id, 'activate')} disabled={actionLoading === `${qr.id}-activate`} className="flex items-center gap-1.5 text-xs bg-green-900/30 hover:bg-green-900/50 border border-green-500/30 text-green-400 py-1.5 px-3 rounded-lg transition-colors disabled:opacity-50">
                          <ShieldCheck size={14} /> Activate
                        </button>
                      )}
                      <button onClick={() => handleAction(qr.id, 'regenerate')} disabled={actionLoading === `${qr.id}-regenerate`} className="flex items-center gap-1.5 text-xs bg-charcoal-800 hover:bg-charcoal-700 border border-charcoal-600 text-gray-300 py-1.5 px-3 rounded-lg transition-colors disabled:opacity-50">
                        <RefreshCw size={14} className={actionLoading === `${qr.id}-regenerate` ? 'animate-spin' : ''} /> Regenerate
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
