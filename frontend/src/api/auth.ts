import type { Usuario, Agendamento } from '../types'

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

export interface TokenResponse {
  access_token: string
  token_type: string
  usuario: Usuario
}

export const authApi = {
  login(cpf: string, senha: string): Promise<TokenResponse> {
    return request('/auth/login', { method: 'POST', body: JSON.stringify({ cpf, senha }) })
  },
  registro(data: {
    nome: string; cpf: string; email?: string; telefone?: string; senha: string
  }): Promise<TokenResponse> {
    return request('/auth/registro', { method: 'POST', body: JSON.stringify(data) })
  },
  me(token: string): Promise<Usuario> {
    return request('/auth/me', undefined, token)
  },
  updateMe(token: string, data: {
    nome?: string; email?: string; telefone?: string;
    senha_atual?: string; nova_senha?: string
  }): Promise<Usuario> {
    return request('/auth/me', { method: 'PUT', body: JSON.stringify(data) }, token)
  },
  meAgendamentos(token: string): Promise<Agendamento[]> {
    return request('/auth/me/agendamentos', undefined, token)
  },
}
