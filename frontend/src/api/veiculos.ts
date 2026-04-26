import type { Veiculo, VeiculoPayload, VeiculoUpdate } from '../types'

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

export const veiculosApi = {
  list(busca?: string, ativo?: boolean): Promise<Veiculo[]> {
    const p = new URLSearchParams()
    if (busca) p.set('busca', busca)
    if (ativo !== undefined) p.set('ativo', String(ativo))
    const qs = p.toString()
    return request(`/veiculos/${qs ? `?${qs}` : ''}`)
  },
  get(id: number): Promise<Veiculo> {
    return request(`/veiculos/${id}`)
  },
  create(payload: VeiculoPayload, adminToken: string): Promise<Veiculo> {
    return request('/veiculos/', adminToken, { method: 'POST', body: JSON.stringify(payload) })
  },
  update(id: number, payload: VeiculoUpdate, adminToken: string): Promise<Veiculo> {
    return request(`/veiculos/${id}`, adminToken, { method: 'PUT', body: JSON.stringify(payload) })
  },
  delete(id: number, adminToken: string): Promise<void> {
    return request(`/veiculos/${id}`, adminToken, { method: 'DELETE' })
  },
}
