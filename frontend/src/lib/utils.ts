import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

export function formatTime(timeStr: string) {
  return timeStr.slice(0, 5) // "HH:MM"
}

// ── CPF ───────────────────────────────────────────────────────────────────────

/** Remove tudo que não é dígito */
export function cpfDigits(cpf: string) {
  return cpf.replace(/\D/g, '')
}

/** Formata 11 dígitos como XXX.XXX.XXX-XX */
export function formatCPF(cpf: string) {
  const d = cpfDigits(cpf)
  if (d.length !== 11) return cpf
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

/** Aplica máscara progressiva enquanto o usuário digita */
export function maskCPF(value: string) {
  const d = cpfDigits(value).slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

/** Valida CPF (mesma lógica do backend) */
export function validateCPF(cpf: string): boolean {
  const d = cpfDigits(cpf)
  if (d.length !== 11) return false
  if (new Set(d).size === 1) return false

  const calc = (digits: string, weights: number[]): number => {
    const sum = digits.split('').reduce((acc, c, i) => acc + parseInt(c) * weights[i], 0)
    const rest = sum % 11
    return rest < 2 ? 0 : 11 - rest
  }

  const w1 = [10, 9, 8, 7, 6, 5, 4, 3, 2]
  const w2 = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]
  return calc(d.slice(0, 9), w1) === parseInt(d[9]) &&
         calc(d.slice(0, 10), w2) === parseInt(d[10])
}
