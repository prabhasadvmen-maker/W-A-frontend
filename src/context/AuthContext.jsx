import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authApi } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadMe = useCallback(async () => {
    const isSuperadminPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/superadmin')
    const token = isSuperadminPath
      ? (sessionStorage.getItem('superadmin_accessToken') || localStorage.getItem('superadmin_accessToken') || sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken'))
      : (sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken') || sessionStorage.getItem('superadmin_accessToken') || localStorage.getItem('superadmin_accessToken'))

    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      const { data } = await authApi.me()
      if (data.success) {
        setUser(data.data.user)
        return data.data.user
      } else {
        setUser(null)
        return null
      }
    } catch {
      setUser(null)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMe()
  }, [loadMe])

  const login = useCallback(async (email, password, expectedRole = null) => {
    const { data } = await authApi.login({ email, password, expectedRole })
    if (data.success && data.data?.accessToken) {
      const token = data.data.accessToken
      const userRole = data.data?.user?.role
      if (userRole === 'superadmin' || expectedRole === 'superadmin') {
        sessionStorage.setItem('superadmin_accessToken', token)
        localStorage.setItem('superadmin_accessToken', token)
      } else {
        sessionStorage.setItem('accessToken', token)
        localStorage.setItem('accessToken', token)
      }
      setUser(data.data.user)
    }
    return data
  }, [])

  const register = useCallback(async (payload) => {
    const { data } = await authApi.register(payload)
    if (data.success && data.data?.accessToken) {
      const token = data.data.accessToken
      sessionStorage.setItem('accessToken', token)
      localStorage.setItem('accessToken', token)
      setUser(data.data.user)
    }
    return data
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      /* ignore */
    }
    const isSuperadminPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/superadmin')
    if (isSuperadminPath) {
      sessionStorage.removeItem('superadmin_accessToken')
      localStorage.removeItem('superadmin_accessToken')
    } else {
      sessionStorage.removeItem('accessToken')
      localStorage.removeItem('accessToken')
      sessionStorage.removeItem('isImpersonatedSession')
      localStorage.removeItem('originalAccessToken')
      localStorage.removeItem('originalUser')
    }
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await authApi.me()
      if (data.success) setUser(data.data.user)
    } catch {
      /* ignore */
    }
  }, [])

  const impersonate = useCallback(async (targetUserId) => {
    const { data } = await authApi.impersonate({ targetUserId })
    if (data.success && data.data?.accessToken) {
      if (!localStorage.getItem('originalAccessToken')) {
        localStorage.setItem('originalAccessToken', localStorage.getItem('accessToken') || '')
        localStorage.setItem('originalUser', JSON.stringify(user))
      }
      localStorage.setItem('accessToken', data.data.accessToken)
      setUser(data.data.user)
    }
    return data
  }, [user])

  const openWorkspaceInNewTab = useCallback(async (targetUserId, targetRole = 'client') => {
    const { data } = await authApi.impersonate({ targetUserId })
    if (data.success && data.data?.accessToken) {
      const token = data.data.accessToken
      const url = `/impersonate-session?token=${encodeURIComponent(token)}&role=${targetRole}`
      window.open(url, '_blank')
    }
    return data
  }, [])

  const revertImpersonation = useCallback(async () => {
    const origToken = localStorage.getItem('originalAccessToken')
    const origUserStr = localStorage.getItem('originalUser')
    if (origToken) {
      localStorage.setItem('accessToken', origToken)
      localStorage.removeItem('originalAccessToken')
      localStorage.removeItem('originalUser')
      if (origUserStr) {
        try { setUser(JSON.parse(origUserStr)) } catch { /* ignore */ }
      }
      await refreshUser()
    }
  }, [refreshUser])

  const isImpersonating = Boolean(localStorage.getItem('originalAccessToken')) || Boolean(sessionStorage.getItem('isImpersonatedSession'))
  let originalUser = null
  try {
    const str = localStorage.getItem('originalUser')
    if (str) originalUser = JSON.parse(str)
  } catch { /* ignore */ }

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      loadMe,
      refreshUser,
      impersonate,
      openWorkspaceInNewTab,
      revertImpersonation,
      isImpersonating,
      originalUser,
      isAuthenticated: Boolean(user),
    }),
    [user, loading, login, register, logout, loadMe, refreshUser, impersonate, openWorkspaceInNewTab, revertImpersonation, isImpersonating, originalUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}
