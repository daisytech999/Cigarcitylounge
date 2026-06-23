'use client'
import { useState } from 'react'
import PublicLayout from '@/components/layout/PublicLayout'
import { MapPin, Phone, Mail, Clock, CheckCircle, AlertCircle } from 'lucide-react'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setStatus('success')
        setForm({ name: '', email: '', phone: '', subject: '', message: '' })
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
    setLoading(false)
  }

  return (
    <PublicLayout>
      <div className="pt-24 min-h-screen bg-charcoal-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-16">
            <p className="text-gold-500 text-sm tracking-widest uppercase mb-4">Get in Touch</p>
            <h1 className="text-5xl md:text-6xl font-serif text-white mb-6">
              Contact <span className="text-gold-500">Us</span>
            </h1>
            <div className="w-20 h-1 bg-gold-500 mx-auto" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              {[
                { icon: MapPin, title: 'Our Location', content: '[ADD BUSINESS ADDRESS]' },
                { icon: Phone, title: 'Phone', content: '[ADD PHONE NUMBER]', href: 'tel:ADD_PHONE' },
                { icon: Mail, title: 'Email', content: '[ADD BUSINESS EMAIL]', href: 'mailto:ADD_EMAIL' },
                { icon: Clock, title: 'Hours', content: '[ADD BUSINESS HOURS]' },
              ].map(({ icon: Icon, title, content, href }) => (
                <div key={title} className="flex gap-4">
                  <div className="w-12 h-12 bg-gold-500/10 border border-gold-500/20 rounded-full flex items-center justify-center shrink-0">
                    <Icon size={22} className="text-gold-500" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-1">{title}</h3>
                    {href ? (
                      <a href={href} className="text-gray-400 hover:text-gold-500 transition-colors text-base">{content}</a>
                    ) : (
                      <p className="text-gray-400 text-base">{content}</p>
                    )}
                  </div>
                </div>
              ))}

              <div className="bg-charcoal-900 border border-charcoal-700 rounded-xl p-6 mt-8">
                <h3 className="text-gold-500 font-serif text-xl mb-3">Need Immediate Help?</h3>
                <p className="text-gray-400 text-base mb-4">Call us directly during business hours for the fastest response.</p>
                <a href="tel:ADD_PHONE" className="btn-gold w-full flex items-center justify-center gap-2">
                  <Phone size={18} />
                  Call Now
                </a>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-charcoal-900 border border-charcoal-700 rounded-xl p-8">
                <h2 className="text-2xl font-serif text-gold-500 mb-6">Send Us a Message</h2>

                {status === 'success' && (
                  <div className="bg-green-900/20 border border-green-500/30 text-green-300 rounded-lg p-4 flex gap-3 mb-6">
                    <CheckCircle size={20} className="shrink-0" />
                    <div>
                      <p className="font-semibold">Message Sent!</p>
                      <p className="text-sm">We'll get back to you as soon as possible.</p>
                    </div>
                  </div>
                )}

                {status === 'error' && (
                  <div className="bg-red-900/20 border border-red-500/30 text-red-300 rounded-lg p-4 flex gap-3 mb-6">
                    <AlertCircle size={20} className="shrink-0" />
                    <p>Failed to send message. Please call us directly.</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { label: 'Your Name', key: 'name', type: 'text', required: true },
                      { label: 'Email Address', key: 'email', type: 'email', required: true },
                      { label: 'Phone Number', key: 'phone', type: 'tel', required: false },
                      { label: 'Subject', key: 'subject', type: 'text', required: true },
                    ].map(field => (
                      <div key={field.key}>
                        <label className="block text-base font-medium text-gray-300 mb-2">
                          {field.label} {field.required && <span className="text-gold-500">*</span>}
                        </label>
                        <input
                          type={field.type}
                          required={field.required}
                          value={(form as any)[field.key]}
                          onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                          className="w-full bg-charcoal-950 border border-charcoal-700 text-white placeholder-charcoal-400 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-gold-500 transition-colors"
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-base font-medium text-gray-300 mb-2">
                      Message <span className="text-gold-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={6}
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      className="w-full bg-charcoal-950 border border-charcoal-700 text-white placeholder-charcoal-400 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-gold-500 transition-colors resize-y"
                      placeholder="How can we help you?"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-gold w-full py-4 text-lg flex items-center justify-center gap-2"
                  >
                    {loading ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
