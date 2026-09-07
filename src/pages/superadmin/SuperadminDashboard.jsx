import { useEffect, useState, Fragment } from 'react'
import toast from 'react-hot-toast'
import { superadminApi } from '../../services/api'
import { useAuthContext } from '../../context/AuthContext'
import { Card } from '../../components/ui/Card'
import { Loader } from '../../components/ui/Loader'
import { Table, THead, TBody, TR, TH, TD } from '../../components/ui/Table'
import { Users, ShieldCheck, CheckCircle2, Clock, XCircle, Check, X, PhoneCall, ExternalLink, Edit2, Trash2, Shield, User, Search, RefreshCw } from 'lucide-react'

export default function SuperadminDashboard() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterTab, setFilterTab] = useState('all')
  const [editingUser, setEditingUser] = useState(null)
  const { openWorkspaceInNewTab } = useAuthContext()

  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'client',
    plan: 'free',
    status: 'active',
    businessName: '',
    phone: '',
  })

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const [statsRes, usersRes] = await Promise.all([
        superadminApi.stats(),
        superadminApi.listUsers(),
      ])
      if (statsRes.data.success) setStats(statsRes.data.data)
      if (usersRes.data.success) setUsers(usersRes.data.data.users || [])
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load superadmin overview')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await superadminApi.updateUserStatus(id, newStatus)
      if (res.data.success) {
        toast.success(`User status updated to ${newStatus}`)
        loadData()
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update user status')
    }
  }

  const handleRoleChange = async (id, newRole) => {
    try {
      const res = await superadminApi.updateUser(id, { role: newRole })
      if (res.data.success) {
        toast.success(`User role updated to ${newRole}`)
        loadData()
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update user role')
    }
  }

  const handlePlanChange = async (id, newPlan) => {
    try {
      const res = await superadminApi.updateUser(id, { plan: newPlan })
      if (res.data.success) {
        toast.success(`User plan updated to ${newPlan}`)
        loadData()
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update user plan')
    }
  }

  const handleStartEdit = (u) => {
    setEditingUser(u._id)
    setEditForm({
      name: u.name || '',
      email: u.email || '',
      role: u.role || 'client',
      plan: u.plan || 'free',
      status: u.status || 'active',
      businessName: u.businessName || '',
      phone: u.phone || '',
    })
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      const res = await superadminApi.updateUser(editingUser, editForm)
      if (res.data.success) {
        toast.success('User details updated successfully')
        setEditingUser(null)
        loadData()
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update user')
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete user "${name}"?`)) return
    try {
      const res = await superadminApi.deleteUser(id)
      if (res.data.success) {
        toast.success('User deleted successfully')
        loadData()
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to delete user')
    }
  }

  if (loading) return <Loader label="Loading SuperAdmin Console..." />

  const pendingUsers = users.filter((u) => u.status === 'pending')
  const activeUsers = users.filter((u) => u.status === 'active')

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.phone || '').includes(search)
    if (filterTab === 'all') return matchesSearch
    if (filterTab === 'pending') return matchesSearch && u.status === 'pending'
    if (filterTab === 'active') return matchesSearch && u.status === 'active'
    if (filterTab === 'admins') return matchesSearch && u.role === 'admin'
    if (filterTab === 'clients') return matchesSearch && u.role === 'client'
    return matchesSearch
  })

  const statCards = [
    {
      title: 'Total System Users',
      value: (stats?.totalUsers ?? users.length).toLocaleString(),
      subtext: `${stats?.adminCount || 0} Admins • ${stats?.clientCount || 0} Clients`,
      icon: Users,
      iconBg: 'bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30',
    },
    {
      title: 'Pending Approvals',
      value: (stats?.pendingUsers ?? pendingUsers.length).toLocaleString(),
      subtext: 'Requires SuperAdmin approval',
      icon: Clock,
      iconBg: pendingUsers.length > 0 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-400',
    },
    {
      title: 'Active Accounts',
      value: (stats?.activeUsers ?? activeUsers.length).toLocaleString(),
      subtext: 'Approved and operational',
      icon: CheckCircle2,
      iconBg: 'bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30',
    },
    {
      title: 'Platform Messages',
      value: (stats?.totalMessages ?? 0).toLocaleString(),
      subtext: `Total campaigns: ${stats?.totalCampaigns ?? 0}`,
      icon: ShieldCheck,
      iconBg: 'bg-sky-500/10 text-sky-400 border border-sky-500/30',
    },
  ]

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-[#25D366]" /> SuperAdmin Console
          </h1>
          <p className="text-sm font-semibold text-slate-400 mt-1">{currentDateStr}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] text-xs font-extrabold shadow-sm shrink-0">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#25D366]"></span>
            </span>
            <span>SuperAdmin Master Access</span>
          </div>
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-[#1E293B] border border-[#334155] text-slate-300 hover:text-white transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => {
          const Icon = s.icon
          return (
            <div
              key={s.title}
              className="bg-[#1E293B] rounded-2xl p-6 border border-[#334155] shadow-lg transition-all hover:border-[#25D366]/40 hover:-translate-y-0.5"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.iconBg} mb-4 shadow-sm`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-3xl font-extrabold text-white tracking-tight">
                {s.value}
              </div>
              <div className="text-sm font-bold text-slate-200 mt-1.5">{s.title}</div>
              <div className="text-xs text-slate-400 font-medium mt-0.5">{s.subtext}</div>
            </div>
          )
        })}
      </div>

      {/* Pending User Approvals Section */}
      {pendingUsers.length > 0 && (
        <Card title={`⚠️ Pending Registrations (${pendingUsers.length})`} className="!bg-[#111827] !border-amber-500/40 shadow-2xl">
          <div className="mb-4 flex items-center gap-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 px-4 py-2.5 text-xs text-amber-300 font-medium">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse shrink-0"></span>
            <span>New users registered and waiting for SuperAdmin approval. Click Approve or Reject below.</span>
          </div>

          <Table>
            <THead>
              <TR className="!border-amber-500/20">
                <TH className="!text-amber-400 font-black">Registered User</TH>
                <TH className="!text-amber-400 font-black">Email & Contact</TH>
                <TH className="!text-amber-400 font-black">Requested Role</TH>
                <TH className="!text-amber-400 font-black">Plan Tier</TH>
                <TH className="!text-amber-400 font-black text-right">Approve / Reject Action</TH>
              </TR>
            </THead>
            <TBody>
              {pendingUsers.map((u) => (
                <TR key={u._id} className="!border-amber-500/20 hover:bg-amber-500/5 transition-colors">
                  <TD className="font-bold text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-sm shrink-0">
                        {(u.name || u.email).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{u.name || u.email.split('@')[0]}</p>
                        <p className="text-[11px] text-amber-400 font-semibold">{u.businessName || 'Individual'}</p>
                      </div>
                    </div>
                  </TD>
                  <TD>
                    <p className="text-xs text-slate-200 font-medium">{u.email}</p>
                    <p className="text-[11px] text-slate-400">{u.phone || 'No phone'}</p>
                  </TD>
                  <TD>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-bold capitalize">
                      {u.role || 'client'}
                    </span>
                  </TD>
                  <TD>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold capitalize">
                      {u.plan || 'Free'}
                    </span>
                  </TD>
                  <TD className="text-right">
                    <div className="flex items-center justify-end gap-2.5">
                      <button
                        onClick={() => handleStatusChange(u._id, 'active')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#25D366] text-[#0F172A] hover:bg-[#20bd5a] font-black text-xs shadow-md transition-all"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve User</span>
                      </button>
                      <button
                        onClick={() => handleStatusChange(u._id, 'rejected')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/40 font-black text-xs transition-all"
                      >
                        <X className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </Card>
      )}

      {/* Edit Form Modal */}
      {editingUser && (
        <Card title="Edit User Account" className="!bg-[#1E293B] !border-[#25D366]/40">
          <form onSubmit={handleUpdate} className="space-y-4 pt-2">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full rounded-xl border border-[#334155] bg-[#0F172A] px-3.5 py-2 text-sm text-white focus:border-[#25D366] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full rounded-xl border border-[#334155] bg-[#0F172A] px-3.5 py-2 text-sm text-white focus:border-[#25D366] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full rounded-xl border border-[#334155] bg-[#0F172A] px-3.5 py-2 text-sm text-white focus:border-[#25D366] focus:outline-none capitalize"
                >
                  <option value="client">Client</option>
                  <option value="admin">Agency Admin</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Plan Tier</label>
                <select
                  value={editForm.plan}
                  onChange={(e) => setEditForm({ ...editForm, plan: e.target.value })}
                  className="w-full rounded-xl border border-[#334155] bg-[#0F172A] px-3.5 py-2 text-sm text-white focus:border-[#25D366] focus:outline-none capitalize"
                >
                  <option value="free">Free</option>
                  <option value="starter">Starter</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Approval Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full rounded-xl border border-[#334155] bg-[#0F172A] px-3.5 py-2 text-sm text-white focus:border-[#25D366] focus:outline-none capitalize"
                >
                  <option value="active">Active (Approved)</option>
                  <option value="pending">Pending Approval</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full rounded-xl border border-[#334155] bg-[#0F172A] px-3.5 py-2 text-sm text-white focus:border-[#25D366] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-5 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-slate-300 font-extrabold text-sm transition-all border border-[#334155]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#25D366] text-[#0F172A] font-extrabold text-sm hover:bg-[#20bd5a] transition-all shadow-md"
              >
                <Check className="w-4 h-4" /> Save User Changes
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Main Users Table */}
      <Card title={`Platform Users Control Center (${filteredUsers.length})`} className="shadow-lg border-[#334155]">
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email..."
              className="w-full bg-[#0F172A] border border-[#334155] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-[#25D366] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            {[
              { id: 'all', label: 'All Users' },
              { id: 'pending', label: `Pending (${pendingUsers.length})` },
              { id: 'active', label: 'Active' },
              { id: 'admins', label: 'Agency Admins' },
              { id: 'clients', label: 'Clients' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  filterTab === tab.id
                    ? 'bg-[#25D366] text-[#0F172A] shadow-md'
                    : 'bg-[#0F172A] text-slate-400 border border-[#334155] hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <Table>
          <THead>
            <TR className="bg-[#0F172A] text-slate-300">
              <TH>User Account</TH>
              <TH>Email & Phone</TH>
              <TH>Role</TH>
              <TH>Approval Status</TH>
              <TH>Plan Tier</TH>
              <TH>WhatsApp API</TH>
              <TH className="text-right">Actions</TH>
            </TR>
          </THead>
          <TBody>
            {filteredUsers.length === 0 ? (
              <TR>
                <TD colSpan={7} className="text-center py-8 text-slate-400 font-medium">
                  No users registered yet.
                </TD>
              </TR>
            ) : (
              filteredUsers.map((u) => {
                const uName = (u.name && u.name.toLowerCase() !== 'vijay wiz')
                  ? u.name
                  : (u.email ? u.email.split('@')[0] : 'User')
                const initial = uName.charAt(0).toUpperCase()

                return (
                  <TR key={u._id} className="hover:bg-slate-800/50 transition-colors">
                    <TD className="font-bold text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center text-[#25D366] font-black text-sm shadow-sm shrink-0">
                          {initial}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white capitalize">{uName}</p>
                          <p className="text-[11px] text-[#25D366] font-semibold">{u.businessName || 'Individual'}</p>
                        </div>
                      </div>
                    </TD>
                    <TD>
                      <p className="text-xs text-slate-200 font-medium">{u.email}</p>
                      <p className="text-[11px] text-slate-400">{u.phone || 'No phone'}</p>
                    </TD>
                    <TD>
                      <select
                        value={u.role || 'client'}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className="rounded-lg border border-[#334155] bg-[#0F172A] px-2.5 py-1 text-xs font-bold text-blue-400 focus:border-[#25D366] focus:outline-none capitalize"
                      >
                        <option value="client">Client</option>
                        <option value="admin">Agency Admin</option>
                      </select>
                    </TD>
                    <TD>
                      <select
                        value={u.status || 'active'}
                        onChange={(e) => handleStatusChange(u._id, e.target.value)}
                        className={`rounded-lg border px-2.5 py-1 text-xs font-bold focus:outline-none capitalize ${
                          u.status === 'pending'
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                            : u.status === 'rejected'
                            ? 'bg-red-500/10 border-red-500/30 text-red-400'
                            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        }`}
                      >
                        <option value="active" className="bg-[#0F172A] text-emerald-400">Active (Approved)</option>
                        <option value="pending" className="bg-[#0F172A] text-amber-400">Pending Approval</option>
                        <option value="rejected" className="bg-[#0F172A] text-red-400">Rejected</option>
                      </select>
                    </TD>
                    <TD>
                      <select
                        value={u.plan || 'free'}
                        onChange={(e) => handlePlanChange(u._id, e.target.value)}
                        className="rounded-lg border border-[#334155] bg-[#0F172A] px-2.5 py-1 text-xs font-bold text-white focus:border-[#25D366] focus:outline-none capitalize"
                      >
                        <option value="free">Free</option>
                        <option value="starter">Starter</option>
                        <option value="pro">Pro</option>
                        <option value="enterprise">Enterprise</option>
                      </select>
                    </TD>
                    <TD>
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${u.whatsappPhoneNumberId ? 'text-emerald-400' : 'text-slate-500'}`}>
                        <PhoneCall className="w-3.5 h-3.5" />
                        {u.whatsappPhoneNumberId ? 'Connected' : 'Not Connected'}
                      </span>
                    </TD>
                    <TD className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openWorkspaceInNewTab(u._id, u.role || 'client')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366] text-[#25D366] hover:text-[#0F172A] border border-[#25D366]/30 font-extrabold text-xs transition-all"
                          title="Access Workspace"
                        >
                          <span>Access</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleStartEdit(u)}
                          className="p-2 rounded-xl bg-[#0F172A] hover:bg-[#25D366]/15 text-slate-400 hover:text-[#25D366] border border-[#334155] transition-all"
                          title="Edit User"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(u._id, u.name || u.email)}
                          className="p-2 rounded-xl bg-[#0F172A] hover:bg-rose-500/15 text-slate-400 hover:text-rose-400 border border-[#334155] transition-all"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TD>
                  </TR>
                )
              })
            )}
          </TBody>
        </Table>
      </Card>
    </div>
  )
}
