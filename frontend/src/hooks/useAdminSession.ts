import { useState } from 'react'
import { bloqueiosApi } from '../api/bloqueios'

const SESSION_KEY = 'admin_token'

export function useAdminSession() {
  const [adminToken, setAdminToken] = useState<string | null>(
    () => sessionStorage.getItem(SESSION_KEY),
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function login(password: string) {
    setLoading(true)
    setError(null)
    try {
      await bloqueiosApi.validateAdmin(password)
      sessionStorage.setItem(SESSION_KEY, password)
      setAdminToken(password)
    } catch {
      setError('Senha incorreta.')
    } finally {
      setLoading(false)
    }
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY)
    setAdminToken(null)
  }

  return { adminToken, isAdmin: adminToken !== null, login, logout, loading, error }
}
