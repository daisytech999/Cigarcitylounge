'use client'
import { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, Users, Check, X } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'

export default function DashboardEventsPage() {
  const [events, setEvents] = useState<any[]>([])
  const [myRSVPs, setMyRSVPs] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [rsvpLoading, setRsvpLoading] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [eventsRes, rsvpRes] = await Promise.all([
        supabase.from('events').select('*').neq('status', 'cancelled').order('event_date', { ascending: true }),
        supabase.from('event_rsvps').select('event_id').eq('user_id', user.id).eq('status', 'confirmed'),
      ])

      setEvents(eventsRes.data || [])
      setMyRSVPs(rsvpRes.data?.map((r: any) => r.event_id) || [])
      setLoading(false)
    }
    load()
  }, [])

  const handleRSVP = async (eventId: string, action: 'rsvp' | 'cancel') => {
    setRsvpLoading(eventId)
    await fetch('/api/dashboard/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, action }),
    })

    setMyRSVPs(prev =>
      action === 'rsvp' ? [...prev, eventId] : prev.filter(id => id !== eventId)
    )
    setRsvpLoading(null)
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin w-10 h-10 border-2 border-charcoal-700 border-t-gold-500 rounded-full" /></div>
  }

  const upcoming = events.filter(e => e.status === 'upcoming')
  const past = events.filter(e => e.status === 'completed')

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif text-gold-500 mb-1">Events</h1>
        <p className="text-gray-400">Browse and RSVP to upcoming lounge events</p>
      </div>

      {/* Upcoming */}
      <div>
        <h2 className="text-2xl font-serif text-white mb-6 flex items-center gap-3">
          <Calendar size={24} className="text-gold-500" />
          Upcoming Events
        </h2>
        {upcoming.length === 0 ? (
          <div className="bg-charcoal-900 border border-charcoal-700 rounded-xl p-12 text-center">
            <Calendar size={48} className="text-charcoal-600 mx-auto mb-4" />
            <p className="text-white text-xl mb-2">No Upcoming Events</p>
            <p className="text-gray-400">Check back soon for new events!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcoming.map(event => {
              const isRSVPd = myRSVPs.includes(event.id)
              const isFull = event.capacity && event.rsvp_count >= event.capacity && !isRSVPd
              return (
                <div key={event.id} className="bg-charcoal-900 border border-charcoal-700 hover:border-gold-500/30 rounded-xl p-6 transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex gap-2 mb-2 flex-wrap">
                        {event.is_members_only && <Badge variant="gold">Members Only</Badge>}
                        {isRSVPd && <Badge variant="green">RSVP'd</Badge>}
                        {isFull && <Badge variant="red">Full</Badge>}
                      </div>
                      <h3 className="text-xl font-serif text-white mb-3">{event.title}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-400">
                        <span className="flex items-center gap-2"><Calendar size={14} className="text-gold-500" />{formatDate(event.event_date)}</span>
                        <span className="flex items-center gap-2"><Clock size={14} className="text-gold-500" />{event.start_time}</span>
                        {event.location && <span className="flex items-center gap-2"><MapPin size={14} className="text-gold-500" />{event.location}</span>}
                        {event.capacity && <span className="flex items-center gap-2"><Users size={14} className="text-gold-500" />{event.rsvp_count}/{event.capacity} attending</span>}
                      </div>
                      {event.description && <p className="text-gray-400 text-sm mt-3 line-clamp-2">{event.description}</p>}
                    </div>
                    <div className="flex items-center">
                      {isRSVPd ? (
                        <button
                          onClick={() => handleRSVP(event.id, 'cancel')}
                          disabled={rsvpLoading === event.id}
                          className="border border-red-500/50 text-red-400 hover:bg-red-900/20 font-bold py-3 px-6 rounded-lg text-base transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                          <X size={18} />
                          Cancel RSVP
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRSVP(event.id, 'rsvp')}
                          disabled={rsvpLoading === event.id || !!isFull}
                          className="bg-gold-500 hover:bg-gold-600 text-black font-bold py-3 px-6 rounded-lg text-base transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                          <Check size={18} />
                          {isFull ? 'Full' : 'RSVP'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
