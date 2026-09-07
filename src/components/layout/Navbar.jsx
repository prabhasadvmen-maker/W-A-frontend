import { Menu } from 'lucide-react'
import { NavbarProfile } from './NavbarProfile'
import { useSidebar } from '../../context/SidebarContext'

export function Navbar() {
  const { toggleCollapse, toggleMobileOpen } = useSidebar()

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-4 border-b border-[#334155] bg-[#0F172A]/90 px-6 backdrop-blur md:h-16 shadow-md">
      <div className="flex items-center gap-3">
        {/* Desktop Collapse Toggle Hamburger */}
        <button
          type="button"
          onClick={toggleCollapse}
          className="hidden md:flex p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none"
          title="Toggle Sidebar Collapse"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile Open Toggle Hamburger */}
        <button
          type="button"
          onClick={toggleMobileOpen}
          className="md:hidden flex p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-4">
        <NavbarProfile roleLabel="Client" badgeColor="text-[#25D366]" badgeBg="bg-[#25D366]/15" showAiAgent={true} />
      </div>
    </header>
  )
}
