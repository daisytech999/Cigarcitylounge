import { createAdminClient } from '@/lib/supabase/admin'
import PublicLayout from '@/components/layout/PublicLayout'
import { Calendar, Clock, MapPin, Users } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export const revalidate = 60

export default async function EventsPage() {
  const supabase = createAdminClient()
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .neq('status', 'cancelled')
    .order('event_date', { ascending: true })

  const upcoming = events?.filter(e => e.status === 'upcoming') || []
  const past = events?.filter(e => e.status === 'completed') || []

  return (
    <PublicLayout>
      <div className="pt-24 min-h-screen bg-charcoal-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-16">
            <p className="text-gold-500 text-sm tracking-widest uppercase mb-4">Member Events</p>
            <h1 className="text-5xl md:text-6xl font-serif text-white mb-6">
              Events at <span className="text-gold-500">Cigar City Lounge</span>
            </h1>
            <div className="w-20 h-1 bg-gold-500 mx-auto mb-6" />
            <p className="text-gray-400 text-xl max-w-2xl mx-auto">
              Join us for exclusive tastings, gatherings, and member experiences.
              Members can RSVP through their dashboard.
            </p>
          </div>

          {/* Upcoming */}
          <div className="mb-16">
            <h2 className="text-3xl font-serif text-gold-500 mb-8 flex items-center gap-3">
              <Calendar size={28} />
              Upcoming Events
            </h2>

            {upcoming.length === 0 ? (
              <div className="text-center py-16 bg-charcoal-900 border border-charcoal-700 rounded-xl">
                <Calendar size={48} className="text-charcoal-600 mx-auto mb-4" />
                <h3 className="text-2xl font-serif text-white mb-2">No Upcoming Events</h3>
                <p className="text-gray-400 text-lg mb-6">Check back soon! New events are added regularly.</p>
                <Link href="/membership" className="btn-gold">Become a Member</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {upcoming.map(event => (
                  <div key={event.id} className="bg-charcoal-900 border border-charcoal-700 hover:border-gold-500/50 rounded-xl overflow-hidden transition-all">
                    {event.banner_image_url ? (
                      <img src={event.banner_image_url} alt={event.title} className="w-full aspect-video object-cover" />
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-leather-700/20 to-charcoal-950 flex items-center justify-center text-6xl">🎉</div>
                    )}
                    <div className="p-6">
                      <div className="flex gap-2 mb-3 flex-wrap">
                        {event.is_members_only && <Badge variant="gold">Members Only</Badge>}
                        <Badge variant="green">Upcoming</Badge>
                      </div>
                      <h3 className="text-2xl font-serif text-white mb-4">{event.title}</h3>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-gray-300">
                          <Calendar size={16} className="text-gold-500" />
                          <span>{formatDate(event.event_date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <Clock size={16} className="text-gold-500" />
                          <span>{event.start_time}{event.end_time ? ` - ${event.end_time}` : ''}</span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-2 text-gray-300">
                            <MapPin size={16} className="text-gold-500" />
                            <span>{event.location}</span>
                          </div>
                        )}
                        {event.capacity && (
                          <div className="flex items-center gap-2 text-gray-300">
                            <Users size={16} className="text-gold-500" />
                            <span>{event.rsvp_count || 0}/{event.capacity} attending</span>
                          </div>
                        )}
                      </div>
                      {event.description && (
                        <p className="text-gray-400 text-base leading-relaxed mb-6 line-clamp-3">{event.description}</p>
                      )}
                      {event.dress_code && (
                        <p className="text-sm text-charcoal-400 mb-4">Dress Code: <span className="text-gray-300">{event.dress_code}</span></p>
                      )}
                      {event.is_members_only ? (
                        <Link href="/login" className="btn-gold w-full flex justify-center">RSVP as Member</Link>
                      ) : (
                        <Link href="/login" className="btn-outline-gold w-full flex justify-center">RSVP to Event</Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past events */}
          {past.length > 0 && (
            <div>
              <h2 className="text-3xl font-serif text-charcoal-400 mb-8">Past Events</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {past.slice(0, 6).map(event => (
                  <div key={event.id} className="bg-charcoal-900 border border-charcoal-800 rounded-xl overflow-hidden opacity-70">
                    <div className="aspect-video bg-gradient-to-br from-charcoal-800 to-charcoal-950 flex items-center justify-center text-4xl">🎉</div>
                    <div className="p-4">
                      <h3 className="text-white font-serif text-lg mb-2">{event.title}</h3>
                      <p className="text-charcoal-400 text-sm">{formatDate(event.event_date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Become a member CTA */}
          <div className="mt-20 bg-gradient-to-r from-charcoal-900 via-charcoal-800 to-charcoal-900 border border-gold-500/30 rounded-xl p-12 text-center">
            <h2 className="text-4xl font-serif text-white mb-4">Never Miss an Event</h2>
            <p className="text-gray-400 text-xl mb-8 max-w-2xl mx-auto">
              Members receive early access and can RSVP directly from their dashboard.
            </p>
            <Link href="/membership" className="btn-gold text-lg px-10 py-5">
              Become a Member Today
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
