'use client'
import { useState, useEffect, useCallback } from 'react'
import { Calendar, Download, CheckCircle, XCircle } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import Badge from '@/components/ui/Badge'

export default function AdminCheckInsPage() {
  const [checkins, setCheckins] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [page, setPage] = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ date, page: String(page) })
    const res = await fetch(`/api/admin/checkins?${params}`)
    const data = await res.json()
    setCheckins(data.checkins || [])
    setTotal(data.total || 0)
    setLoading(false)
  }, [date, page])

  useEffect(() => { load() }, [load])

  const exportCSV = () => {
    const rows = [
      ['Member', 'Member ID', 'Check-in Time', 'Location', 'Status', 'Scanned By'].join(','),
      ...checkins.map(c => [
        `"${c.profile?.first_name} ${c.profile?.last_name}"`,
        c.profile?.member_id || '',
        c.check_in_time,
        c.location || '',
        c.entry_status,
        `"${c.staff?.first_name || ''} ${c.staff?.last_name || ''}"`,
      ].join(',')),
    ]
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `checkins-${date}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const approved = checkins.filter(c => c.entry_status === 'approved').length
  const denied = checkins.filter(c => c.entry_status === 'denied').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-gold-500 mb-1">Member Check-Ins</h1>
          <p className="text-gray-400">{total} total records</p>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 border border-charcoal-600 text-gray-300 hover:text-white hover:border-gold-500 py-2.5 px-4 rounded-lg text-sm transition-colors">
          <Download size={16} />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-charcoal-900 border border-charcoal-700 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-white">{total}</p>
          <p className="text-charcoal-400 text-sm">Total Scans</p>
        </div>
        <div className="bg-charcoal-900 border border-green-500/20 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-green-400">{approved}</p>
          <p className="text-charcoal-400 text-sm">Approved</p>
        </div>
        <div className="bg-charcoal-900 border border-red-500/20 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-red-400">{denied}</p>
          <p className="text-charcoal-400 text-sm">Denied</p>
        </div>
      </div>

      <div className="bg-charcoal-900 border border-charcoal-700 rounded-xl p-4 flex items-center gap-4">
        <Calendar size={20} className="text-gold-500 shrink-0" />
        <input type="date" value={date} onChange={e => { setDate(e.target.value); setPage(1) }} className="bg-charcoal-950 border border-charcoal-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold-500" />
        <span className="text-charcoal-400 text-sm">Showing check-ins for selected date</span>
      </div>

      <div className="bg-charcoal-900 border border-charcoal-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-charcoal-700">
                <th className="text-left p-4 text-charcoal-400 text-sm font-medium">Member</th>
                <th className="text-left p-4 text-charcoal-400 text-sm font-medium">Time</th>
                <th className="text-left p-4 text-charcoal-400 text-sm font-medium">Location</th>
                <th className="text-left p-4 text-charcoal-400 text-sm font-medium">Status</th>
                <th className="text-left p-4 text-charcoal-400 text-sm font-medium">Staff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-800">
              {loading ? (
                <tr><td colSpan={5} className="p-12 text-center"><div className="animate-spin w-8 h-8 border-2 border-charcoal-700 border-t-gold-500 rounded-full mx-auto" /></td></tr>
              ) : checkins.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-charcoal-400">No check-ins found for this date</td></tr>
              ) : checkins.map((c: any) => (
                <tr key={c.id} className="hover:bg-charcoal-800/50">
                  <td className="p-4">
                    <p className="text-white font-medium">{c.profile?.first_name} {c.profile?.last_name}</p>
                    <p className="text-charcoal-400 text-xs font-mono">{c.profile?.member_id}</p>
                  </td>
                  <td className="p-4 text-gray-300 text-sm">{formatDateTime(c.check_in_time)}</td>
                  <td className="p-4 text-charcoal-400 text-sm">{c.location || '—'}</td>
                  <td className="p-4">
                    {c.entry_status === 'approved' ? <Badge variant="green">Approved</Badge> : <Badge variant="red">Denied</Badge>}
                  </td>
                  <td className="p-4 text-charcoal-400 text-sm">{c.staff?.first_name} {c.staff?.last_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {total > 50 && (
          <div className="p-4 border-t border-charcoal-700 flex items-center justify-between">
            <p className="text-charcoal-400 text-sm">Page {page} of {Math.ceil(total / 50)}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 bg-charcoal-800 text-gray-300 rounded-lg disabled:opacity-50 text-sm">Prev</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 50)} className="px-3 py-1.5 bg-charcoal-800 text-gray-300 rounded-lg disabled:opacity-50 text-sm">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
