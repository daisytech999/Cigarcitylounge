'use client'
import { useState, useEffect } from 'react'
import { Archive, Clock, Send, Plus, RefreshCw, CheckCircle } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'

export default function LockerPage() {
  const [locker, setLocker] = useState<any>(null)
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [requestLoading, setRequestLoading] = useState(false)
  const [requestType, setRequestType] = useState<'new' | 'change' | 'additional'>('new')
  const [notes, setNotes] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [lockerRes, requestsRes] = await Promise.all([
        supabase.from('locker_assignments').select('*, locker:lockers(*)').eq('user_id', user.id).eq('status', 'active').single(),
        supabase.from('locker_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      ])

      setLocker(lockerRes.data)
      setRequests(requestsRes.data || [])
      setLoading(false)
    }
    load()
  }, [])

  const submitRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setRequestLoading(true)
    const res = await fetch('/api/dashboard/locker-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestType, notes }),
    })
    if (res.ok) {
      setSuccess('Your locker request has been submitted. Our team will contact you shortly.')
      setShowForm(false)
      setNotes('')
    }
    setRequestLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-10 h-10 border-2 border-charcoal-700 border-t-gold-500 rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-serif text-gold-500 mb-1">My Locker</h1>
        <p className="text-gray-400">Manage your personal storage locker</p>
      </div>

      {success && (
        <div className="bg-green-900/20 border border-green-500/30 text-green-300 rounded-xl p-5 flex gap-3">
          <CheckCircle size={22} className="shrink-0" />
          {success}
        </div>
      )}

      {/* Locker details */}
      {locker ? (
        <div className="bg-charcoal-900 border border-gold-500/40 rounded-xl p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-charcoal-400 text-sm uppercase tracking-wider mb-1">Your Locker</p>
              <h2 className="text-4xl font-serif text-gold-500 mb-2">#{locker.locker?.locker_number}</h2>
              <p className="text-gray-400 text-base">{locker.locker?.location || 'Main Floor'}</p>
            </div>
            <Archive size={48} className="text-gold-500/30" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Size', value: locker.locker?.size || 'Standard' },
              { label: 'Status', value: <Badge variant="green">Active</Badge> },
              { label: 'Assigned On', value: formatDate(locker.assigned_at) },
              { label: 'Type', value: locker.is_complimentary ? 'Complimentary' : 'Additional' },
            ].map((item, i) => (
              <div key={i} className="bg-charcoal-950 rounded-lg p-4">
                <p className="text-charcoal-400 text-sm mb-1">{item.label}</p>
                <p className="text-white font-medium text-base">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gold-500/5 border border-gold-500/20 rounded-lg">
            <p className="text-gold-400 font-medium mb-1">Locker Access Instructions</p>
            <p className="text-gray-400 text-base">Please visit the front desk on your next lounge visit to receive your locker key or combination. Keep your access credentials secure.</p>
          </div>
        </div>
      ) : (
        <div className="bg-charcoal-900 border border-charcoal-700 rounded-xl p-8 text-center">
          <Clock size={56} className="text-gold-500/40 mx-auto mb-4" />
          <h2 className="text-2xl font-serif text-white mb-3">Locker Pending Assignment</h2>
          <p className="text-gray-400 text-lg leading-relaxed max-w-lg mx-auto mb-6">
            Your complimentary locker is pending assignment. Our team will notify you once your locker has been assigned.
            This typically takes 1-3 business days.
          </p>
          <p className="text-charcoal-500 text-sm">
            Need your locker sooner? Submit a request below and our team will prioritize your assignment.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="bg-charcoal-900 border border-charcoal-700 rounded-xl p-6">
        <h3 className="text-xl font-serif text-gold-500 mb-4">Locker Requests</h3>

        {!showForm ? (
          <div className="flex flex-wrap gap-3">
            {!locker && (
              <button onClick={() => { setRequestType('new'); setShowForm(true) }} className="flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-black font-bold py-3 px-6 rounded-lg text-base transition-colors">
                <Send size={18} />
                Request Locker Assignment
              </button>
            )}
            {locker && (
              <>
                <button onClick={() => { setRequestType('change'); setShowForm(true) }} className="flex items-center gap-2 border border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-black font-bold py-3 px-6 rounded-lg text-base transition-all">
                  <RefreshCw size={18} />
                  Request Locker Change
                </button>
                <button onClick={() => { setRequestType('additional'); setShowForm(true) }} className="flex items-center gap-2 border border-charcoal-600 text-gray-300 hover:border-gold-500 hover:text-gold-500 font-bold py-3 px-6 rounded-lg text-base transition-all">
                  <Plus size={18} />
                  Request Additional Locker
                </button>
              </>
            )}
          </div>
        ) : (
          <form onSubmit={submitRequest} className="space-y-4">
            <div>
              <label className="block text-base font-medium text-gray-300 mb-2">Request Type</label>
              <select value={requestType} onChange={e => setRequestType(e.target.value as any)} className="w-full bg-charcoal-950 border border-charcoal-700 text-white rounded-lg px-4 py-3 text-base focus:outline-none focus:border-gold-500">
                <option value="new">New Locker Assignment</option>
                <option value="change">Change Locker</option>
                <option value="additional">Request Additional Locker</option>
              </select>
            </div>
            <div>
              <label className="block text-base font-medium text-gray-300 mb-2">Notes (Optional)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full bg-charcoal-950 border border-charcoal-700 text-white placeholder-charcoal-400 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-gold-500" placeholder="Any specific requests or notes for our team..." />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={requestLoading} className="bg-gold-500 hover:bg-gold-600 text-black font-bold py-3 px-6 rounded-lg text-base transition-colors disabled:opacity-50">
                {requestLoading ? 'Submitting...' : 'Submit Request'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="border border-charcoal-600 text-gray-300 hover:border-gold-500 font-bold py-3 px-6 rounded-lg text-base transition-colors">
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Past requests */}
        {requests.length > 0 && (
          <div className="mt-6 space-y-3">
            <h4 className="text-charcoal-400 text-sm uppercase tracking-wider">Previous Requests</h4>
            {requests.map((req: any) => (
              <div key={req.id} className="flex items-center justify-between p-3 bg-charcoal-950 rounded-lg">
                <div>
                  <p className="text-white text-base capitalize">{req.request_type} Request</p>
                  <p className="text-charcoal-400 text-sm">{formatDate(req.created_at)}</p>
                </div>
                <Badge variant={req.status === 'approved' ? 'green' : req.status === 'denied' ? 'red' : 'orange'}>
                  {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
