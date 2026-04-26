import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { instrutorAuthApi } from '../api/authInstrutor'
import type { Instrutor } from '../types'

interface InstructorAuthCtx {
  token: string | null
  instructor: Instrutor | null
  isAuthenticated: boolean
  login: (cpf: string, senha: string) => Promise<void>
  registro: (cpf: string, senha: string) => Promise<void>
  logout: () => void
  refreshMe: () => Promise<void>
}

const Ctx = createContext<InstructorAuthCtx | null>(null)
const TOKEN_KEY = 'instructor_token'

export function InstructorAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [instructor, setInstructor] = useState<Instrutor | null>(null)

  const login = useCallback(async (cpf: string, senha: string) => {
    const res = await instrutorAuthApi.login(cpf, senha)
    localStorage.setItem(TOKEN_KEY, res.access_token)
    setToken(res.access_token)
    setInstructor(res.instrutor)
  }, [])

  const registro = useCallback(async (cpf: string, senha: string) => {
    const res = await instrutorAuthApi.registro(cpf, senha)
    localStorage.setItem(TOKEN_KEY, res.access_token)
    setToken(res.access_token)
    setInstructor(res.instrutor)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setInstructor(null)
  }, [])

  const refreshMe = useCallback(async () => {
    if (!token) return
    try {
      const i = await instrutorAuthApi.me(token)
      setInstructor(i)
    } catch { logout() }
  }, [token, logout])

  return (
    <Ctx.Provider value={{ token, instructor, isAuthenticated: !!token, login, registro, logout, refreshMe }}>
      {children}
    </Ctx.Provider>
  )
}

export function useInstructorAuth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useInstructorAuth must be inside InstructorAuthProvider')
  return ctx
}
