'use client'
import { useState, useEffect } from 'react'
import { Plus, Search, Archive } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'

export default function AdminLockersPage() {
  const [lockers, setLockers] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedLocker, setSelectedLocker] = useState<any>(null)
  const [selectedMember, setSelectedMember] = useState('')
  const [newLocker, setNewLocker] = useState({ locker_number: '', size: 'medium', location: '' })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const supabase = createClient()
    const [lockersRes, requestsRes, membersRes] = await Promise.all([
      supabase.from('lockers').select('*').order('locker_number'),
      supabase.from('locker_requests').select('*, profile:profiles(first_name, last_name, email, member_id)').eq('status', 'pending').order('created_at'),
      supabase.from('profiles').select('user_id, first_name, last_name, email, member_id').eq('membership_status', 'active').order('first_name'),
    ])
    setLockers(lockersRes.data || [])
    setRequests(requestsRes.data || [])
    setMembers(membersRes.data || [])
    setLoading(false)
  }

  const statusBadge = (status: string) => {
    const map: Record<string, any> = {
      available: <Badge variant="green">Available</Badge>,
      assigned: <Badge variant="blue">Assigned</Badge>,
      pending_assignment: <Badge variant="orange">Pending</Badge>,
      maintenance: <Badge variant="red">Maintenance</Badge>,
      reserved: <Badge variant="gray">Reserved</Badge>,
      unavailable: <Badge variant="red">Unavailable</Badge>,
    }
    return map[status] || <Badge variant="gray">{status}</Badge>
  }

  const addLocker = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    await supabase.from('lockers').insert(newLocker)
    setShowAddModal(false)
    setNewLocker({ locker_number: '', size: 'medium', location: '' })
    await loadData()
    setSaving(false)
  }

  const assignLocker = async () => {
    if (!selectedLocker || !selectedMember) return
    setSaving(true)
    const res = await fetch('/api/admin/lockers/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lockerId: selectedLocker.id, memberId: selectedMember, isComplimentary: true }),
    })
    if (res.ok) {
      setMessage('Locker assigned successfully! Member has been notified.')
      setShowAssignModal(false)
      await loadData()
    }
    setSaving(false)
  }

  const updateLockerStatus = async (lockerId: string, status: string) => {
    const supabase = createClient()
    await supabase.from('lockers').update({ status, updated_at: new Date().toISOString() }).eq('id', lockerId)
    await loadData()
  }

  const filtered = lockers.filter(l =>
    l.locker_number.toLowerCase().includes(search.toLowerCase()) ||
    l.location?.toLowerCase().includes(search.toLowerCase())
  )

  const inputClass = "w-full bg-charcoal-950 border border-charcoal-700 text-white placeholder-charcoal-400 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gold-500"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-gold-500 mb-1">Lockers</h1>
          <p className="text-gray-400">{lockers.filter(l => l.status === 'available').length} available of {lockers.length} total</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-black font-bold py-2.5 px-5 rounded-lg text-sm transition-colors">
          <Plus size={18} />
          Add Locker
        </button>
      </div>

      {message && (
        <div className="bg-green-900/20 border border-green-500/30 text-green-300 rounded-xl p-4">{message}</div>
      )}

      {/* Pending requests */}
      {requests.length > 0 && (
        <div className="bg-orange-900/10 border border-orange-500/30 rounded-xl p-5">
          <h2 className="text-xl font-serif text-orange-400 mb-4 flex items-center gap-2">
            <Archive size={20} />
            Pending Locker Requests ({requests.length})
          </h2>
          <div className="space-y-3">
            {requests.map((req: any) => (
              <div key={req.id} className="flex items-center justify-between bg-charcoal-900 rounded-lg p-4">
                <div>
                  <p className="text-white font-medium">{req.profile?.first_name} {req.profile?.last_name}</p>
                  <p className="text-charcoal-400 text-sm">{req.profile?.email} · {req.profile?.member_id}</p>
                  <p className="text-orange-400 text-xs mt-1 capitalize">{req.request_type} request · {formatDate(req.created_at)}</p>
                  {req.notes && <p className="text-gray-400 text-xs mt-1">Note: {req.notes}</p>}
                </div>
                <button
                  onClick={() => { setSelectedMember(req.user_id); setShowAssignModal(true) }}
                  className="bg-gold-500 hover:bg-gold-600 text-black font-bold py-2 px-4 rounded-lg text-sm"
                >
                  Assign Locker
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" size={18} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search lockers..." className="w-full bg-charcoal-900 border border-charcoal-700 text-white placeholder-charcoal-400 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-gold-500" />
      </div>

      {/* Lockers grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-charcoal-700 border-t-gold-500 rounded-full" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(locker => (
            <div key={locker.id} className="bg-charcoal-900 border border-charcoal-700 rounded-xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-gold-500 font-bold text-xl">#{locker.locker_number}</p>
                  <p className="text-charcoal-400 text-xs capitalize">{locker.size} · {locker.location || 'No location'}</p>
                </div>
                {statusBadge(locker.status)}
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {locker.status === 'available' && (
                  <button onClick={() => { setSelectedLocker(locker); setShowAssignModal(true) }} className="text-xs bg-gold-500 hover:bg-gold-600 text-black font-bold px-3 py-1.5 rounded-lg transition-colors">Assign</button>
                )}
                {locker.status !== 'maintenance' && (
                  <button onClick={() => updateLockerStatus(locker.id, 'maintenance')} className="text-xs border border-orange-500/50 text-orange-400 hover:bg-orange-900/20 px-3 py-1.5 rounded-lg transition-colors">Maintenance</button>
                )}
                {locker.status === 'maintenance' && (
                  <button onClick={() => updateLockerStatus(locker.id, 'available')} className="text-xs border border-green-500/50 text-green-400 hover:bg-green-900/20 px-3 py-1.5 rounded-lg transition-colors">Mark Available</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add locker modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Locker">
        <form onSubmit={addLocker} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Locker Number *</label>
            <input required value={newLocker.locker_number} onChange={e => setNewLocker(l => ({ ...l, locker_number: e.target.value }))} placeholder="e.g., A-101" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Size</label>
            <select value={newLocker.size} onChange={e => setNewLocker(l => ({ ...l, size: e.target.value }))} className={inputClass}>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Location</label>
            <input value={newLocker.location} onChange={e => setNewLocker(l => ({ ...l, location: e.target.value }))} placeholder="e.g., Main Floor, Room B" className={inputClass} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="flex-1 bg-gold-500 hover:bg-gold-600 text-black font-bold py-2.5 rounded-lg text-sm">
              {saving ? 'Adding...' : 'Add Locker'}
            </button>
            <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 border border-charcoal-600 text-gray-300 font-bold py-2.5 rounded-lg text-sm">Cancel</button>
          </div>
        </form>
      </Modal>

      {/* Assign locker modal */}
      <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title={`Assign Locker ${selectedLocker ? '#' + selectedLocker.locker_number : ''}`}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Select Member *</label>
            <select value={selectedMember} onChange={e => setSelectedMember(e.target.value)} className={inputClass}>
              <option value="">Choose a member...</option>
              {members.map(m => (
                <option key={m.user_id} value={m.user_id}>{m.first_name} {m.last_name} ({m.member_id})</option>
              ))}
            </select>
          </div>
          {!selectedLocker && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Select Locker *</label>
              <select value={selectedLocker?.id || ''} onChange={e => setSelectedLocker(lockers.find(l => l.id === e.target.value))} className={inputClass}>
                <option value="">Choose an available locker...</option>
                {lockers.filter(l => l.status === 'available').map(l => (
                  <option key={l.id} value={l.id}>#{l.locker_number} — {l.size} — {l.location || 'No location'}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button onClick={assignLocker} disabled={saving || !selectedMember} className="flex-1 bg-gold-500 hover:bg-gold-600 text-black font-bold py-2.5 rounded-lg text-sm disabled:opacity-50">
              {saving ? 'Assigning...' : 'Assign Locker'}
            </button>
            <button onClick={() => setShowAssignModal(false)} className="flex-1 border border-charcoal-600 text-gray-300 font-bold py-2.5 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
