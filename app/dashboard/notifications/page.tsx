'use client'
import { useState, useEffect } from 'react'
import { Bell, CheckCheck, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      setNotifications(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const markRead = async (id?: string) => {
    await fetch('/api/notifications/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationId: id }),
    })
    setNotifications(prev =>
      id ? prev.map(n => n.id === id ? { ...n, is_read: true } : n) : prev.map(n => ({ ...n, is_read: true }))
    )
  }

  const typeIcon = (type: string) => {
    const colors = { success: 'bg-green-400', error: 'bg-red-400', warning: 'bg-orange-400', info: 'bg-blue-400' }
    return <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${colors[type as keyof typeof colors] || 'bg-blue-400'}`} />
  }

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin w-10 h-10 border-2 border-charcoal-700 border-t-gold-500 rounded-full" /></div>

  const unread = notifications.filter(n => !n.is_read)

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-gold-500 mb-1">Notifications</h1>
          <p className="text-gray-400">{unread.length} unread message{unread.length !== 1 ? 's' : ''}</p>
        </div>
        {unread.length > 0 && (
          <button onClick={() => markRead()} className="flex items-center gap-2 text-gold-500 hover:text-gold-400 text-sm transition-colors">
            <CheckCheck size={18} />
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-charcoal-900 border border-charcoal-700 rounded-xl p-16 text-center">
          <Bell size={56} className="text-charcoal-600 mx-auto mb-4" />
          <h3 className="text-xl font-serif text-white mb-2">No Notifications</h3>
          <p className="text-gray-400">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(notif => (
            <div key={notif.id} className={`bg-charcoal-900 border rounded-xl p-5 flex gap-4 transition-all ${!notif.is_read ? 'border-gold-500/20' : 'border-charcoal-700'}`}>
              <div className="mt-2">{typeIcon(notif.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className={`font-semibold text-base mb-1 ${!notif.is_read ? 'text-white' : 'text-gray-300'}`}>{notif.title}</p>
                    <p className="text-gray-400 text-base">{notif.message}</p>
                    <p className="text-charcoal-500 text-sm mt-2">{formatDate(notif.created_at)}</p>
                  </div>
                  {!notif.is_read && (
                    <button onClick={() => markRead(notif.id)} className="text-gold-500 hover:text-gold-400 transition-colors shrink-0">
                      <Check size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
