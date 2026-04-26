import type { Instrutor, Agendamento } from '../types'

const BASE = import.meta.env.VITE_API_URL || ''

async function request<T>(path: string, init?: RequestInit, token?: string): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${BASE}${path}`, { headers, ...init })
  if (res.status === 204) return undefined as T
  const data = await res.json()
  if (!res.ok) throw new Error(data?.detail ?? `Erro ${res.status}`)
  return data as T
}

export interface InstructorTokenResponse {
  access_token: string
  token_type: string
  instrutor: Instrutor
}

export interface DisponibilidadeSlot {
  id: number
  instrutor_id: number
  data: string
  hora: string
}

export const instrutorAuthApi = {
  login(cpf: string, senha: string): Promise<InstructorTokenResponse> {
    return request('/instrutor/login', { method: 'POST', body: JSON.stringify({ cpf, senha }) })
  },
  registro(cpf: string, senha: string): Promise<InstructorTokenResponse> {
    return request('/instrutor/registro', { method: 'POST', body: JSON.stringify({ cpf, senha }) })
  },
  me(token: string): Promise<Instrutor> {
    return request('/instrutor/me', undefined, token)
  },
  updateMe(token: string, data: { email?: string; telefone?: string; senha_atual?: string; nova_senha?: string }): Promise<Instrutor> {
    return request('/instrutor/me', { method: 'PUT', body: JSON.stringify(data) }, token)
  },
  agenda(token: string): Promise<Agendamento[]> {
    return request('/instrutor/me/agenda', undefined, token)
  },
  disponibilidade(token: string, dataInicio?: string, dataFim?: string): Promise<DisponibilidadeSlot[]> {
    const p = new URLSearchParams()
    if (dataInicio) p.set('data_inicio', dataInicio)
    if (dataFim) p.set('data_fim', dataFim)
    const qs = p.toString()
    return request(`/instrutor/me/disponibilidade${qs ? `?${qs}` : ''}`, undefined, token)
  },
  marcarSlot(token: string, data: string, hora: string): Promise<DisponibilidadeSlot> {
    return request('/instrutor/me/disponibilidade', { method: 'POST', body: JSON.stringify({ data, hora }) }, token)
  },
  desmarcarSlot(token: string, id: number): Promise<void> {
    return request(`/instrutor/me/disponibilidade/${id}`, { method: 'DELETE' }, token)
  },
  marcarBatch(token: string, slots: { data: string; hora: string }[]): Promise<DisponibilidadeSlot[]> {
    return request('/instrutor/me/disponibilidade/batch', { method: 'POST', body: JSON.stringify({ slots }) }, token)
  },
}
