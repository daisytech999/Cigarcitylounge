'use client'
import { useState, useEffect } from 'react'
import { Save, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function AdminContentPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase.from('website_settings').select('*')
      const map: Record<string, string> = {}
      data?.forEach((s: any) => { map[s.key] = s.value })
      setSettings(map)
      setLoading(false)
    }
    load()
  }, [])

  const save = async () => {
    setSaving(true)
    const supabase = createClient()
    await Promise.all(
      Object.entries(settings).map(([key, value]) =>
        supabase.from('website_settings').upsert({ key, value, updated_at: new Date().toISOString() })
      )
    )
    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 3000)
  }

  const inputClass = "w-full bg-charcoal-950 border border-charcoal-700 text-white placeholder-charcoal-400 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold-500"

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-charcoal-700 border-t-gold-500 rounded-full" /></div>

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-gold-500 mb-1">Website Content</h1>
          <p className="text-gray-400">Edit homepage text and business information</p>
        </div>
        <button onClick={save} disabled={saving} className="flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-black font-bold py-2.5 px-5 rounded-lg text-sm disabled:opacity-50">
          {saved ? <><CheckCircle size={16} />Saved!</> : <><Save size={16} />{saving ? 'Saving...' : 'Save Changes'}</>}
        </button>
      </div>

      <div className="bg-charcoal-900 border border-charcoal-700 rounded-xl p-6">
        <h2 className="text-lg font-serif text-gold-500 mb-4">Hero Section</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Hero Title</label>
            <input value={settings.hero_title || ''} onChange={e => setSettings(s => ({ ...s, hero_title: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Hero Subtitle</label>
            <input value={settings.hero_subtitle || ''} onChange={e => setSettings(s => ({ ...s, hero_subtitle: e.target.value }))} className={inputClass} />
          </div>
        </div>
      </div>

      <div className="bg-charcoal-900 border border-charcoal-700 rounded-xl p-6">
        <h2 className="text-lg font-serif text-gold-500 mb-4">Contact Details</h2>
        <div className="space-y-4">
          {[
            { key: 'business_address', label: 'Business Address' },
            { key: 'business_phone', label: 'Phone Number' },
            { key: 'business_email', label: 'Email Address' },
            { key: 'business_hours', label: 'Business Hours' },
          ].map(field => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">{field.label}</label>
              <input value={settings[field.key] || ''} onChange={e => setSettings(s => ({ ...s, [field.key]: e.target.value }))} className={inputClass} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
