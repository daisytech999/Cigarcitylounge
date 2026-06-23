'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Plug, PlugZap, RefreshCw, AlertCircle, CheckCircle, Settings, X, Clock } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import Badge from '@/components/ui/Badge'

type POSIntegration = { id: string; provider: string; display_name: string; webhook_url: string | null; settings: Record<string, any>; is_enabled: boolean; last_synced_at: string | null }
type SyncLog = { id: string; status: string; message: string | null; created_at: string; integration?: { display_name: string; provider: string } }

const PROVIDERS = [
  { value: 'square', label: 'Square' }, { value: 'clover', label: 'Clover' },
  { value: 'toast', label: 'Toast' }, { value: 'lightspeed', label: 'Lightspeed' },
  { value: 'shopify', label: 'Shopify POS' }, { value: 'custom', label: 'Custom / Webhook' },
]

const emptyForm = { provider: 'square', display_name: '', webhook_url: '', settings: '{}' }

export default function AdminPOSPage() {
  const [integrations, setIntegrations] = useState<POSIntegration[]>([])
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [settingsError, setSettingsError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/pos')
    const data = await res.json()
    setIntegrations(data.integrations || [])
    setSyncLogs(data.syncLogs || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const showMessage = (type: 'success' | 'error', text: string) => { setMessage({ type, text }); setTimeout(() => setMessage(null), 4000) }

  const validateSettings = (val: string): boolean => {
    try { JSON.parse(val); setSettingsError(''); return true } catch { setSettingsError('Invalid JSON'); return false }
  }

  const handleAdd = async () => {
    if (!form.display_name.trim()) { showMessage('error', 'Display name is required'); return }
    if (!validateSettings(form.settings)) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/pos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ provider: form.provider, display_name: form.display_name.trim(), webhook_url: form.webhook_url || null, settings: JSON.parse(form.settings) }) })
      const data = await res.json()
      if (!res.ok) showMessage('error', data.error || 'Failed')
      else { showMessage('success', 'Integration added'); setShowForm(false); setForm(emptyForm); await load() }
    } catch { showMessage('error', 'Request failed.') }
    setSaving(false)
  }

  const handleToggle = async (id: string, currentEnabled: boolean) => {
    setTogglingId(id)
    try {
      const res = await fetch('/api/admin/pos', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, is_enabled: !currentEnabled }) })
      const data = await res.json()
      if (!res.ok) showMessage('error', data.error || 'Toggle failed')
      else { showMessage('success', currentEnabled ? 'Disabled' : 'Enabled'); await load() }
    } catch { showMessage('error', 'Request failed.') }
    setTogglingId(null)
  }

  const providerLabel = (val: string) => PROVIDERS.find(p => p.value === val)?.label || val

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-serif text-gold-500 mb-1">POS Integration</h1><p className="text-gray-400">Connect point-of-sale systems for member transactions</p></div>
        <div className="flex items-center gap-3">
          <button onClick={load} className="flex items-center gap-2 border border-charcoal-600 text-gray-300 hover:text-white hover:border-gold-500 py-2.5 px-4 rounded-lg text-sm transition-colors"><RefreshCw size={16} />Refresh</button>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-black font-bold py-2.5 px-5 rounded-lg text-sm transition-colors"><Plus size={18} />Add Integration</button>
        </div>
      </div>

      {message && (
        <div className={`flex items-center gap-3 rounded-xl p-4 border ${message.type === 'success' ? 'bg-green-900/20 border-green-500/30 text-green-300' : 'bg-red-900/20 border-red-500/30 text-red-300'}`}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </div>
      )}

      {showForm && (
        <div className="bg-charcoal-900 border border-gold-500/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-serif text-gold-500">Add POS Integration</h2>
            <button onClick={() => { setShowForm(false); setForm(emptyForm); setSettingsError('') }} className="text-charcoal-400 hover:text-white"><X size={22} /></button>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div><label className="block text-gray-300 text-sm mb-1.5">Provider</label><select value={form.provider} onChange={e => setForm(f => ({ ...f, provider: e.target.value }))} className="w-full bg-charcoal-950 border border-charcoal-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold-500">{PROVIDERS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}</select></div>
            <div><label className="block text-gray-300 text-sm mb-1.5">Display Name <span className="text-red-400">*</span></label><input type="text" value={form.display_name} onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))} placeholder="e.g. Main Bar Square" className="w-full bg-charcoal-950 border border-charcoal-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold-500 placeholder:text-charcoal-500" /></div>
          </div>
          <div className="mb-4"><label className="block text-gray-300 text-sm mb-1.5">Webhook URL</label><input type="url" value={form.webhook_url} onChange={e => setForm(f => ({ ...f, webhook_url: e.target.value }))} placeholder="https://your-pos.example.com/webhook" className="w-full bg-charcoal-950 border border-charcoal-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold-500 placeholder:text-charcoal-500" /></div>
          <div className="mb-5"><label className="block text-gray-300 text-sm mb-1.5">Settings (JSON){settingsError && <span className="text-red-400 ml-2 text-xs">{settingsError}</span>}</label><textarea value={form.settings} onChange={e => { setForm(f => ({ ...f, settings: e.target.value })); validateSettings(e.target.value) }} rows={4} className={`w-full bg-charcoal-950 border text-white rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none resize-none ${settingsError ? 'border-red-500/60' : 'border-charcoal-700 focus:border-gold-500'}`} /></div>
          <div className="flex justify-end gap-3">
            <button onClick={() => { setShowForm(false); setForm(emptyForm) }} className="px-5 py-2.5 border border-charcoal-600 text-gray-300 hover:text-white rounded-lg text-sm">Cancel</button>
            <button onClick={handleAdd} disabled={saving} className="px-6 py-2.5 bg-gold-500 hover:bg-gold-600 text-black font-bold rounded-lg text-sm disabled:opacity-50">{saving ? 'Connecting...' : 'Connect Integration'}</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-lg font-serif text-white">Connected Integrations</h2>
        {loading ? (
          <div className="bg-charcoal-900 border border-charcoal-700 rounded-xl p-12 text-center"><div className="animate-spin w-8 h-8 border-2 border-charcoal-700 border-t-gold-500 rounded-full mx-auto" /></div>
        ) : integrations.length === 0 ? (
          <div className="bg-charcoal-900 border border-charcoal-700 rounded-xl p-12 text-center"><PlugZap size={40} className="text-charcoal-600 mx-auto mb-3" /><p className="text-charcoal-400">No integrations connected yet.</p></div>
        ) : integrations.map((integration) => (
          <div key={integration.id} className={`bg-charcoal-900 border rounded-xl p-5 ${integration.is_enabled ? 'border-charcoal-700' : 'border-charcoal-800 opacity-70'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${integration.is_enabled ? 'bg-green-900/30' : 'bg-charcoal-800'}`}>
                  <Plug size={20} className={integration.is_enabled ? 'text-green-400' : 'text-charcoal-500'} />
                </div>
                <div>
                  <p className="text-white font-medium">{integration.display_name}</p>
                  <p className="text-charcoal-400 text-sm">{providerLabel(integration.provider)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {integration.last_synced_at && <div className="flex items-center gap-1.5 text-charcoal-400 text-xs"><Clock size={13} />Last sync: {formatDateTime(integration.last_synced_at)}</div>}
                <button onClick={() => handleToggle(integration.id, integration.is_enabled)} disabled={togglingId === integration.id} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${integration.is_enabled ? 'bg-gold-500' : 'bg-charcoal-700'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${integration.is_enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
            {Object.keys(integration.settings || {}).length > 0 && (
              <div className="mt-3 pt-3 border-t border-charcoal-800"><div className="flex items-center gap-2 text-charcoal-400 text-xs"><Settings size={13} />Config keys: {Object.keys(integration.settings).join(', ')}</div></div>
            )}
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-serif text-white mb-3">Recent Sync Logs</h2>
        <div className="bg-charcoal-900 border border-charcoal-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-charcoal-700">
                <th className="text-left p-4 text-charcoal-400 text-sm font-medium">Integration</th>
                <th className="text-left p-4 text-charcoal-400 text-sm font-medium">Status</th>
                <th className="text-left p-4 text-charcoal-400 text-sm font-medium">Message</th>
                <th className="text-left p-4 text-charcoal-400 text-sm font-medium">Time</th>
              </tr></thead>
              <tbody className="divide-y divide-charcoal-800">
                {syncLogs.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-charcoal-400 text-sm">No sync logs yet</td></tr>
                ) : syncLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-charcoal-800/50">
                    <td className="p-4"><p className="text-white text-sm">{log.integration?.display_name || '—'}</p><p className="text-charcoal-500 text-xs">{log.integration?.provider}</p></td>
                    <td className="p-4">{log.status === 'success' ? <Badge variant="green">Success</Badge> : <Badge variant="red">Error</Badge>}</td>
                    <td className="p-4 text-charcoal-400 text-sm">{log.message || '—'}</td>
                    <td className="p-4 text-charcoal-400 text-sm">{formatDateTime(log.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
