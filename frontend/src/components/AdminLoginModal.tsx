import { useState } from 'react'
import { Lock, Loader2, ShieldCheck } from 'lucide-react'

interface Props {
  onLogin: (password: string) => void
  loading: boolean
  error: string | null
}

export function AdminLoginModal({ onLogin, loading, error }: Props) {
  const [password, setPassword] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.trim()) onLogin(password.trim())
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="card w-full max-w-sm p-8 text-center">
        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <ShieldCheck size={28} className="text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-1">Área Restrita</h2>
        <p className="text-sm text-slate-500 mb-6">
          Insira a senha de admin para gerenciar datas e bloqueios.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              className="input pl-9 text-center tracking-widest"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoFocus
            />
          </div>
          {error && (
            <p className="text-sm text-red-500 font-medium">{error}</p>
          )}
          <button type="submit" disabled={loading || !password} className="btn-primary w-full justify-center">
            {loading ? <Loader2 size={15} className="animate-spin" /> : null}
            Entrar
          </button>
        </form>
      </div>
    </div>
  )
}
