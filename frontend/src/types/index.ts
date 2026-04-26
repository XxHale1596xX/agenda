export interface Agendamento {
  id: number
  aluno: string
  instrutor: string
  data_aula: string   // "YYYY-MM-DD"
  hora_aula: string   // "HH:MM:SS"
}

export interface AgendamentoPayload {
  aluno: string
  instrutor: string
  data_aula: string
  hora_aula: string
}

export interface AgendamentosFilter {
  instrutor?: string
  data_aula?: string
}

/** Retornado pela listagem — dados sensíveis mascarados pelo backend */
export interface UsuarioMasked {
  id: number
  nome: string
  cpf_mascarado: string      // "***.***.247-**"
  email_mascarado: string | null
  telefone: string | null
  ativo: boolean
  criado_em: string
}

/** Retornado pelo endpoint de detalhe (/usuarios/{id}) — dados completos */
export interface Usuario {
  id: number
  nome: string
  cpf: string
  email: string | null
  telefone: string | null
  ativo: boolean
  criado_em: string
}

export interface UsuarioPayload {
  nome: string
  cpf: string
  email?: string
  telefone?: string
}

export interface UsuarioUpdate {
  nome?: string
  email?: string
  telefone?: string
  ativo?: boolean
}

export interface Bloqueio {
  id: number
  data: string          // "YYYY-MM-DD"
  hora: string | null   // "HH:MM:SS" ou null (dia inteiro)
  motivo: string | null
  criado_em: string
}

export interface BloqueioPayload {
  data: string
  hora: string | null
  motivo?: string
}

export type StatusSlot = 'disponivel' | 'ocupado' | 'bloqueado'

/** { "08:00": "disponivel", "09:00": "ocupado", ... } */
export type DisponibilidadeDia = Record<string, StatusSlot>

/** { "2026-04-07": { "08:00": "disponivel", ... }, ... } */
export type DisponibilidadeMes = Record<string, DisponibilidadeDia>

// ── Instrutores ───────────────────────────────────────────────────────────────

export interface Instrutor {
  id: number
  nome: string
  cpf: string
  email: string | null
  telefone: string | null
  categorias: string   // "B" ou "A,B"
  ativo: boolean
  criado_em: string
}

export interface InstrutorPayload {
  nome: string
  cpf: string
  email?: string
  telefone?: string
  categorias: string
}

export interface InstrutorUpdate {
  nome?: string
  email?: string
  telefone?: string
  categorias?: string
  ativo?: boolean
}

// ── Veículos ─────────────────────────────────────────────────────────────────

export interface Veiculo {
  id: number
  placa: string
  modelo: string
  marca: string
  ano: number | null
  categoria: string
  ativo: boolean
  km_atual: number
  criado_em: string
}

export interface VeiculoPayload {
  placa: string
  modelo: string
  marca: string
  ano?: number
  categoria: string
  km_atual?: number
}

export interface VeiculoUpdate {
  modelo?: string
  marca?: string
  ano?: number
  categoria?: string
  ativo?: boolean
  km_atual?: number
}
