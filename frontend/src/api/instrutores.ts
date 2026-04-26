import type { Instrutor, InstrutorPayload, InstrutorUpdate } from '../types'

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

export const instrutoresApi = {
  list(busca?: string, ativo?: boolean): Promise<Instrutor[]> {
    const p = new URLSearchParams()
    if (busca) p.set('busca', busca)
    if (ativo !== undefined) p.set('ativo', String(ativo))
    const qs = p.toString()
    return request(`/instrutores/${qs ? `?${qs}` : ''}`)
  },
  get(id: number): Promise<Instrutor> {
    return request(`/instrutores/${id}`)
  },
  create(payload: InstrutorPayload, adminToken: string): Promise<Instrutor> {
    return request('/instrutores/', adminToken, { method: 'POST', body: JSON.stringify(payload) })
  },
  update(id: number, payload: InstrutorUpdate, adminToken: string): Promise<Instrutor> {
    return request(`/instrutores/${id}`, adminToken, { method: 'PUT', body: JSON.stringify(payload) })
  },
  delete(id: number, adminToken: string): Promise<void> {
    return request(`/instrutores/${id}`, adminToken, { method: 'DELETE' })
  },
}
