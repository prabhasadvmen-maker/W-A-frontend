export function getTokenKey() {
  const isSuperadminPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/superadmin')
  return isSuperadminPath ? 'superadmin_accessToken' : 'accessToken'
}

export function getActiveToken() {
  const key = getTokenKey()
  return sessionStorage.getItem(key) || localStorage.getItem(key) || null
}
