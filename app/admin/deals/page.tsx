'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, AlertCircle, CheckCircle, Tag, X } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import Badge from '@/components/ui/Badge'

type Deal = {
  id: string; title: string; description: string | null; deal_type: string
  discount_value: number | null; eligible_plans: string[]; start_date: string | null
  end_date: string | null; usage_limit: number | null; per_member_limit: number
  is_active: boolean; terms: string | null; usage_count?: number
}

const DEAL_TYPES = [
  { value: 'percentage', label: 'Percentage Discount' },
  { value: 'fixed', label: 'Fixed Amount Off' },
  { value: 'bogo', label: 'Buy One Get One' },
  { value: 'free_entry', label: 'Free Entry' },
  { value: 'free_upgrade', label: 'Free Upgrade' },
  { value: 'event_discount', label: 'Event Discount' },
  { value: 'birthday', label: 'Birthday Special' },
  { value: 'vip_only', label: 'VIP Only' },
  { value: 'promotion', label: 'Promotion' },
]

const PLANS = ['classic', 'premium', 'elite']

const emptyForm = {
  title: '', description: '', deal_type: 'percentage', discount_value: '',
  eligible_plans: [] as string[], start_date: '', end_date: '',
  usage_limit: '', per_member_limit: '1', is_active: true, terms: '',
}

