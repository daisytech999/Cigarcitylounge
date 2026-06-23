'use client'
import { useState, useEffect } from 'react'
import { Send, Phone, Mail, MessageSquare } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'

export default function SupportPage() {
  const [form, setForm] = useState({ subject: '', message: '', category: 'other' })
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('support_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      setRequests(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.subject.trim() || !form.message.trim()) {
      setError('Please fill in all required fields.')
      return
    }
    setSubmitting(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error: dbError } = await supabase.from('support_requests').insert({
      user_id: user.id,
      subject: form.subject,
      message: form.message,
      category: form.category,
    })

    if (dbError) {
      setError('Failed to submit request. Please call us directly.')
    } else {
      setSuccess('Your support request has been submitted. Our team will respond shortly.')
      setForm({ subject: '', message: '', category: 'other' })
      const { data } = await supabase.from('support_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      setRequests(data || [])
    }
    setSubmitting(false)
  }

  const inputClass = "w-full bg-charcoal-950 border border-charcoal-700 text-white placeholder-charcoal-400 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-gold-500 transition-colors"
  const statusBadge = (s: string) => {
    if (s === 'resolved') return <Badge variant="green">Resolved</Badge>
    if (s === 'in_progress') return <Badge variant="blue">In Progress</Badge>
    if (s === 'open') return <Badge variant="orange">Open</Badge>
    return <Badge variant="gray">Closed</Badge>
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-serif text-gold-500 mb-1">Support</h1>
        <p className="text-gray-400">Get help from our team</p>
      </div>

      {/* Direct contact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a href="tel:ADD_PHONE" className="flex items-center gap-4 bg-charcoal-900 border border-charcoal-700 hover:border-gold-500/50 rounded-xl p-5 transition-all">
          <div className="w-12 h-12 bg-gold-500/10 rounded-full flex items-center justify-center shrink-0">
            <Phone size={22} className="text-gold-500" />
          </div>
          <div>
            <p className="text-white font-semibold text-base">Call Us</p>
            <p className="text-gold-500 text-sm">[ADD PHONE NUMBER]</p>
          </div>
        </a>
        <a href="mailto:ADD_EMAIL" className="flex items-center gap-4 bg-charcoal-900 border border-charcoal-700 hover:border-gold-500/50 rounded-xl p-5 transition-all">
          <div className="w-12 h-12 bg-gold-500/10 rounded-full flex items-center justify-center shrink-0">
            <Mail size={22} className="text-gold-500" />
          </div>
          <div>
            <p className="text-white font-semibold text-base">Email Us</p>
            <p className="text-gold-500 text-sm">[ADD BUSINESS EMAIL]</p>
          </div>
        </a>
      </div>

      {/* Support form */}
      <div className="bg-charcoal-900 border border-charcoal-700 rounded-xl p-6">
        <h2 className="text-xl font-serif text-gold-500 mb-6 flex items-center gap-2">
          <MessageSquare size={22} />
          Submit a Support Request
        </h2>

        {success && <div className="bg-green-900/20 border border-green-500/30 text-green-300 rounded-lg p-4 mb-6">{success}</div>}
        {error && <div className="bg-red-900/20 border border-red-500/30 text-red-300 rounded-lg p-4 mb-6">{error}</div>}

        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="block text-base font-medium text-gray-300 mb-2">Category</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={inputClass}>
              <option value="membership">Membership</option>
              <option value="locker">Locker</option>
              <option value="billing">Billing</option>
              <option value="account">Account</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-base font-medium text-gray-300 mb-2">Subject <span className="text-gold-500">*</span></label>
            <input type="text" required value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Brief description of your issue" className={inputClass} />
          </div>
          <div>
            <label className="block text-base font-medium text-gray-300 mb-2">Message <span className="text-gold-500">*</span></label>
            <textarea required rows={5} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Describe your issue in detail..." className={`${inputClass} resize-y`} />
          </div>
          <button type="submit" disabled={submitting} className="w-full bg-gold-500 hover:bg-gold-600 text-black font-bold py-4 rounded-lg text-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
            <Send size={20} />
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>

      {/* Past requests */}
      {requests.length > 0 && (
        <div className="bg-charcoal-900 border border-charcoal-700 rounded-xl">
          <div className="p-6 border-b border-charcoal-700">
            <h2 className="text-xl font-serif text-gold-500">Previous Requests</h2>
          </div>
          <div className="divide-y divide-charcoal-800">
            {requests.map((req: any) => (
              <div key={req.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-base mb-1">{req.subject}</p>
                    <p className="text-gray-400 text-sm line-clamp-2 mb-2">{req.message}</p>
                    <p className="text-charcoal-500 text-xs">{formatDate(req.created_at)} · {req.category}</p>
                    {req.admin_notes && (
                      <div className="mt-3 bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                        <p className="text-blue-400 text-sm font-medium mb-1">Staff Response:</p>
                        <p className="text-gray-300 text-sm">{req.admin_notes}</p>
                      </div>
                    )}
                  </div>
                  {statusBadge(req.status)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
