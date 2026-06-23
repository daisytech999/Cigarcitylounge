'use client'
import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Star, Eye, EyeOff } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'

export default function AdminCigarsPage() {
  const [cigars, setCigars] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    brand: '', name: '', size: '', strength: 'medium', wrapper: '', binder: '', filler: '',
    country_of_origin: '', flavor_notes: '', price: '', price_display: 'Ask Staff',
    availability_status: 'available', is_featured: false, is_new_arrival: false,
    is_member_only: false, description: '',
  })

  useEffect(() => { loadCigars() }, [])

  async function loadCigars() {
    const supabase = createClient()
    const { data } = await supabase.from('cigars').select('*, images:cigar_images(*)').order('brand').order('name')
    setCigars(data || [])
    setLoading(false)
  }

  const openAdd = () => {
    setEditing(null)
    setForm({ brand: '', name: '', size: '', strength: 'medium', wrapper: '', binder: '', filler: '', country_of_origin: '', flavor_notes: '', price: '', price_display: 'Ask Staff', availability_status: 'available', is_featured: false, is_new_arrival: false, is_member_only: false, description: '' })
    setShowModal(true)
  }

  const openEdit = (cigar: any) => {
    setEditing(cigar)
    setForm({
      brand: cigar.brand, name: cigar.name, size: cigar.size || '', strength: cigar.strength || 'medium',
      wrapper: cigar.wrapper || '', binder: cigar.binder || '', filler: cigar.filler || '',
      country_of_origin: cigar.country_of_origin || '', flavor_notes: cigar.flavor_notes || '',
      price: cigar.price ? String(cigar.price) : '', price_display: cigar.price_display || 'Ask Staff',
      availability_status: cigar.availability_status, is_featured: cigar.is_featured,
      is_new_arrival: cigar.is_new_arrival, is_member_only: cigar.is_member_only,
      description: cigar.description || '',
    })
    setShowModal(true)
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    const payload = { ...form, price: form.price ? parseFloat(form.price) : null, updated_at: new Date().toISOString() }

    if (editing) {
      await supabase.from('cigars').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('cigars').insert({ ...payload, is_active: true })
    }
    setShowModal(false)
    await loadCigars()
    setSaving(false)
  }

  const deleteCigar = async (id: string) => {
    if (!confirm('Are you sure you want to delete this cigar?')) return
    const supabase = createClient()
    await supabase.from('cigars').update({ is_active: false }).eq('id', id)
    await loadCigars()
  }

  const toggleFeatured = async (cigar: any) => {
    const supabase = createClient()
    await supabase.from('cigars').update({ is_featured: !cigar.is_featured }).eq('id', cigar.id)
    await loadCigars()
  }

  const inputClass = "w-full bg-charcoal-950 border border-charcoal-700 text-white placeholder-charcoal-400 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gold-500"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-gold-500 mb-1">Cigar List</h1>
          <p className="text-gray-400">{cigars.length} cigars in catalog</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-black font-bold py-2.5 px-5 rounded-lg text-sm">
          <Plus size={18} />
          Add Cigar
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-charcoal-700 border-t-gold-500 rounded-full" /></div>
      ) : (
        <div className="bg-charcoal-900 border border-charcoal-700 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-charcoal-700">
                {['Cigar', 'Strength', 'Price', 'Status', 'Featured', 'Actions'].map(h => (
                  <th key={h} className="text-left p-4 text-charcoal-400 text-sm font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-800">
              {cigars.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center text-charcoal-400">No cigars yet. Add your first cigar.</td></tr>
              ) : (
                cigars.map(cigar => (
                  <tr key={cigar.id} className="hover:bg-charcoal-800/50 transition-colors">
                    <td className="p-4">
                      <p className="text-gold-400 text-xs uppercase tracking-wider">{cigar.brand}</p>
                      <p className="text-white font-medium">{cigar.name}</p>
                      {cigar.size && <p className="text-charcoal-400 text-xs">{cigar.size}</p>}
                    </td>
                    <td className="p-4 text-gray-300 text-sm capitalize">{cigar.strength}</td>
                    <td className="p-4 text-gold-500 text-sm">{cigar.price ? formatCurrency(cigar.price) : cigar.price_display}</td>
                    <td className="p-4">
                      {cigar.availability_status === 'available' ? <Badge variant="green">Available</Badge> :
                       cigar.availability_status === 'limited' ? <Badge variant="orange">Limited</Badge> :
                       <Badge variant="red">Out of Stock</Badge>}
                    </td>
                    <td className="p-4">
                      <button onClick={() => toggleFeatured(cigar)} className={`p-1.5 rounded transition-colors ${cigar.is_featured ? 'text-gold-500 bg-gold-500/10' : 'text-charcoal-500 hover:text-gold-500'}`}>
                        <Star size={16} fill={cigar.is_featured ? 'currentColor' : 'none'} />
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(cigar)} className="p-2 bg-charcoal-800 hover:bg-charcoal-700 text-gray-300 rounded-lg transition-colors"><Edit size={15} /></button>
                        <button onClick={() => deleteCigar(cigar.id)} className="p-2 bg-charcoal-800 hover:bg-red-900/40 text-gray-300 hover:text-red-400 rounded-lg transition-colors"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Cigar' : 'Add Cigar'} size="lg">
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Brand *</label>
              <input required value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Name *</label>
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Size</label>
              <input value={form.size} onChange={e => setForm(f => ({ ...f, size: e.target.value }))} placeholder="e.g., Robusto 5x50" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Strength</label>
              <select value={form.strength} onChange={e => setForm(f => ({ ...f, strength: e.target.value }))} className={inputClass}>
                <option value="mild">Mild</option>
                <option value="medium">Medium</option>
                <option value="full">Full</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Wrapper</label>
              <input value={form.wrapper} onChange={e => setForm(f => ({ ...f, wrapper: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Country of Origin</label>
              <input value={form.country_of_origin} onChange={e => setForm(f => ({ ...f, country_of_origin: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Price ($)</label>
              <input type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="Leave empty for 'Ask Staff'" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Status</label>
              <select value={form.availability_status} onChange={e => setForm(f => ({ ...f, availability_status: e.target.value }))} className={inputClass}>
                <option value="available">Available</option>
                <option value="limited">Limited</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Flavor Notes</label>
            <input value={form.flavor_notes} onChange={e => setForm(f => ({ ...f, flavor_notes: e.target.value }))} placeholder="e.g., Cedar, leather, coffee, cream" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className={`${inputClass} resize-none`} />
          </div>
          <div className="flex gap-4">
            {[
              { key: 'is_featured', label: 'Featured' },
              { key: 'is_new_arrival', label: 'New Arrival' },
              { key: 'is_member_only', label: 'Members Only' },
            ].map(checkbox => (
              <label key={checkbox.key} className="flex items-center gap-2 cursor-pointer text-gray-300 text-sm">
                <input type="checkbox" checked={(form as any)[checkbox.key]} onChange={e => setForm(f => ({ ...f, [checkbox.key]: e.target.checked }))} className="w-4 h-4 accent-gold-500" />
                {checkbox.label}
              </label>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="flex-1 bg-gold-500 hover:bg-gold-600 text-black font-bold py-2.5 rounded-lg text-sm">
              {saving ? 'Saving...' : (editing ? 'Update Cigar' : 'Add Cigar')}
            </button>
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-charcoal-600 text-gray-300 font-bold py-2.5 rounded-lg text-sm">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
