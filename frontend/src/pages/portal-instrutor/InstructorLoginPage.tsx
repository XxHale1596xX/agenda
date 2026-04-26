import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Car, GraduationCap, Loader2, AlertCircle } from 'lucide-react'
import { useInstructorAuth } from '../../context/InstructorAuthContext'
import { cpfDigits, maskCPF } from '../../lib/utils'

type Mode = 'login' | 'registro'

export function InstructorLoginPage() {
  const { login, registro } = useInstructorAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('login')
  const [cpf, setCpf] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (mode === 'registro' && senha !== confirmar) { setError('As senhas não coincidem.'); return }
    if (senha.length < 6) { setError('Senha deve ter no mínimo 6 caracteres.'); return }
    setLoading(true)
    try {
      if (mode === 'login') await login(cpfDigits(cpf), senha)
      else await registro(cpfDigits(cpf), senha)
      navigate('/portal-instrutor')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao autenticar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
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
              <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <GraduationCap size={26} className="text-green-600" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">Portal do Instrutor</h1>
              <p className="text-sm text-slate-500 mt-1">
                {mode === 'login' ? 'Entre com seu CPF e senha' : 'Crie sua senha de acesso'}
              </p>
            </div>

            {/* Mode toggle */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-5">
              {(['login', 'registro'] as Mode[]).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMode(m); setError(null) }}
                  className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition ${mode === m ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                >
                  {m === 'login' ? 'Entrar' : 'Primeiro acesso'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="inst-cpf" className="block text-sm font-medium text-slate-700 mb-1">CPF</label>
                <input
                  id="inst-cpf"
                  inputMode="numeric"
                  maxLength={14}
                  value={cpf}
                  onChange={e => setCpf(maskCPF(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="000.000.000-00"
                  required
                />
              </div>
              <div>
                <label htmlFor="inst-senha" className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
                <input
                  id="inst-senha"
                  type="password"
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder={mode === 'registro' ? 'Crie uma senha (mín. 6 caracteres)' : 'Sua senha'}
                  required
                />
              </div>
              {mode === 'registro' && (
                <div>
                  <label htmlFor="inst-conf" className="block text-sm font-medium text-slate-700 mb-1">Confirmar senha</label>
                  <input
                    id="inst-conf"
                    type="password"
                    value={confirmar}
                    onChange={e => setConfirmar(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Repita a senha"
                    required
                  />
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2.5 rounded-lg" role="alert">
                  <AlertCircle size={15} className="shrink-0" />
                  {error}
                </div>
              )}

              {mode === 'registro' && (
                <p className="text-xs text-slate-400 bg-amber-50 px-3 py-2 rounded-lg">
                  Você precisa ter sido cadastrado pelo administrador antes de criar sua senha.
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition"
              >
                {loading && <Loader2 size={15} className="animate-spin" />}
                {mode === 'login' ? 'Entrar' : 'Criar senha'}
              </button>
            </form>
          </div>

          <div className="text-center mt-4 space-y-1">
            <p className="text-xs text-slate-400">
              <Link to="/" className="hover:text-slate-600">← Voltar ao início</Link>
            </p>
            <p className="text-xs text-slate-400">
              É aluno?{' '}
              <Link to="/entrar" className="text-blue-600 hover:underline">Acesse o portal do aluno</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
