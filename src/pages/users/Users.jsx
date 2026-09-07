import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { adminApi } from '../../services/api'
import { useAuthContext } from '../../context/AuthContext'
import { Card } from '../../components/ui/Card'
import { Loader } from '../../components/ui/Loader'
import { Table, THead, TBody, TR, TH, TD } from '../../components/ui/Table'
import { Users as UsersIcon, Plus, Search, Check, X, PhoneCall, ExternalLink, Edit2, Trash2, Shield, User } from 'lucide-react'

export default function Users() {
  const { user: currentUser, openWorkspaceInNewTab } = useAuthContext()
  const [usersList, setUsersList] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [showCreate, setShowCreate] = useState(false)
  const [editingUser, setEditingUser] = useState(null)

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    businessName: '',
    phone: '',
    plan: 'free',
    status: 'active',
  })

  const [editForm, setEditForm] = useState({
    name: '',
    businessName: '',
    phone: '',
    plan: 'free',
    status: 'active',
  })

  const loadUsers = async () => {
    setLoading(true)
    try {
      if (currentUser?.role === 'admin') {
        const res = await adminApi.listClients()
        if (res.data.success) {
          setUsersList(res.data.data.clients || [])
        }
      } else {
        // For client, show current user profile & account info
        setUsersList(currentUser ? [currentUser] : [])
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [currentUser])

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      const res = await adminApi.createClient(form)
      if (res.data.success) {
        toast.success('User account created successfully')
        setShowCreate(false)
        setForm({ name: '', email: '', password: '', businessName: '', phone: '', plan: 'free', status: 'active' })
        loadUsers()
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to create user')
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await adminApi.updateClient(id, { status: newStatus })
      if (res.data.success) {
        toast.success(`User status updated to ${newStatus}`)
        loadUsers()
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update user status')
    }
  }

  const handleStartEdit = (u) => {
    setEditingUser(u._id)
    setEditForm({
      name: u.name || '',
      businessName: u.businessName || '',
      phone: u.phone || '',
      plan: u.plan || 'free',
      status: u.status || 'active',
    })
    setShowCreate(false)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      const res = await adminApi.updateClient(editingUser, editForm)
      if (res.data.success) {
        toast.success('User account updated successfully')
        setEditingUser(null)
        loadUsers()
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update user')
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete user "${name}"?`)) return
    try {
      const res = await adminApi.deleteClient(id)
      if (res.data.success) {
        toast.success('User deleted successfully')
        loadUsers()
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to delete user')
    }
  }

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.phone || '').includes(search)
    if (filterRole === 'all') return matchesSearch
    if (filterRole === 'pending') return matchesSearch && u.status === 'pending'
    if (filterRole === 'active') return matchesSearch && u.status === 'active'
    return matchesSearch
  })

  if (loading) return <Loader label="Loading user directory..." />

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <UsersIcon className="w-8 h-8 text-[#25D366]" /> Users Directory
          </h1>
          <p className="text-sm font-semibold text-slate-400 mt-1">
            Manage user accounts, view active agency sub-clients, and control access permissions.
          </p>
        </div>
        {currentUser?.role === 'admin' && (
          <button
            type="button"
            onClick={() => {
              setShowCreate(!showCreate)
              setEditingUser(null)
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] text-[#0F172A] font-extrabold text-sm hover:bg-[#20bd5a] transition-all shadow-md shrink-0"
          >
            {showCreate ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{showCreate ? 'Close Form' : 'Add New User'}</span>
          </button>
        )}
      </div>

      {/* Controls Bar: Search & Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#1E293B] p-4 rounded-2xl border border-[#334155]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name, email..."
            className="w-full bg-[#0F172A] border border-[#334155] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-[#25D366] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Users' },
            { id: 'active', label: 'Active' },
            { id: 'pending', label: 'Pending Approval' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterRole(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                filterRole === tab.id
                  ? 'bg-[#25D366] text-[#0F172A] shadow-md'
                  : 'bg-[#0F172A] text-slate-400 border border-[#334155] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Form: Create User */}
      {showCreate && (
        <Card title="Add New User Account" className="!bg-[#1E293B] !border-[#25D366]/40">
          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full rounded-xl border border-[#334155] bg-[#0F172A] px-3.5 py-2 text-sm text-white focus:border-[#25D366] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="user@example.com"
                  className="w-full rounded-xl border border-[#334155] bg-[#0F172A] px-3.5 py-2 text-sm text-white focus:border-[#25D366] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Min 6 characters"
                  className="w-full rounded-xl border border-[#334155] bg-[#0F172A] px-3.5 py-2 text-sm text-white focus:border-[#25D366] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Business Name</label>
                <input
                  type="text"
                  value={form.businessName}
                  onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                  placeholder="e.g. Acme Corp"
                  className="w-full rounded-xl border border-[#334155] bg-[#0F172A] px-3.5 py-2 text-sm text-white focus:border-[#25D366] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="e.g. 919876543210"
                  className="w-full rounded-xl border border-[#334155] bg-[#0F172A] px-3.5 py-2 text-sm text-white focus:border-[#25D366] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Plan Tier</label>
                <select
                  value={form.plan}
                  onChange={(e) => setForm({ ...form, plan: e.target.value })}
                  className="w-full rounded-xl border border-[#334155] bg-[#0F172A] px-3.5 py-2 text-sm text-white focus:border-[#25D366] focus:outline-none"
                >
                  <option value="free">Free</option>
                  <option value="starter">Starter</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#25D366] text-[#0F172A] font-extrabold text-sm hover:bg-[#20bd5a] transition-all shadow-md"
              >
                <Check className="w-4 h-4" /> Save User Account
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Form: Edit User */}
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
                <label className="block text-xs font-bold text-slate-300 mb-1">Business Name</label>
                <input
                  type="text"
                  value={editForm.businessName}
                  onChange={(e) => setEditForm({ ...editForm, businessName: e.target.value })}
                  className="w-full rounded-xl border border-[#334155] bg-[#0F172A] px-3.5 py-2 text-sm text-white focus:border-[#25D366] focus:outline-none"
                />
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
                <Check className="w-4 h-4" /> Save Changes
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Users Table */}
      <Card title={`All Registered Users (${filteredUsers.length})`} className="shadow-lg border-[#334155]">
        <Table>
          <THead>
            <TR className="bg-[#0F172A] text-slate-300">
              <TH>User Account</TH>
              <TH>Email & Phone</TH>
              <TH>Role / Type</TH>
              <TH>Plan Tier</TH>
              <TH>Status</TH>
              <TH>WhatsApp</TH>
              {currentUser?.role === 'admin' && <TH className="text-right">Actions</TH>}
            </TR>
          </THead>
          <TBody>
            {filteredUsers.length === 0 ? (
              <TR>
                <TD colSpan={7} className="text-center py-8 text-slate-400 font-medium">
                  No users found matching your criteria.
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
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-bold capitalize">
                        {u.role === 'admin' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                        {u.role || 'client'}
                      </span>
                    </TD>
                    <TD>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold capitalize">
                        {u.plan || 'Free'}
                      </span>
                    </TD>
                    <TD>
                      <select
                        value={u.status || 'active'}
                        disabled={currentUser?.role !== 'admin'}
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
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${u.whatsappPhoneNumberId ? 'text-emerald-400' : 'text-slate-500'}`}>
                        <PhoneCall className="w-3.5 h-3.5" />
                        {u.whatsappPhoneNumberId ? 'Connected' : 'Not Connected'}
                      </span>
                    </TD>
                    {currentUser?.role === 'admin' && (
                      <TD className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openWorkspaceInNewTab(u._id, 'client')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366] text-[#25D366] hover:text-[#0F172A] border border-[#25D366]/30 font-extrabold text-xs transition-all"
                            title="Access Panel"
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
                            onClick={() => handleDelete(u._id, u.name)}
                            className="p-2 rounded-xl bg-[#0F172A] hover:bg-rose-500/15 text-slate-400 hover:text-rose-400 border border-[#334155] transition-all"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </TD>
                    )}
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
