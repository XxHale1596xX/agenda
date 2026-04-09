import type { Agendamento, AgendamentoPayload, AgendamentosFilter } from '../types'

// Vazio = usa proxy do Vite (ideal para Docker); URL explícita para dev local sem Docker
const BASE = import.meta.env.VITE_API_URL || ''

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })

  if (res.status === 204) return undefined as T

  const data = await res.json()
  if (!res.ok) throw new Error(data?.detail ?? `Erro ${res.status}`)
  return data as T
}

export const api = {
  list(filter?: AgendamentosFilter): Promise<Agendamento[]> {
    const params = new URLSearchParams()
    if (filter?.instrutor) params.set('instrutor', filter.instrutor)
    if (filter?.data_aula) params.set('data_aula', filter.data_aula)
    const qs = params.toString()
    return request(`/agendamentos/${qs ? `?${qs}` : ''}`)
  },

  get(id: number): Promise<Agendamento> {
    return request(`/agendamentos/${id}`)
  },

  create(payload: AgendamentoPayload): Promise<Agendamento> {
    return request('/agendamentos/', { method: 'POST', body: JSON.stringify(payload) })
  },

  update(id: number, payload: AgendamentoPayload): Promise<Agendamento> {
    return request(`/agendamentos/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
  },

  delete(id: number): Promise<void> {
    return request(`/agendamentos/${id}`, { method: 'DELETE' })
  },
}
