'use client'
import { useState, useEffect } from 'react'
import Badge from '@/components/ui/Badge'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'

export default function AdminSupportPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('open')
  const [updating, setUpdating] = useState<string | null>(null)
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({})

  useEffect(() => { loadRequests() }, [filter])

  async function loadRequests() {
    setLoading(true)
    const supabase = createClient()
    let query = supabase.from('support_requests').select('*, profile:profiles(first_name, last_name, email, member_id)').order('created_at', { ascending: false })
    if (filter !== 'all') query = query.eq('status', filter)
    const { data } = await query
    setRequests(data || [])
    setLoading(false)
  }

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id)
    const supabase = createClient()
    await supabase.from('support_requests').update({ status, admin_notes: adminNotes[id], updated_at: new Date().toISOString() }).eq('id', id)
    await loadRequests()
    setUpdating(null)
  }

  const statusBadge = (s: string) => {
    if (s === 'open') return <Badge variant="orange">Open</Badge>
    if (s === 'in_progress') return <Badge variant="blue">In Progress</Badge>
    if (s === 'resolved') return <Badge variant="green">Resolved</Badge>
    return <Badge variant="gray">Closed</Badge>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif text-gold-500 mb-1">Support Requests</h1>
        <p className="text-gray-400">{requests.length} {filter === 'all' ? 'total' : filter} requests</p>
      </div>

      <div className="flex gap-2">
        {['open', 'in_progress', 'resolved', 'all'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${filter === f ? 'bg-gold-500 text-black' : 'bg-charcoal-800 text-gray-300 hover:text-white'}`}>
            {f === 'in_progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-charcoal-700 border-t-gold-500 rounded-full" /></div>
      ) : (
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="bg-charcoal-900 border border-charcoal-700 rounded-xl p-12 text-center text-charcoal-400">No {filter} requests</div>
          ) : (
            requests.map(req => (
              <div key={req.id} className="bg-charcoal-900 border border-charcoal-700 rounded-xl p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      {statusBadge(req.status)}
                      <span className="text-charcoal-400 text-xs capitalize">{req.category}</span>
                    </div>
                    <h3 className="text-white font-semibold text-base mb-1">{req.subject}</h3>
                    <p className="text-charcoal-400 text-xs">{req.profile?.first_name} {req.profile?.last_name} · {req.profile?.email} · {formatDate(req.created_at)}</p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm bg-charcoal-950 rounded-lg p-3 mb-4">{req.message}</p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-charcoal-400 mb-1.5">Staff Response / Notes</label>
                    <textarea
                      value={adminNotes[req.id] ?? (req.admin_notes || '')}
                      onChange={e => setAdminNotes(n => ({ ...n, [req.id]: e.target.value }))}
                      rows={2}
                      className="w-full bg-charcoal-950 border border-charcoal-700 text-white placeholder-charcoal-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold-500 resize-none"
                      placeholder="Add a response or notes..."
                    />
                  </div>
                  <div className="flex gap-2">
                    {req.status !== 'in_progress' && <button onClick={() => updateStatus(req.id, 'in_progress')} disabled={updating === req.id} className="text-xs bg-blue-900/30 text-blue-400 border border-blue-500/30 hover:bg-blue-900/50 font-medium px-3 py-1.5 rounded-lg">Mark In Progress</button>}
                    {req.status !== 'resolved' && <button onClick={() => updateStatus(req.id, 'resolved')} disabled={updating === req.id} className="text-xs bg-green-900/30 text-green-400 border border-green-500/30 hover:bg-green-900/50 font-medium px-3 py-1.5 rounded-lg">Mark Resolved</button>}
                    {req.status !== 'closed' && <button onClick={() => updateStatus(req.id, 'closed')} disabled={updating === req.id} className="text-xs bg-charcoal-800 text-charcoal-400 font-medium px-3 py-1.5 rounded-lg">Close</button>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
