import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { authApi } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { User, Mail, Shield, Building, Phone, Key, CheckCircle2, Save, Sparkles, PhoneCall } from 'lucide-react'

export default function Profile() {
  const { user, refreshUser } = useAuth()
  const [name, setName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [phone, setPhone] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) {
      const cleanName = (user.name && user.name.toLowerCase() !== 'vijay wiz')
        ? user.name
        : (user.role === 'superadmin' ? 'Super Admin' : (user.email ? user.email.split('@')[0] : 'User'))
      setName(cleanName)
      setBusinessName(user.businessName || '')
      setPhone(user.phone || '')
    }
  }, [user])

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await authApi.updateProfile({
        name: name.trim(),
        businessName: businessName.trim(),
        phone: phone.trim(),
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
      })

      if (res.data.success) {
        toast.success('Profile updated successfully!')
        setCurrentPassword('')
        setNewPassword('')
        await refreshUser()
      } else {
        toast.error(res.data.message || 'Failed to update profile')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const cleanDisplayName = (user?.name && user.name.toLowerCase() !== 'vijay wiz')
    ? user.name
    : (user?.role === 'superadmin' ? 'Super Admin' : (user?.email ? user.email.split('@')[0] : 'User'))

  const avatarChar = cleanDisplayName.charAt(0).toUpperCase()

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Top Banner Header */}
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <User className="w-8 h-8 text-[#25D366]" /> User Profile
        </h1>
        <p className="text-sm font-semibold text-slate-400 mt-1">
          Manage your account information, personal credentials, and workspace settings.
        </p>
      </div>

      {/* Hero Profile Identity Card */}
      <div className="bg-[#1E293B] rounded-3xl p-6 sm:p-8 border border-[#334155] shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <div className="w-20 h-20 rounded-2xl bg-[#25D366] text-[#0F172A] flex items-center justify-center text-3xl font-black shadow-lg shadow-[#25D366]/20 shrink-0">
            {avatarChar}
          </div>
          <div>
            <h2 className="text-2xl font-black text-white capitalize flex items-center justify-center sm:justify-start gap-2">
              <span>{cleanDisplayName}</span>
              <CheckCircle2 className="w-5 h-5 text-[#25D366]" />
            </h2>
            <p className="text-sm text-slate-400 font-medium mt-0.5">{user?.email}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
              <span className="px-3 py-1 rounded-full bg-[#25D366]/15 border border-[#25D366]/30 text-[#25D366] text-xs font-black uppercase">
                {user?.role || 'Client'}
              </span>
              <span className="px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-black capitalize">
                {user?.plan || 'Free'} Plan
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                Account Active & Verified
              </span>
            </div>
          </div>
        </div>

        <div className="w-full sm:w-auto bg-[#0F172A] border border-[#334155] p-4 rounded-2xl space-y-2 text-xs shrink-0 text-slate-300">
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400 font-bold">WhatsApp API:</span>
            <span className={`font-bold ${user?.whatsappPhoneNumberId ? 'text-emerald-400' : 'text-amber-400'}`}>
              {user?.whatsappPhoneNumberId ? 'Connected' : 'Not Connected'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400 font-bold">Workspace:</span>
            <span className="font-bold text-white capitalize">{user?.role === 'admin' ? 'Reseller Agency' : 'Marketing Console'}</span>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        <Card title="Personal & Business Credentials" className="shadow-lg border-[#334155]">
          <div className="grid gap-6 sm:grid-cols-2 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#25D366]" /> Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Full Name"
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#25D366] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#25D366]" /> Email Address (Primary ID)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full bg-[#090D16] border border-[#334155]/60 rounded-xl px-4 py-2.5 text-sm text-slate-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-[#25D366]" /> Business / Organization Name
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Acme Foundation"
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#25D366] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#25D366]" /> Contact Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 9876543210"
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#25D366] focus:outline-none"
              />
            </div>
          </div>
        </Card>

        {/* Change Password Card */}
        <Card title="Security & Password Updates" className="shadow-lg border-[#334155]">
          <p className="text-xs text-slate-400 mb-4">
            Leave password fields blank if you do not wish to change your login password.
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-slate-400" /> Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Required to set new password"
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#25D366] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[#25D366]" /> New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#25D366] focus:outline-none"
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-[#25D366] text-[#0F172A] font-extrabold text-sm hover:bg-[#20bd5a] transition-all shadow-lg shadow-[#25D366]/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
