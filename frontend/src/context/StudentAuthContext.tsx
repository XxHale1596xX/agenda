import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { authApi } from '../api/auth'
import type { Usuario } from '../types'

interface StudentAuthCtx {
  token: string | null
  student: Usuario | null
  isAuthenticated: boolean
  login: (cpf: string, senha: string) => Promise<void>
  registro: (data: { nome: string; cpf: string; email?: string; telefone?: string; senha: string }) => Promise<void>
  logout: () => void
  refreshMe: () => Promise<void>
}

const Ctx = createContext<StudentAuthCtx | null>(null)

const TOKEN_KEY = 'student_token'

export function StudentAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [student, setStudent] = useState<Usuario | null>(null)

  const login = useCallback(async (cpf: string, senha: string) => {
    const res = await authApi.login(cpf, senha)
    localStorage.setItem(TOKEN_KEY, res.access_token)
    setToken(res.access_token)
    setStudent(res.usuario)
  }, [])

  const registro = useCallback(async (data: Parameters<typeof authApi.registro>[0]) => {
    const res = await authApi.registro(data)
    localStorage.setItem(TOKEN_KEY, res.access_token)
    setToken(res.access_token)
    setStudent(res.usuario)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setStudent(null)
  }, [])

  const refreshMe = useCallback(async () => {
    if (!token) return
    try {
      const u = await authApi.me(token)
      setStudent(u)
    } catch {
      logout()
    }
  }, [token, logout])

  return (
    <Ctx.Provider value={{ token, student, isAuthenticated: !!token, login, registro, logout, refreshMe }}>
      {children}
    </Ctx.Provider>
  )
}

export function useStudentAuth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStudentAuth must be used inside StudentAuthProvider')
  return ctx
}
