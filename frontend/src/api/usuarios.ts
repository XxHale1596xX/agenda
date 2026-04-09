import type { Usuario, UsuarioMasked, UsuarioPayload, UsuarioUpdate } from '../types'

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

export const usuariosApi = {
  /** Listagem — retorna dados mascarados */
  list(busca?: string, ativo?: boolean): Promise<UsuarioMasked[]> {
    const p = new URLSearchParams()
    if (busca) p.set('busca', busca)
    if (ativo !== undefined) p.set('ativo', String(ativo))
    const qs = p.toString()
    return request(`/usuarios/${qs ? `?${qs}` : ''}`)
  },

  /** Detalhe completo — usar antes de abrir formulário de edição */
  get(id: number): Promise<Usuario> {
    return request(`/usuarios/${id}`)
  },

  create(payload: UsuarioPayload): Promise<Usuario> {
    return request('/usuarios/', { method: 'POST', body: JSON.stringify(payload) })
  },

  update(id: number, payload: UsuarioUpdate): Promise<Usuario> {
    return request(`/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
  },

  delete(id: number): Promise<void> {
    return request(`/usuarios/${id}`, { method: 'DELETE' })
  },
}
