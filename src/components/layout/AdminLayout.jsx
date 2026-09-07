import { Outlet } from 'react-router-dom'
import { AdminSidebar } from './AdminSidebar'
import { Shield, Menu } from 'lucide-react'
import { NavbarProfile } from './NavbarProfile'
import { SidebarProvider, useSidebar } from '../../context/SidebarContext'

function AdminHeader() {
  const { toggleCollapse, toggleMobileOpen } = useSidebar()
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#334155] bg-[#0F172A]/95 px-6 backdrop-blur shadow-md">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={toggleCollapse}
          className="hidden md:flex p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Toggle Sidebar Collapse"
        >
          <Menu className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={toggleMobileOpen}
          className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold bg-[#25D366]/15 text-[#25D366] border border-[#25D366]/30">
          <Shield className="w-4 h-4" /> Agency Admin Portal
        </span>
      </div>
      <div className="flex items-center gap-4">
        <NavbarProfile roleLabel="Admin" badgeColor="text-[#25D366]" badgeBg="bg-[#25D366]/15" />
      </div>
    </header>
  )
}

export function AdminLayout() {
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-[#0F172A] text-[#F1F5F9] font-sans">
        <AdminSidebar />
        <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
          <AdminHeader />
          <main className="flex-1 overflow-auto p-6 md:p-8 bg-[#0F172A]">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
