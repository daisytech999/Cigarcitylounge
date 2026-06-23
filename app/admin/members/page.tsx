'use client'
import { useState, useEffect, useCallback } from 'react'
import { Search, UserCheck, UserX, Mail, Edit, Eye } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

export default function AdminMembersPage() {
  const [members, setMembers] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  const fetchMembers = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ search, page: String(page) })
    if (statusFilter) params.set('status', statusFilter)
    const res = await fetch(`/api/admin/members?${params}`)
    const data = await res.json()
    setMembers(data.members || [])
    setTotal(data.total || 0)
    setLoading(false)
  }, [search, statusFilter, page])

  useEffect(() => { fetchMembers() }, [fetchMembers])

  const statusBadge = (status: string) => {
    const map: Record<string, any> = {
      active: <Badge variant="green">Active</Badge>,
      pending: <Badge variant="orange">Pending</Badge>,
      cancelled: <Badge variant="red">Cancelled</Badge>,
      paused: <Badge variant="gray">Paused</Badge>,
    }
    return map[status] || <Badge variant="gray">{status}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-gold-500 mb-1">Members</h1>
          <p className="text-gray-400">{total} total members</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-charcoal-900 border border-charcoal-700 rounded-xl p-4 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" size={18} />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by name, email, or member ID..."
            className="w-full bg-charcoal-950 border border-charcoal-700 text-white placeholder-charcoal-400 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-gold-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
          className="bg-charcoal-950 border border-charcoal-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gold-500"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
          <option value="paused">Paused</option>
        </select>
      </div>

      {/* Members table */}
      <div className="bg-charcoal-900 border border-charcoal-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-charcoal-700">
                <th className="text-left p-4 text-charcoal-400 text-sm font-medium">Member</th>
                <th className="text-left p-4 text-charcoal-400 text-sm font-medium">Member ID</th>
                <th className="text-left p-4 text-charcoal-400 text-sm font-medium">Status</th>
                <th className="text-left p-4 text-charcoal-400 text-sm font-medium">Plan</th>
                <th className="text-left p-4 text-charcoal-400 text-sm font-medium">Joined</th>
                <th className="text-left p-4 text-charcoal-400 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-charcoal-700 border-t-gold-500 rounded-full mx-auto" />
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-charcoal-400">No members found</td>
                </tr>
              ) : (
                members.map((member: any) => (
                  <tr key={member.id} className="hover:bg-charcoal-800/50 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="text-white font-medium">{member.first_name} {member.last_name}</p>
                        <p className="text-charcoal-400 text-sm">{member.email}</p>
                        {member.phone && <p className="text-charcoal-500 text-xs">{member.phone}</p>}
                      </div>
                    </td>
                    <td className="p-4 text-charcoal-300 text-sm font-mono">{member.member_id}</td>
                    <td className="p-4">{statusBadge(member.membership_status)}</td>
                    <td className="p-4 text-gray-300 text-sm">{member.subscriptions?.[0]?.membership_plan?.name || '—'}</td>
                    <td className="p-4 text-charcoal-400 text-sm">{formatDate(member.created_at)}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Link href={`/admin/members/${member.user_id}`} className="p-2 bg-charcoal-800 hover:bg-charcoal-700 text-gray-300 rounded-lg transition-colors" title="View">
                          <Eye size={16} />
                        </Link>
                        <a href={`mailto:${member.email}`} className="p-2 bg-charcoal-800 hover:bg-charcoal-700 text-gray-300 rounded-lg transition-colors" title="Email">
                          <Mail size={16} />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 20 && (
          <div className="p-4 border-t border-charcoal-700 flex items-center justify-between">
            <p className="text-charcoal-400 text-sm">Page {page} of {Math.ceil(total / 20)}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 bg-charcoal-800 text-gray-300 rounded-lg disabled:opacity-50 text-sm">Previous</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 20)} className="px-4 py-2 bg-charcoal-800 text-gray-300 rounded-lg disabled:opacity-50 text-sm">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
