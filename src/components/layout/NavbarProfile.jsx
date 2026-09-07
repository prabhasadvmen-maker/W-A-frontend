import { useState, useRef, useEffect } from 'react'
import { ChevronDown, LogOut, Mail, Shield, Bot, UserCheck } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export function NavbarProfile({ roleLabel = 'User', badgeColor = 'text-blue-400', badgeBg = 'bg-blue-500/10', showAiAgent = false }) {
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const showAiBadge = showAiAgent || user?.role === 'client'

  const isAiActive = Boolean(
    user?.aiAgentActive ||
    user?.aiAgentId ||
    user?.agentId
  )

  const getPanelName = () => {
    if (user?.role === 'admin') return 'Reseller Agency Admin'
    return 'Client Marketing Console'
  }

  const getDisplayName = () => {
    if (user?.name && user.name.trim() !== '' && user.name.toLowerCase() !== 'vijay wiz') {
      return user.name
    }
    if (user?.email) {
      const handle = user.email.split('@')[0]
      return handle.charAt(0).toUpperCase() + handle.slice(1)
    }
    return 'User'
  }

  const displayName = getDisplayName()
  const displayEmail = user?.email || ''
  const avatarChar = displayName.charAt(0).toUpperCase()

  return (
    <div className="flex items-center gap-2 relative" ref={dropdownRef}>
      {/* Profile Button (Aange / Left) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-xs text-slate-800 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/80 transition-all shadow-sm focus:outline-none"
      >
        <div className="w-6 h-6 rounded-lg bg-[#0B4F26] flex items-center justify-center text-white text-[11px] font-black shadow-sm shrink-0">
          {avatarChar}
        </div>
        <div className="flex flex-col items-start leading-none text-left">
          <span className="text-slate-900 font-extrabold tracking-tight max-w-[90px] sm:max-w-[130px] truncate text-[12px]">
            {displayName}
          </span>
          <span className="text-[10px] font-bold text-slate-400 mt-0.5">{displayEmail || roleLabel}</span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ml-1 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* AI Agent Status Indicator (Pichhe / Right - Only in Client Panel) */}
      {showAiBadge && (
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all ${
          isAiActive
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          <span className="relative flex h-2 w-2">
            {isAiActive && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isAiActive ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
          </span>
          <span className="hidden sm:inline">AI Agent:</span>
          <span className="font-extrabold">{isAiActive ? 'Active' : 'Inactive'}</span>
        </div>
      )}

      {/* Interactive Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-[#111827] border border-[#334155] rounded-2xl shadow-2xl z-50 p-4 text-slate-200 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center gap-3 pb-3 border-b border-slate-700/60">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-base font-black shadow-md shrink-0">
              {avatarChar}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-extrabold text-white truncate">{displayName}</h4>
              <p className="text-[11px] font-bold text-slate-400 truncate uppercase mt-0.5">{roleLabel}</p>
            </div>
          </div>

          {/* Profile Details */}
          <div className="py-3 space-y-2 text-xs font-medium">
            <div className="flex items-center gap-2 text-slate-300 bg-slate-800/50 px-3 py-2 rounded-xl border border-slate-700/40">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Email / Gmail</p>
                <p className="text-white font-semibold truncate">{displayEmail || 'Not available'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-300 bg-slate-800/50 px-3 py-2 rounded-xl border border-slate-700/40">
              <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Business & Phone</p>
                <p className="text-white font-semibold truncate">{user?.businessName || 'Individual'} • {user?.phone || 'No phone'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-300 bg-slate-800/50 px-3 py-2 rounded-xl border border-slate-700/40">
              <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Panel & Plan</p>
                <p className="text-white font-semibold truncate">{getPanelName()} • <span className="text-[#25D366] capitalize font-bold">{user?.plan || 'Free'}</span></p>
              </div>
            </div>
          </div>

          {/* Quick Logout Button */}
          <div className="pt-2 border-t border-slate-700/60">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false)
                logout()
              }}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 transition-all text-xs font-bold group"
            >
              <span className="flex items-center gap-2">
                <LogOut className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                <span>Logout Account</span>
              </span>
              <span className="text-[10px] bg-red-500/20 px-2 py-0.5 rounded text-red-300 font-extrabold">Exit</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
