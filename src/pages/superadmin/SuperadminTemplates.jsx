import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { superadminApi } from '../../services/api'
import { Loader } from '../../components/ui/Loader'
import {
  FileText, Trash2, RefreshCw, Search, CheckCircle2,
  Clock, XCircle, AlertCircle, ShieldCheck
} from 'lucide-react'

function MetaStatusBadge({ status }) {
  const config = {
    APPROVED:              { color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', icon: CheckCircle2, label: 'Approved' },
    PENDING:               { color: 'bg-amber-500/15 text-amber-400 border-amber-500/30',   icon: Clock,         label: 'Pending' },
    PENDING_ADMIN_APPROVAL:{ color: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30', icon: Clock,         label: 'Awaiting Admin' },
    REJECTED:              { color: 'bg-red-500/15 text-red-400 border-red-500/30',          icon: XCircle,       label: 'Rejected' },
    DISABLED:              { color: 'bg-slate-500/15 text-slate-400 border-slate-500/30',    icon: AlertCircle,   label: 'Disabled' },
    DRAFT:                 { color: 'bg-blue-500/15 text-blue-400 border-blue-500/30',       icon: FileText,      label: 'Draft' },
  }
  const c = config[status] || config.DRAFT
  const Icon = c.icon
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${c.color}`}>
      <Icon className="h-3 w-3" />{c.label}
    </span>
  )
}

export default function SuperadminTemplates() {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [deletingId, setDeletingId] = useState(null)
  const [refreshingId, setRefreshingId] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await superadminApi.listAllTemplates()
      if (data.success) setTemplates(data.data.templates || [])
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load templates')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete template "${name}"?`)) return
    setDeletingId(id)
    try {
      const { data } = await superadminApi.deleteTemplate(id)
      if (data.success) {
        toast.success('Template deleted')
        setTemplates(t => t.filter(x => x._id !== id))
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Delete failed')
    } finally {
      setDeletingId(null)
    }
  }

  const handleRefresh = async (id) => {
    setRefreshingId(id)
    try {
      const { data } = await superadminApi.refreshTemplateStatus(id)
      if (data.success) {
        toast.success(data.message)
        setTemplates(prev => prev.map(t => t._id === id ? data.data.template : t))
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Refresh failed')
    } finally {
      setRefreshingId(null)
    }
  }

  const statuses = ['all', 'APPROVED', 'PENDING', 'PENDING_ADMIN_APPROVAL', 'REJECTED', 'DRAFT', 'DISABLED']

  const filtered = templates.filter(t => {
    const q = search.toLowerCase()
    const matchSearch =
      (t.name || '').toLowerCase().includes(q) ||
      (t.whatsappTemplateName || '').toLowerCase().includes(q) ||
      (t.userId?.name || '').toLowerCase().includes(q) ||
      (t.userId?.email || '').toLowerCase().includes(q)
    const matchStatus = filterStatus === 'all' || t.metaStatus === filterStatus
    return matchSearch && matchStatus
  })

  const counts = {
    all: templates.length,
    APPROVED: templates.filter(t => t.metaStatus === 'APPROVED').length,
    PENDING: templates.filter(t => t.metaStatus === 'PENDING').length,
    PENDING_ADMIN_APPROVAL: templates.filter(t => t.metaStatus === 'PENDING_ADMIN_APPROVAL').length,
    REJECTED: templates.filter(t => t.metaStatus === 'REJECTED').length,
    DRAFT: templates.filter(t => t.metaStatus === 'DRAFT').length,
    DISABLED: templates.filter(t => t.metaStatus === 'DISABLED').length,
  }

  if (loading) return <Loader label="Loading templates..." />

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-[#25D366]" /> Template Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">All templates across all admin accounts — {templates.length} total</p>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1E293B] border border-[#334155] text-slate-300 hover:text-white text-sm font-bold transition-all"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stat Pills */}
      <div className="flex flex-wrap gap-2">
        {statuses.map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              filterStatus === s
                ? 'bg-[#25D366] text-black border-[#25D366]'
                : 'bg-[#0F172A] text-slate-400 border-[#334155] hover:text-white'
            }`}
          >
            {s === 'all' ? 'All' : s === 'PENDING_ADMIN_APPROVAL' ? 'Awaiting Admin' : s.charAt(0) + s.slice(1).toLowerCase()}
            <span className="ml-1.5 opacity-70">({counts[s] ?? 0})</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, admin..."
          className="w-full bg-[#0F172A] border border-[#334155] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-[#25D366] focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0A1122] border-b border-[#1E293B]">
                <th className="px-5 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Template</th>
                <th className="px-5 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Owner (Admin)</th>
                <th className="px-5 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Assigned To</th>
                <th className="px-5 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Category</th>
                <th className="px-5 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Language</th>
                <th className="px-5 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-5 py-4 text-xs font-black text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-14 text-center text-slate-500">
                    <FileText className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="text-sm font-medium">No templates found</p>
                  </td>
                </tr>
              ) : (
                filtered.map(t => (
                  <tr key={t._id} className="bg-[#080E1E] hover:bg-[#0A1122] transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-sm font-bold text-slate-200">{t.name}</p>
                      <p className="text-xs font-mono text-[#25D366] mt-0.5">{t.whatsappTemplateName}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-xs font-semibold text-slate-300">{t.userId?.name || '—'}</p>
                      <p className="text-[11px] text-slate-500">{t.userId?.email || ''}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-xs text-slate-400">{t.assignedTo?.name || <span className="text-slate-600 italic">Unassigned</span>}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-semibold text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded border border-slate-700/50">
                        {t.category || 'MARKETING'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs text-slate-300">{t.languageCode || 'en'}</span>
                    </td>
                    <td className="px-5 py-4">
                      <MetaStatusBadge status={t.metaStatus || 'DRAFT'} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleRefresh(t._id)}
                          disabled={refreshingId === t._id}
                          className="p-2 rounded-xl bg-[#0A1122] border border-[#1E293B] hover:border-blue-500/30 hover:bg-blue-500/10 text-slate-400 hover:text-blue-400 transition-all disabled:opacity-50"
                          title="Refresh Meta Status"
                        >
                          <RefreshCw className={`w-4 h-4 ${refreshingId === t._id ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                          onClick={() => handleDelete(t._id, t.name)}
                          disabled={deletingId === t._id}
                          className="p-2 rounded-xl bg-[#0A1122] border border-[#1E293B] hover:border-red-500/30 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all disabled:opacity-50"
                          title="Delete Template"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
