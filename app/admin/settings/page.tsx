'use client'
import { useState, useEffect } from 'react'
import { Save, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function AdminSettingsPage() {
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

  const inputClass = "w-full bg-charcoal-950 border border-charcoal-700 text-white placeholder-charcoal-400 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-gold-500 transition-colors"

  const sections = [
    {
      title: 'Business Information',
      fields: [
        { key: 'business_address', label: 'Business Address', type: 'text' },
        { key: 'business_phone', label: 'Phone Number', type: 'text' },
        { key: 'business_email', label: 'Email Address', type: 'email' },
        { key: 'business_hours', label: 'Business Hours', type: 'text' },
      ],
    },
    {
      title: 'Website Content',
      fields: [
        { key: 'hero_title', label: 'Hero Title', type: 'text' },
        { key: 'hero_subtitle', label: 'Hero Subtitle', type: 'text' },
      ],
    },
    {
      title: 'Social Media',
      fields: [
        { key: 'instagram_url', label: 'Instagram URL', type: 'url' },
        { key: 'facebook_url', label: 'Facebook URL', type: 'url' },
      ],
    },
    {
      title: 'Membership Settings',
      fields: [
        { key: 'minimum_age', label: 'Minimum Age Requirement', type: 'number' },
      ],
    },
  ]

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-charcoal-700 border-t-gold-500 rounded-full" /></div>

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-gold-500 mb-1">Settings</h1>
          <p className="text-gray-400">Manage website content and configuration</p>
        </div>
        <button onClick={save} disabled={saving} className="flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-black font-bold py-2.5 px-5 rounded-lg text-sm disabled:opacity-50">
          {saved ? <><CheckCircle size={16} />Saved!</> : <><Save size={16} />{saving ? 'Saving...' : 'Save All Changes'}</>}
        </button>
      </div>

      {sections.map(section => (
        <div key={section.title} className="bg-charcoal-900 border border-charcoal-700 rounded-xl p-6">
          <h2 className="text-xl font-serif text-gold-500 mb-5">{section.title}</h2>
          <div className="space-y-4">
            {section.fields.map(field => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-300 mb-2">{field.label}</label>
                <input
                  type={field.type}
                  value={settings[field.key] || ''}
                  onChange={e => setSettings(s => ({ ...s, [field.key]: e.target.value }))}
                  className={inputClass}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
