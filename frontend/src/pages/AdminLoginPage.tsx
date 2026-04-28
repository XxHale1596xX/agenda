import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Car, ShieldCheck, Lock, Loader2, AlertCircle } from 'lucide-react'
import { bloqueiosApi } from '../api/bloqueios'

const SESSION_KEY = 'admin_token'

export function AdminLoginPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await bloqueiosApi.validateAdmin(password.trim())
      sessionStorage.setItem(SESSION_KEY, password.trim())
      navigate('/admin', { replace: true })
    } catch {
      setError('Senha incorreta.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Minimal nav */}
      <nav className="h-14 flex items-center px-6 border-b border-white/5">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Car size={16} className="text-white" />
          </div>
          <span className="font-bold text-white text-sm">AutoEscola dos Brothers</span>
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="bg-slate-800 rounded-2xl border border-white/10 shadow-2xl p-8">
            <div className="text-center mb-7">
              <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ShieldCheck size={28} className="text-blue-400" />
              </div>
              <h1 className="text-xl font-bold text-white">Área Administrativa</h1>
              <p className="text-sm text-slate-400 mt-1">Acesso restrito a administradores</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="admin-pw" className="sr-only">Senha de administrador</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input
                    id="admin-pw"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className={`w-full bg-slate-700 border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition ${
                      error
                        ? 'border-red-500/50 focus:ring-red-500/30'
                        : 'border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20'
                    }`}
                    placeholder="Senha de admin"
                    autoFocus
                    aria-invalid={!!error}
                    aria-describedby={error ? 'admin-error' : undefined}
                  />
                </div>
              </div>

              {error && (
                <div id="admin-error" role="alert" className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-3 py-2.5 rounded-lg">
                  <AlertCircle size={14} className="shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !password}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                Entrar
              </button>
            </form>
          </div>

          <p className="text-center mt-4 text-xs text-slate-600">
            <Link to="/" className="hover:text-slate-400 transition">← Voltar ao início</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
