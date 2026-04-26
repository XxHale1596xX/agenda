import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Car, Lock, Loader2, AlertCircle } from 'lucide-react'
import { useStudentAuth } from '../context/StudentAuthContext'
import { cpfDigits, maskCPF } from '../lib/utils'

export function LoginPage() {
  const { login } = useStudentAuth()
  const navigate = useNavigate()
  const [cpf, setCpf] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(cpfDigits(cpf), senha)
      navigate('/portal')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top nav */}
      <nav className="h-14 bg-white border-b border-slate-200 flex items-center px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Car size={16} className="text-white" />
          </div>
          <span className="font-bold text-slate-900 text-sm">AutoEscola dos Brothers</span>
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Lock size={24} className="text-blue-600" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">Entrar no portal</h1>
              <p className="text-sm text-slate-500 mt-1">Acesse suas aulas e informações</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="login-cpf" className="block text-sm font-medium text-slate-700 mb-1">CPF</label>
                <input
                  id="login-cpf"
                  type="text"
                  inputMode="numeric"
                  maxLength={14}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={e => setCpf(maskCPF(e.target.value))}
                  required
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="login-senha" className="block text-sm font-medium text-slate-700">Senha</label>
                </div>
                <input
                  id="login-senha"
                  type="password"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Sua senha"
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2.5 rounded-lg" role="alert">
                  <AlertCircle size={15} className="shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition"
              >
                {loading && <Loader2 size={15} className="animate-spin" />}
                Entrar
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-5">
              Não tem conta?{' '}
              <Link to="/cadastro" className="text-blue-600 font-medium hover:underline">
                Cadastre-se
              </Link>
            </p>
          </div>

          <p className="text-center text-xs text-slate-400 mt-4">
            <Link to="/" className="hover:text-slate-600">← Voltar ao início</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
