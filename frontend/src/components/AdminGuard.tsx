import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'

export function AdminGuard({ children }: { children: ReactNode }) {
  const token = sessionStorage.getItem('admin_token')
  if (!token) return <Navigate to="/entrar-admin" replace />
  return <>{children}</>
}
