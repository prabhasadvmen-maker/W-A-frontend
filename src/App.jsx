import { Navigate, createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthProvider, useAuthContext } from './context/AuthContext'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { AdminLayout } from './components/layout/AdminLayout'
import { SuperadminLayout } from './components/layout/SuperadminLayout'
import { Loader } from './components/ui/Loader'

import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ImpersonateSessionHandler from './pages/auth/ImpersonateSessionHandler'
import ApiSharingSessionHandler from './pages/auth/ApiSharingSessionHandler'
import Dashboard from './pages/dashboard/Dashboard'
import Contacts from './pages/contacts/Contacts'
import ContactGroups from './pages/contacts/ContactGroups'
import Campaigns from './pages/campaigns/Campaigns'
import CreateCampaign from './pages/campaigns/CreateCampaign'
import Templates from './pages/templates/Templates'
import BotFlow from './pages/chatbot/BotFlow'
import Inbox from './pages/inbox/Inbox'
import Analytics from './pages/analytics/Analytics'
import Settings from './pages/settings/Settings'
import Profile from './pages/profile/Profile'
import Photoshare from './pages/photoshare/Photoshare'
import PublicGallery from './pages/photoshare/PublicGallery'
import Users from './pages/users/Users'

import AdminDashboard from './pages/admin/AdminDashboard'
import ManageClients from './pages/admin/ManageClients'
import ClientTemplates from './pages/admin/ClientTemplates'
import CreateTemplate from './pages/admin/CreateTemplate'

import SuperadminDashboard from './pages/superadmin/SuperadminDashboard'

function ProtectedLayout() {
  const { loading, isAuthenticated, user } = useAuthContext()
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <Loader label="Loading session…" />
      </div>
    )
  }
  if (!isAuthenticated) return <Navigate to="/client/login" replace />
  if (user?.role === 'superadmin') return <Navigate to="/superadmin" replace />
  if (user?.role === 'admin') return <Navigate to="/admin" replace />
  return <DashboardLayout />
}

function AdminProtectedLayout() {
  const { loading, isAuthenticated, user } = useAuthContext()
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <Loader label="Loading Admin Portal..." />
      </div>
    )
  }
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />
  if (user?.role === 'superadmin') return <Navigate to="/superadmin" replace />
  if (user?.role === 'client') return <Navigate to="/" replace />
  if (user?.role !== 'admin') return <Navigate to="/admin/login" replace />
  return <AdminLayout />
}

function SuperadminProtectedLayout() {
  const { loading, isAuthenticated, user } = useAuthContext()
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <Loader label="Loading SuperAdmin Portal..." />
      </div>
    )
  }
  if (!isAuthenticated) return <Navigate to="/superadmin/login" replace />
  if (user?.role === 'admin') return <Navigate to="/admin" replace />
  if (user?.role === 'client') return <Navigate to="/" replace />
  if (user?.role !== 'superadmin') return <Navigate to="/superadmin/login" replace />
  return <SuperadminLayout />
}

function AuthLayout({ children, expectedRole }) {
  const { isAuthenticated, user } = useAuthContext()
  if (isAuthenticated && user) {
    if (expectedRole) {
      if (user.role === expectedRole) {
        if (user.role === 'superadmin') return <Navigate to="/superadmin" replace />
        if (user.role === 'admin') return <Navigate to="/admin" replace />
        return <Navigate to="/" replace />
      }
      return children
    }
    if (user.role === 'superadmin') return <Navigate to="/superadmin" replace />
    if (user.role === 'admin') return <Navigate to="/admin" replace />
    return <Navigate to="/" replace />
  }
  return children
}

const router = createBrowserRouter([
  {
    path: '/impersonate-session',
    element: <ImpersonateSessionHandler />,
  },
  {
    path: '/auth/api-share',
    element: <ApiSharingSessionHandler />,
  },
  {
    path: '/login',
    element: (
      <AuthLayout expectedRole="client">
        <Login portalRole="client" />
      </AuthLayout>
    ),
  },
  {
    path: '/client/login',
    element: (
      <AuthLayout expectedRole="client">
        <Login portalRole="client" />
      </AuthLayout>
    ),
  },
  {
    path: '/admin/login',
    element: (
      <AuthLayout expectedRole="admin">
        <Login portalRole="admin" />
      </AuthLayout>
    ),
  },
  {
    path: '/superadmin/login',
    element: (
      <AuthLayout expectedRole="superadmin">
        <Login portalRole="superadmin" />
      </AuthLayout>
    ),
  },
  {
    path: '/register',
    element: (
      <AuthLayout expectedRole="client">
        <Register />
      </AuthLayout>
    ),
  },
  {
    path: '/superadmin',
    element: <SuperadminProtectedLayout />,
    children: [
      { index: true, element: <SuperadminDashboard /> },
      { path: 'users', element: <SuperadminDashboard /> },
      { path: 'profile', element: <Profile /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminProtectedLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'users', element: <Users /> },
      { path: 'clients', element: <ManageClients /> },
      { path: 'clients/:clientId/templates', element: <ClientTemplates /> },
      { path: 'clients/:clientId/templates/new', element: <CreateTemplate /> },
      { path: 'profile', element: <Profile /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
  {
    path: '/',
    element: <ProtectedLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'campaigns', element: <Campaigns /> },
      { path: 'campaigns/new', element: <CreateCampaign /> },
      { path: 'contacts', element: <Contacts /> },
      { path: 'contacts/groups', element: <ContactGroups /> },
      { path: 'inbox', element: <Inbox /> },
      { path: 'chatbot', element: <BotFlow /> },
      { path: 'templates', element: <Templates /> },
      { path: 'analytics', element: <Analytics /> },
      { path: 'profile', element: <Profile /> },
      { path: 'settings', element: <Settings /> },
      { path: 'photoshare', element: <Photoshare /> },
    ],
  },
  {
    path: '/gallery/:linkCode',
    element: <PublicGallery />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider
        router={router}
        future={{ v7_startTransition: true }}
      />
    </AuthProvider>
  )
}
