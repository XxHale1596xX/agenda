import { useState } from 'react'
import { bloqueiosApi } from '../api/bloqueios'

export function useAdminSession() {
  const [adminToken, setAdminToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function login(password: string) {
    setLoading(true)
    setError(null)
    try {
      await bloqueiosApi.validateAdmin(password)
      setAdminToken(password)
    } catch {
      setError('Senha incorreta.')
    } finally {
      setLoading(false)
    }
  }

  function logout() {
    setAdminToken(null)
  }

  return { adminToken, isAdmin: adminToken !== null, login, logout, loading, error }
}
