import type { Bloqueio, BloqueioPayload } from '../types'

const BASE = import.meta.env.VITE_API_URL || ''

async function request<T>(path: string, adminToken?: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (adminToken) headers['x-admin-token'] = adminToken

  const res = await fetch(`${BASE}${path}`, { headers, ...init })
  if (res.status === 204) return undefined as T
  const data = await res.json()
  if (!res.ok) throw new Error(data?.detail ?? `Erro ${res.status}`)
  return data as T
}

export const bloqueiosApi = {
  list(data?: string): Promise<Bloqueio[]> {
    const qs = data ? `?data=${data}` : ''
    return request(`/bloqueios/${qs}`)
  },

  create(payload: BloqueioPayload, adminToken: string): Promise<Bloqueio> {
    return request('/bloqueios/', adminToken, { method: 'POST', body: JSON.stringify(payload) })
  },

  delete(id: number, adminToken: string): Promise<void> {
    return request(`/bloqueios/${id}`, adminToken, { method: 'DELETE' })
  },

  validateAdmin(token: string): Promise<{ ok: boolean }> {
    return request('/bloqueios/validar-admin', token)
  },
}
