import { useState, useEffect } from 'react'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { useInstructorAuth } from '../../context/InstructorAuthContext'
import { instrutorAuthApi } from '../../api/authInstrutor'
import { maskCPF } from '../../lib/utils'

export function InstructorPerfil() {
  const { instructor, token, refreshMe } = useInstructorAuth()
  const [form, setForm] = useState({ email: '', telefone: '' })
  const [senhaForm, setSenhaForm] = useState({ atual: '', nova: '', confirmar: '' })
  const [loadingP, setLoadingP] = useState(false)
  const [loadingS, setLoadingS] = useState(false)
  const [msgP, setMsgP] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [msgS, setMsgS] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  useEffect(() => {
    if (instructor) setForm({ email: instructor.email ?? '', telefone: instructor.telefone ?? '' })
  }, [instructor])

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return
    setLoadingP(true); setMsgP(null)
    try {
      await instrutorAuthApi.updateMe(token, { email: form.email || undefined, telefone: form.telefone || undefined })
      await refreshMe()
      setMsgP({ type: 'ok', text: 'Dados atualizados!' })
    } catch (e: unknown) {
      setMsgP({ type: 'err', text: e instanceof Error ? e.message : 'Erro ao salvar' })
    } finally { setLoadingP(false) }
  }

  async function saveSenha(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return
    if (senhaForm.nova !== senhaForm.confirmar) { setMsgS({ type: 'err', text: 'As senhas não coincidem.' }); return }
    setLoadingS(true); setMsgS(null)
    try {
      await instrutorAuthApi.updateMe(token, { senha_atual: senhaForm.atual, nova_senha: senhaForm.nova })
      setSenhaForm({ atual: '', nova: '', confirmar: '' })
      setMsgS({ type: 'ok', text: 'Senha alterada com sucesso!' })
    } catch (e: unknown) {
      setMsgS({ type: 'err', text: e instanceof Error ? e.message : 'Erro' })
    } finally { setLoadingS(false) }
  }

  return (
    <div className="space-y-6 max-w-lg">
      <h2 className="text-lg font-bold text-slate-900">Meu Perfil</h2>

      <div className="card p-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Dados</h3>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Nome</label>
            <p className="text-sm font-medium text-slate-900">{instructor?.nome}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Categorias</label>
            <div className="flex gap-1">
              {instructor?.categorias.split(',').map(c => (
                <span key={c} className="badge bg-green-100 text-green-700">{c}</span>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">CPF</label>
            <p className="text-sm font-mono text-slate-500">{instructor ? maskCPF(instructor.cpf) : ''}</p>
          </div>
        </div>

        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label htmlFor="ip-email" className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
            <input id="ip-email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="email@exemplo.com" />
          </div>
          <div>
            <label htmlFor="ip-tel" className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
            <input id="ip-tel" value={form.telefone} onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="(11) 99999-9999" />
          </div>
          {msgP && (
            <div className={`flex items-center gap-2 text-sm px-3 py-2.5 rounded-lg ${msgP.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`} role="alert">
              {msgP.type === 'ok' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
              {msgP.text}
            </div>
          )}
          <button type="submit" disabled={loadingP} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-lg transition text-sm">
            {loadingP && <Loader2 size={14} className="animate-spin" />}
            Salvar
          </button>
        </form>
      </div>

      <div className="card p-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Alterar senha</h3>
        <form onSubmit={saveSenha} className="space-y-4">
          {[
            { id: 'ip-sa', label: 'Senha atual',         key: 'atual' as const },
            { id: 'ip-sn', label: 'Nova senha',          key: 'nova' as const },
            { id: 'ip-sc', label: 'Confirmar nova senha', key: 'confirmar' as const },
          ].map(f => (
            <div key={f.id}>
              <label htmlFor={f.id} className="block text-sm font-medium text-slate-700 mb-1">{f.label}</label>
              <input id={f.id} type="password" value={senhaForm[f.key]}
                onChange={e => setSenhaForm(s => ({ ...s, [f.key]: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" required />
            </div>
          ))}
          {msgS && (
            <div className={`flex items-center gap-2 text-sm px-3 py-2.5 rounded-lg ${msgS.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`} role="alert">
              {msgS.type === 'ok' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
              {msgS.text}
            </div>
          )}
          <button type="submit" disabled={loadingS} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-lg transition text-sm">
            {loadingS && <Loader2 size={14} className="animate-spin" />}
            Alterar senha
          </button>
        </form>
      </div>
    </div>
  )
}
