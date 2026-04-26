import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Car, UserPlus, Loader2, AlertCircle } from 'lucide-react'
import { useStudentAuth } from '../context/StudentAuthContext'
import { cpfDigits, maskCPF, validateCPF } from '../lib/utils'

export function RegisterPage() {
  const { registro } = useStudentAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ nome: '', cpf: '', email: '', telefone: '', senha: '', confirmar: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }))
  }

  const cpfDigitCount = form.cpf.replace(/\D/g, '').length
  const cpfOk = validateCPF(form.cpf)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!cpfOk) { setError('CPF inválido.'); return }
    if (form.senha.length < 6) { setError('A senha deve ter no mínimo 6 caracteres.'); return }
    if (form.senha !== form.confirmar) { setError('As senhas não coincidem.'); return }
    setLoading(true)
    try {
      await registro({
        nome: form.nome,
        cpf: cpfDigits(form.cpf),
        email: form.email || undefined,
        telefone: form.telefone || undefined,
        senha: form.senha,
      })
      navigate('/portal')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta')
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

      <div className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <UserPlus size={24} className="text-green-600" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">Criar conta</h1>
              <p className="text-sm text-slate-500 mt-1">Já é aluno? Cadastre-se com seu CPF.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="reg-nome" className="block text-sm font-medium text-slate-700 mb-1">Nome completo *</label>
                <input id="reg-nome" value={form.nome} onChange={set('nome')} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="Seu nome" required />
              </div>

              <div>
                <label htmlFor="reg-cpf" className="block text-sm font-medium text-slate-700 mb-1">CPF *</label>
                <div className="relative">
                  <input
                    id="reg-cpf"
                    inputMode="numeric"
                    maxLength={14}
                    value={form.cpf}
                    onChange={e => setForm(f => ({ ...f, cpf: maskCPF(e.target.value) }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="000.000.000-00"
                    required
                  />
                  {cpfDigitCount >= 11 && (
                    <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-lg ${cpfOk ? 'text-green-500' : 'text-red-500'}`}>
                      {cpfOk ? '✓' : '✗'}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="reg-email" className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
                  <input id="reg-email" type="email" value={form.email} onChange={set('email')} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="email@exemplo.com" />
                </div>
                <div>
                  <label htmlFor="reg-tel" className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
                  <input id="reg-tel" value={form.telefone} onChange={set('telefone')} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="(11) 99999-9999" />
                </div>
              </div>

              <div>
                <label htmlFor="reg-senha" className="block text-sm font-medium text-slate-700 mb-1">Senha * <span className="text-slate-400 font-normal">(mín. 6 caracteres)</span></label>
                <input id="reg-senha" type="password" value={form.senha} onChange={set('senha')} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="Crie uma senha" required />
              </div>
              <div>
                <label htmlFor="reg-conf" className="block text-sm font-medium text-slate-700 mb-1">Confirmar senha *</label>
                <input
                  id="reg-conf"
                  type="password"
                  value={form.confirmar}
                  onChange={set('confirmar')}
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${form.confirmar && form.confirmar !== form.senha ? 'border-red-300' : 'border-slate-200 focus:border-blue-500'}`}
                  placeholder="Repita a senha"
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
                Criar conta
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-5">
              Já tem conta?{' '}
              <Link to="/entrar" className="text-blue-600 font-medium hover:underline">Entrar</Link>
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
