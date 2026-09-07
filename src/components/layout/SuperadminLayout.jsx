import { Outlet } from 'react-router-dom'
import { SuperadminSidebar } from './SuperadminSidebar'
import { Navbar } from './Navbar'
import { SidebarProvider } from '../../context/SidebarContext'

export function SuperadminLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-[#0F172A] text-[#F1F5F9] font-sans antialiased">
        <SuperadminSidebar />
        <div className="flex flex-1 flex-col min-w-0">
          <Navbar />
          <main className="flex-1 p-4 md:p-8 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
