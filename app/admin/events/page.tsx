'use client'
import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Users } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'

export default function AdminEventsPage() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', event_date: '', start_time: '', end_time: '',
    location: '', dress_code: '', capacity: '', is_members_only: false, status: 'upcoming',
  })

  useEffect(() => { loadEvents() }, [])

  async function loadEvents() {
    const supabase = createClient()
    const { data } = await supabase.from('events').select('*').order('event_date', { ascending: false })
    setEvents(data || [])
    setLoading(false)
  }

  const openAdd = () => {
    setEditing(null)
    setForm({ title: '', description: '', event_date: '', start_time: '', end_time: '', location: '', dress_code: '', capacity: '', is_members_only: false, status: 'upcoming' })
    setShowModal(true)
  }

  const openEdit = (event: any) => {
    setEditing(event)
    setForm({ title: event.title, description: event.description || '', event_date: event.event_date, start_time: event.start_time, end_time: event.end_time || '', location: event.location || '', dress_code: event.dress_code || '', capacity: event.capacity ? String(event.capacity) : '', is_members_only: event.is_members_only, status: event.status })
    setShowModal(true)
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    const payload = { ...form, capacity: form.capacity ? parseInt(form.capacity) : null, updated_at: new Date().toISOString() }
    if (editing) {
      await supabase.from('events').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('events').insert(payload)
    }
    setShowModal(false)
    await loadEvents()
    setSaving(false)
  }

  const deleteEvent = async (id: string) => {
    if (!confirm('Cancel this event?')) return
    const supabase = createClient()
    await supabase.from('events').update({ status: 'cancelled' }).eq('id', id)
    await loadEvents()
  }

  const inputClass = "w-full bg-charcoal-950 border border-charcoal-700 text-white placeholder-charcoal-400 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gold-500"
  const statusBadge = (s: string) => {
    if (s === 'upcoming') return <Badge variant="green">Upcoming</Badge>
    if (s === 'ongoing') return <Badge variant="blue">Ongoing</Badge>
    if (s === 'completed') return <Badge variant="gray">Completed</Badge>
    return <Badge variant="red">Cancelled</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-gold-500 mb-1">Events</h1>
          <p className="text-gray-400">{events.filter(e => e.status === 'upcoming').length} upcoming events</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-black font-bold py-2.5 px-5 rounded-lg text-sm">
          <Plus size={18} />
          Create Event
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-charcoal-700 border-t-gold-500 rounded-full" /></div>
      ) : (
        <div className="space-y-3">
          {events.length === 0 ? (
            <div className="bg-charcoal-900 border border-charcoal-700 rounded-xl p-12 text-center text-charcoal-400">No events yet. Create your first event.</div>
          ) : (
            events.map(event => (
              <div key={event.id} className="bg-charcoal-900 border border-charcoal-700 rounded-xl p-5 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    {statusBadge(event.status)}
                    {event.is_members_only && <Badge variant="gold">Members Only</Badge>}
                  </div>
                  <h3 className="text-white font-serif text-lg mb-1">{event.title}</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-charcoal-400">
                    <span>{formatDate(event.event_date)}</span>
                    <span>{event.start_time}</span>
                    {event.location && <span>{event.location}</span>}
                    {event.capacity && (
                      <span className="flex items-center gap-1">
                        <Users size={14} />
                        {event.rsvp_count || 0}/{event.capacity}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => openEdit(event)} className="p-2 bg-charcoal-800 hover:bg-charcoal-700 text-gray-300 rounded-lg transition-colors"><Edit size={15} /></button>
                  {event.status !== 'cancelled' && (
                    <button onClick={() => deleteEvent(event.id)} className="p-2 bg-charcoal-800 hover:bg-red-900/40 text-gray-300 hover:text-red-400 rounded-lg transition-colors"><Trash2 size={15} /></button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Event' : 'Create Event'} size="lg">
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Event Title *</label>
            <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Date *</label>
              <input type="date" required value={form.event_date} onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Start Time *</label>
              <input type="time" required value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">End Time</label>
              <input type="time" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Capacity</label>
              <input type="number" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} placeholder="Leave empty for unlimited" className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Location</label>
            <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className={`${inputClass} resize-none`} />
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-gray-300 text-sm">
              <input type="checkbox" checked={form.is_members_only} onChange={e => setForm(f => ({ ...f, is_members_only: e.target.checked }))} className="w-4 h-4 accent-gold-500" />
              Members Only
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="flex-1 bg-gold-500 hover:bg-gold-600 text-black font-bold py-2.5 rounded-lg text-sm">{saving ? 'Saving...' : (editing ? 'Update Event' : 'Create Event')}</button>
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-charcoal-600 text-gray-300 font-bold py-2.5 rounded-lg text-sm">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
