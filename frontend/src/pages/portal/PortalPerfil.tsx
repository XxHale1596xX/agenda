import { useState, useEffect } from 'react'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { useStudentAuth } from '../../context/StudentAuthContext'
import { authApi } from '../../api/auth'
import { maskCPF } from '../../lib/utils'

export function PortalPerfil() {
  const { student, token, refreshMe } = useStudentAuth()
  const [form, setForm] = useState({ nome: '', email: '', telefone: '' })
  const [senhaForm, setSenhaForm] = useState({ atual: '', nova: '', confirmar: '' })
  const [loadingPerfil, setLoadingPerfil] = useState(false)
  const [loadingSenha, setLoadingSenha] = useState(false)
  const [msgPerfil, setMsgPerfil] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [msgSenha, setMsgSenha] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  useEffect(() => {
    if (student) {
      setForm({ nome: student.nome, email: student.email ?? '', telefone: student.telefone ?? '' })
    }
  }, [student])

  async function handlePerfilSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return
    setLoadingPerfil(true); setMsgPerfil(null)
    try {
      await authApi.updateMe(token, { nome: form.nome, email: form.email || undefined, telefone: form.telefone || undefined })
      await refreshMe()
      setMsgPerfil({ type: 'ok', text: 'Dados atualizados com sucesso!' })
    } catch (e: unknown) {
      setMsgPerfil({ type: 'err', text: e instanceof Error ? e.message : 'Erro ao salvar' })
    } finally {
      setLoadingPerfil(false)
    }
  }

  async function handleSenhaSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return
    if (senhaForm.nova !== senhaForm.confirmar) {
      setMsgSenha({ type: 'err', text: 'As senhas não coincidem.' })
      return
    }
    if (senhaForm.nova.length < 6) {
      setMsgSenha({ type: 'err', text: 'A nova senha deve ter no mínimo 6 caracteres.' })
      return
    }
    setLoadingSenha(true); setMsgSenha(null)
    try {
      await authApi.updateMe(token, { senha_atual: senhaForm.atual, nova_senha: senhaForm.nova })
      setSenhaForm({ atual: '', nova: '', confirmar: '' })
      setMsgSenha({ type: 'ok', text: 'Senha alterada com sucesso!' })
    } catch (e: unknown) {
      setMsgSenha({ type: 'err', text: e instanceof Error ? e.message : 'Erro ao alterar senha' })
    } finally {
      setLoadingSenha(false)
    }
  }

  return (
    <div className="space-y-6 max-w-lg">
      <h2 className="text-lg font-bold text-slate-900">Meu Perfil</h2>

      {/* Dados pessoais */}
      <div className="card p-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Dados pessoais</h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">CPF</label>
          <input
            value={student ? maskCPF(student.cpf) : ''}
            disabled
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500 cursor-not-allowed font-mono"
          />
          <p className="text-xs text-slate-400 mt-1">O CPF não pode ser alterado.</p>
        </div>

        <form onSubmit={handlePerfilSubmit} className="space-y-4">
          <div>
            <label htmlFor="perf-nome" className="block text-sm font-medium text-slate-700 mb-1">Nome completo</label>
            <input
              id="perf-nome"
              value={form.nome}
              onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              required
            />
          </div>
          <div>
            <label htmlFor="perf-email" className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
            <input
              id="perf-email"
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="email@exemplo.com"
            />
          </div>
          <div>
            <label htmlFor="perf-tel" className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
            <input
              id="perf-tel"
              value={form.telefone}
              onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="(11) 99999-9999"
            />
          </div>

          {msgPerfil && (
            <div className={`flex items-center gap-2 text-sm px-3 py-2.5 rounded-lg ${msgPerfil.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`} role="alert">
              {msgPerfil.type === 'ok' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
              {msgPerfil.text}
            </div>
          )}

          <button type="submit" disabled={loadingPerfil} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-lg transition text-sm">
            {loadingPerfil && <Loader2 size={14} className="animate-spin" />}
            Salvar alterações
          </button>
        </form>
      </div>

      {/* Alterar senha */}
      <div className="card p-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Alterar senha</h3>
        <form onSubmit={handleSenhaSubmit} className="space-y-4">
          {[
            { id: 'senha-atual', label: 'Senha atual', key: 'atual' as const },
            { id: 'senha-nova', label: 'Nova senha', key: 'nova' as const },
            { id: 'senha-conf', label: 'Confirmar nova senha', key: 'confirmar' as const },
          ].map(f => (
            <div key={f.id}>
              <label htmlFor={f.id} className="block text-sm font-medium text-slate-700 mb-1">{f.label}</label>
              <input
                id={f.id}
                type="password"
                value={senhaForm[f.key]}
                onChange={e => setSenhaForm(s => ({ ...s, [f.key]: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>
          ))}

          {msgSenha && (
            <div className={`flex items-center gap-2 text-sm px-3 py-2.5 rounded-lg ${msgSenha.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`} role="alert">
              {msgSenha.type === 'ok' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
              {msgSenha.text}
            </div>
          )}

          <button type="submit" disabled={loadingSenha} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-lg transition text-sm">
            {loadingSenha && <Loader2 size={14} className="animate-spin" />}
            Alterar senha
          </button>
        </form>
      </div>
    </div>
  )
}
