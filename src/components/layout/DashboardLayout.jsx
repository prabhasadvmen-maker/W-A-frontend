import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'
import { SidebarProvider } from '../../context/SidebarContext'

export function DashboardLayout() {
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-[#0F172A] text-[#F1F5F9] font-sans">
        <Sidebar />
        <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-auto p-6 md:p-8 bg-[#0F172A]">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
