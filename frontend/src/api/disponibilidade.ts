import type { DisponibilidadeMes } from '../types'

const BASE = import.meta.env.VITE_API_URL || ''

export const disponibilidadeApi = {
  getMes(anoMes: string): Promise<DisponibilidadeMes> {
    return fetch(`${BASE}/disponibilidade/mes/${anoMes}`).then(r => r.json())
  },
}
