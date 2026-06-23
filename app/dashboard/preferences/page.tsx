'use client'
import { useState, useEffect } from 'react'
import { Save, Plus, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function PreferencesPage() {
  const [prefs, setPrefs] = useState({
    favorite_brands: [] as string[],
    preferred_strength: '',
    preferred_wrapper: '',
    favorite_drink_pairing: '',
    notes: '',
  })
  const [newBrand, setNewBrand] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('cigar_preferences').select('*').eq('user_id', user.id).single()
      if (data) {
        setPrefs({
          favorite_brands: data.favorite_brands || [],
          preferred_strength: data.preferred_strength || '',
          preferred_wrapper: data.preferred_wrapper || '',
          favorite_drink_pairing: data.favorite_drink_pairing || '',
          notes: data.notes || '',
        })
      }
      setLoading(false)
    }
    load()
  }, [])

  const save = async () => {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('cigar_preferences').upsert({
      user_id: user.id,
      ...prefs,
      updated_at: new Date().toISOString(),
    })
    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 3000)
  }

  const addBrand = () => {
    if (newBrand.trim() && !prefs.favorite_brands.includes(newBrand.trim())) {
      setPrefs(p => ({ ...p, favorite_brands: [...p.favorite_brands, newBrand.trim()] }))
      setNewBrand('')
    }
  }

  const removeBrand = (brand: string) => {
    setPrefs(p => ({ ...p, favorite_brands: p.favorite_brands.filter(b => b !== brand) }))
  }

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin w-10 h-10 border-2 border-charcoal-700 border-t-gold-500 rounded-full" /></div>

  const inputClass = "w-full bg-charcoal-950 border border-charcoal-700 text-white placeholder-charcoal-400 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-gold-500 transition-colors"

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-serif text-gold-500 mb-1">Cigar Preferences</h1>
        <p className="text-gray-400">Help us personalize your lounge experience</p>
      </div>

      {saved && (
        <div className="bg-green-900/20 border border-green-500/30 text-green-300 rounded-xl p-4">
          Preferences saved successfully!
        </div>
      )}

      <div className="bg-charcoal-900 border border-charcoal-700 rounded-xl p-6 space-y-6">
        {/* Favorite brands */}
        <div>
          <label className="block text-base font-medium text-gray-300 mb-3">Favorite Cigar Brands</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {prefs.favorite_brands.map(brand => (
              <span key={brand} className="flex items-center gap-1.5 bg-gold-500/10 border border-gold-500/30 text-gold-400 text-sm px-3 py-1.5 rounded-full">
                {brand}
                <button onClick={() => removeBrand(brand)} className="hover:text-red-400 transition-colors"><X size={14} /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={newBrand} onChange={e => setNewBrand(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addBrand())} placeholder="Add a brand..." className={inputClass} />
            <button onClick={addBrand} className="bg-gold-500 hover:bg-gold-600 text-black font-bold px-4 py-3 rounded-lg transition-colors flex items-center gap-1">
              <Plus size={18} />
            </button>
          </div>
        </div>

        {/* Strength */}
        <div>
          <label className="block text-base font-medium text-gray-300 mb-2">Preferred Strength</label>
          <div className="grid grid-cols-3 gap-3">
            {['mild', 'medium', 'full'].map(s => (
              <button
                key={s}
                onClick={() => setPrefs(p => ({ ...p, preferred_strength: p.preferred_strength === s ? '' : s }))}
                className={`py-3 rounded-lg border font-medium text-base capitalize transition-all ${prefs.preferred_strength === s ? 'bg-gold-500 border-gold-500 text-black' : 'border-charcoal-700 text-gray-400 hover:border-gold-500'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {[
          { label: 'Preferred Wrapper', key: 'preferred_wrapper', placeholder: 'e.g., Connecticut, Maduro, Habano' },
          { label: 'Favorite Drink Pairing', key: 'favorite_drink_pairing', placeholder: 'e.g., Bourbon, Scotch, Rum' },
        ].map(field => (
          <div key={field.key}>
            <label className="block text-base font-medium text-gray-300 mb-2">{field.label}</label>
            <input value={(prefs as any)[field.key]} onChange={e => setPrefs(p => ({ ...p, [field.key]: e.target.value }))} placeholder={field.placeholder} className={inputClass} />
          </div>
        ))}

        <div>
          <label className="block text-base font-medium text-gray-300 mb-2">Additional Notes</label>
          <textarea value={prefs.notes} onChange={e => setPrefs(p => ({ ...p, notes: e.target.value }))} rows={4} className={`${inputClass} resize-y`} placeholder="Any additional preferences for our staff..." />
        </div>

        <button onClick={save} disabled={saving} className="w-full bg-gold-500 hover:bg-gold-600 text-black font-bold py-4 rounded-lg text-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
          <Save size={20} />
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  )
}