export default function AdminDealsPage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/deals')
    const data = await res.json()
    setDeals(data.deals || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 4000)
  }

  const openAdd = () => { setEditingDeal(null); setForm(emptyForm); setShowModal(true) }
  const openEdit = (deal: Deal) => {
    setEditingDeal(deal)
    setForm({
      title: deal.title, description: deal.description || '', deal_type: deal.deal_type,
      discount_value: deal.discount_value != null ? String(deal.discount_value) : '',
      eligible_plans: deal.eligible_plans || [],
      start_date: deal.start_date ? deal.start_date.split('T')[0] : '',
      end_date: deal.end_date ? deal.end_date.split('T')[0] : '',
      usage_limit: deal.usage_limit != null ? String(deal.usage_limit) : '',
      per_member_limit: String(deal.per_member_limit), is_active: deal.is_active, terms: deal.terms || '',
    })
    setShowModal(true)
  }
  const closeModal = () => { setShowModal(false); setEditingDeal(null); setForm(emptyForm) }
  const togglePlan = (plan: string) => setForm(f => ({ ...f, eligible_plans: f.eligible_plans.includes(plan) ? f.eligible_plans.filter(p => p !== plan) : [...f.eligible_plans, plan] }))

  const handleSave = async () => {
    if (!form.title.trim()) { showMessage('error', 'Title is required'); return }
    setSaving(true)
    const body = {
      title: form.title.trim(), description: form.description || null, deal_type: form.deal_type,
      discount_value: form.discount_value ? Number(form.discount_value) : null,
      eligible_plans: form.eligible_plans, start_date: form.start_date || null,
      end_date: form.end_date || null, usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
      per_member_limit: Number(form.per_member_limit) || 1, is_active: form.is_active, terms: form.terms || null,
    }
    try {
      const res = await fetch('/api/admin/deals', {
        method: editingDeal ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingDeal ? { id: editingDeal.id, ...body } : body),
      })
      const data = await res.json()
      if (!res.ok) showMessage('error', data.error || 'Save failed')
      else { showMessage('success', editingDeal ? 'Deal updated' : 'Deal created'); closeModal(); await load() }
    } catch { showMessage('error', 'Request failed.') }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    setDeleteId(id)
    try {
      const res = await fetch(`/api/admin/deals?id=${id}`, { method: 'DELETE' })
      if (res.ok) { showMessage('success', 'Deal deleted'); await load() }
      else { const data = await res.json(); showMessage('error', data.error || 'Delete failed') }
    } catch { showMessage('error', 'Request failed.') }
    setDeleteId(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-serif text-gold-500 mb-1">Member Deals</h1><p className="text-gray-400">{deals.length} total deals</p></div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-black font-bold py-2.5 px-5 rounded-lg text-sm transition-colors"><Plus size={18} />Add Deal</button>
      </div>

      {message && (
        <div className={`flex items-center gap-3 rounded-xl p-4 border ${message.type === 'success' ? 'bg-green-900/20 border-green-500/30 text-green-300' : 'bg-red-900/20 border-red-500/30 text-red-300'}`}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </div>
      )}

      <div className="bg-charcoal-900 border border-charcoal-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-charcoal-700">
              <th className="text-left p-4 text-charcoal-400 text-sm font-medium">Deal</th>
              <th className="text-left p-4 text-charcoal-400 text-sm font-medium">Type</th>
              <th className="text-left p-4 text-charcoal-400 text-sm font-medium">Plans</th>
              <th className="text-left p-4 text-charcoal-400 text-sm font-medium">Period</th>
              <th className="text-left p-4 text-charcoal-400 text-sm font-medium">Status</th>
              <th className="text-left p-4 text-charcoal-400 text-sm font-medium">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-charcoal-800">
              {loading ? (
                <tr><td colSpan={6} className="p-12 text-center"><div className="animate-spin w-8 h-8 border-2 border-charcoal-700 border-t-gold-500 rounded-full mx-auto" /></td></tr>
              ) : deals.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center"><Tag size={40} className="text-charcoal-600 mx-auto mb-3" /><p className="text-charcoal-400">No deals yet.</p></td></tr>
              ) : deals.map((deal) => (
                <tr key={deal.id} className="hover:bg-charcoal-800/50">
                  <td className="p-4">
                    <p className="text-white font-medium">{deal.title}</p>
                    {deal.discount_value != null && <p className="text-gold-400 text-xs">{deal.deal_type === 'percentage' ? `${deal.discount_value}% off` : `$${deal.discount_value} off`}</p>}
                  </td>
                  <td className="p-4"><Badge variant="gold">{DEAL_TYPES.find(d => d.value === deal.deal_type)?.label || deal.deal_type}</Badge></td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {deal.eligible_plans?.length > 0 ? deal.eligible_plans.map(p => <span key={p} className="text-xs bg-charcoal-800 text-gray-300 border border-charcoal-700 px-2 py-0.5 rounded capitalize">{p}</span>) : <span className="text-charcoal-500 text-xs">All</span>}
                    </div>
                  </td>
                  <td className="p-4 text-charcoal-400 text-sm">
                    {deal.start_date && <p>{formatDate(deal.start_date)}</p>}
                    {deal.end_date && <p className="text-xs">to {formatDate(deal.end_date)}</p>}
                  </td>
                  <td className="p-4">{deal.is_active ? <Badge variant="green">Active</Badge> : <Badge variant="gray">Inactive</Badge>}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(deal)} className="p-2 text-charcoal-400 hover:text-gold-400 hover:bg-charcoal-800 rounded-lg transition-colors"><Pencil size={16} /></button>
                      <button onClick={() => handleDelete(deal.id)} disabled={deleteId === deal.id} className="p-2 text-charcoal-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-charcoal-900 border border-charcoal-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-charcoal-700">
              <h2 className="text-2xl font-serif text-gold-500">{editingDeal ? 'Edit Deal' : 'Add Deal'}</h2>
              <button onClick={closeModal} className="text-charcoal-400 hover:text-white"><X size={24} /></button>
            </div>
            <div className="p-6 space-y-5">
              <div><label className="block text-gray-300 text-sm mb-1.5">Title <span className="text-red-400">*</span></label><input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. 20% Off Premium Cigars" className="w-full bg-charcoal-950 border border-charcoal-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold-500 placeholder:text-charcoal-500" /></div>
              <div><label className="block text-gray-300 text-sm mb-1.5">Description</label><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full bg-charcoal-950 border border-charcoal-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold-500 resize-none" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-gray-300 text-sm mb-1.5">Deal Type</label><select value={form.deal_type} onChange={e => setForm(f => ({ ...f, deal_type: e.target.value }))} className="w-full bg-charcoal-950 border border-charcoal-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold-500">{DEAL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
                <div><label className="block text-gray-300 text-sm mb-1.5">Discount Value</label><input type="number" min="0" value={form.discount_value} onChange={e => setForm(f => ({ ...f, discount_value: e.target.value }))} placeholder={form.deal_type === 'percentage' ? '20 (%)' : '10 ($)'} className="w-full bg-charcoal-950 border border-charcoal-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold-500 placeholder:text-charcoal-500" /></div>
              </div>
              <div><label className="block text-gray-300 text-sm mb-2">Eligible Plans</label><div className="flex gap-4">{PLANS.map(plan => <label key={plan} className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.eligible_plans.includes(plan)} onChange={() => togglePlan(plan)} className="w-4 h-4 rounded border-charcoal-600 bg-charcoal-950 accent-gold-500" /><span className="text-gray-300 text-sm capitalize">{plan}</span></label>)}</div></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-gray-300 text-sm mb-1.5">Start Date</label><input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} className="w-full bg-charcoal-950 border border-charcoal-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold-500" /></div>
                <div><label className="block text-gray-300 text-sm mb-1.5">End Date</label><input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} className="w-full bg-charcoal-950 border border-charcoal-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold-500" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-gray-300 text-sm mb-1.5">Usage Limit</label><input type="number" min="1" value={form.usage_limit} onChange={e => setForm(f => ({ ...f, usage_limit: e.target.value }))} placeholder="Unlimited" className="w-full bg-charcoal-950 border border-charcoal-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold-500 placeholder:text-charcoal-500" /></div>
                <div><label className="block text-gray-300 text-sm mb-1.5">Per Member Limit</label><input type="number" min="1" value={form.per_member_limit} onChange={e => setForm(f => ({ ...f, per_member_limit: e.target.value }))} className="w-full bg-charcoal-950 border border-charcoal-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold-500" /></div>
              </div>
              <div><label className="block text-gray-300 text-sm mb-1.5">Terms & Conditions</label><textarea value={form.terms} onChange={e => setForm(f => ({ ...f, terms: e.target.value }))} rows={2} className="w-full bg-charcoal-950 border border-charcoal-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold-500 resize-none" /></div>
              <div className="flex items-center gap-3"><input type="checkbox" id="is_active" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 accent-gold-500" /><label htmlFor="is_active" className="text-gray-300 text-sm cursor-pointer">Deal is active</label></div>
            </div>
            <div className="p-6 border-t border-charcoal-700 flex items-center justify-end gap-3">
              <button onClick={closeModal} className="px-5 py-2.5 border border-charcoal-600 text-gray-300 hover:text-white rounded-lg text-sm transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-gold-500 hover:bg-gold-600 text-black font-bold rounded-lg text-sm transition-colors disabled:opacity-50">{saving ? 'Saving...' : editingDeal ? 'Save Changes' : 'Create Deal'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
