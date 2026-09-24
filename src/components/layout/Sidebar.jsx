import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Megaphone,
  Users,
  MessageCircle,
  Bot,
  FileText,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
  Camera,
  ChevronRight,
  User,
  MessageSquare,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useSidebar } from '../../context/SidebarContext'

const links = [
  { to: '/', label: 'DASHBOARD', icon: LayoutDashboard },
  { to: '/campaigns', label: 'CAMPAIGNS', icon: Megaphone },
  { to: '/bulk', label: 'BULK MESSAGE', icon: MessageSquare },
  { to: '/contacts', label: 'CONTACTS', icon: Users },
  { to: '/inbox', label: 'INBOX', icon: MessageCircle },
  { to: '/chatbot', label: 'CHATBOT', icon: Bot },
  { to: '/templates', label: 'TEMPLATES', icon: FileText },
  { to: '/photoshare', label: 'PHOTOSHARE', icon: Camera },
  { to: '/analytics', label: 'ANALYTICS', icon: BarChart3 },
  { to: '/settings', label: 'SETTINGS', icon: Settings },
]

export function Sidebar() {
  const { logout } = useAuth()
  const { isCollapsed, isMobileOpen, closeMobile } = useSidebar()

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 px-3 py-4 overflow-y-auto no-scrollbar">
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          onClick={closeMobile}
          title={isCollapsed ? label : ''}
          className={({ isActive }) =>
            `flex items-center ${isCollapsed ? 'justify-center md:px-2' : 'justify-between px-3.5'} py-3 text-xs tracking-wider font-extrabold rounded-xl transition-all ${
              isActive
                ? 'bg-[#0B3C1D] text-white shadow-inner border-l-4 border-[#25D366]'
                : 'text-emerald-100/70 hover:bg-[#0E5C2D] hover:text-white'
            }`
          }
        >
          <div className="flex items-center gap-3">
            <Icon className="h-4 w-4 shrink-0 text-[#25D366]" />
            {!isCollapsed && <span>{label}</span>}
          </div>
          {!isCollapsed && <ChevronRight className="h-3.5 w-3.5 opacity-60 shrink-0" />}
        </NavLink>
      ))}
    </nav>
  )

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex flex-col bg-[#0B2818] text-white transition-all duration-300 md:static ${
          isCollapsed ? 'md:w-20' : 'md:w-64'
        } w-64 border-r border-emerald-900/50 shadow-xl ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className={`flex h-20 items-center border-b border-emerald-900/60 ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-5'}`}>
          <div className="h-10 w-10 rounded-full bg-[#25D366] flex items-center justify-center text-[#0B2818] shadow-md shrink-0 font-black">
            <MessageSquare className="h-6 w-6 text-[#0B2818] fill-[#0B2818]" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <div className="text-base font-black tracking-tight text-white uppercase truncate leading-tight">
                WhatsMarketing
              </div>
              <div className="text-[11px] font-bold text-emerald-400">SaaS Console</div>
            </div>
          )}
        </div>

        {/* Nav Items with no-scrollbar */}
        {nav}

        {/* Bottom Section */}
        <div className="mt-auto border-t border-emerald-900/60 p-3 space-y-1 bg-[#071E12]/80">
          <NavLink
            to="/profile"
            title={isCollapsed ? 'Profile' : ''}
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2 text-xs font-bold text-emerald-200/90 hover:text-white rounded-lg hover:bg-[#0E5C2D] transition-colors`}
          >
            <User className="h-4 w-4 text-[#25D366]" />
            {!isCollapsed && <span>Profile</span>}
          </NavLink>
          <NavLink
            to="/settings"
            title={isCollapsed ? 'Settings' : ''}
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2 text-xs font-bold text-emerald-200/90 hover:text-white rounded-lg hover:bg-[#0E5C2D] transition-colors`}
          >
            <Settings className="h-4 w-4 text-[#25D366]" />
            {!isCollapsed && <span>Settings</span>}
          </NavLink>
          <button
            type="button"
            onClick={() => logout()}
            title={isCollapsed ? 'Logout' : ''}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2 text-xs font-bold text-rose-400 hover:text-rose-200 rounded-lg hover:bg-rose-950/40 transition-colors`}
          >
            <LogOut className="h-4 w-4 text-rose-400" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {isMobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm md:hidden"
          aria-label="Close menu"
          onClick={closeMobile}
        />
      )}
    </>
  )
}
