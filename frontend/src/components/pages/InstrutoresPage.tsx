import { useState } from 'react'
import { Plus, Pencil, Trash2, UserCheck, UserX, Search, GraduationCap } from 'lucide-react'
import { useInstrutores, useCreateInstrutor, useUpdateInstrutor, useDeleteInstrutor } from '../../hooks/useInstrutores'
import { Modal } from '../ui/Modal'
import { DeleteDialog } from '../DeleteDialog'
import { InstrutorForm } from '../InstrutorForm'
import { useToast } from '../ui/Toast'
import { formatDate } from '../../lib/utils'
import type { Instrutor, InstrutorPayload } from '../../types'

interface Props {
  isAdmin: boolean
  adminToken: string
}

function CatBadge({ cat }: { cat: string }) {
  const colors: Record<string, string> = {
    A: 'bg-red-100 text-red-700',
    B: 'bg-blue-100 text-blue-700',
    C: 'bg-green-100 text-green-700',
    D: 'bg-purple-100 text-purple-700',
    E: 'bg-orange-100 text-orange-700',
  }
  return (
    <span className={`badge ${colors[cat] ?? 'bg-slate-100 text-slate-600'}`}>{cat}</span>
  )
}

function errMsg(e: unknown, fb: string) { return e instanceof Error ? e.message : fb }

export function InstrutoresPage({ isAdmin, adminToken }: Props) {
  const { toast } = useToast()
  const [busca, setBusca] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Instrutor | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Instrutor | null>(null)

  const { data: instrutores = [] } = useInstrutores(busca || undefined)
  const createMut  = useCreateInstrutor(adminToken)
  const updateMut  = useUpdateInstrutor(adminToken)
  const deleteMut  = useDeleteInstrutor(adminToken)

  async function handleCreate(values: InstrutorPayload) {
    try {
      await createMut.mutateAsync(values)
      toast('Instrutor cadastrado!')
      setCreateOpen(false)
    } catch (e: unknown) { toast(errMsg(e, 'Erro ao cadastrar'), 'error') }
  }

  async function handleUpdate(values: InstrutorPayload) {
    if (!editTarget) return
    try {
      await updateMut.mutateAsync({ id: editTarget.id, payload: { nome: values.nome, email: values.email, telefone: values.telefone, categorias: values.categorias } })
      toast('Instrutor atualizado!')
      setEditTarget(null)
    } catch (e: unknown) { toast(errMsg(e, 'Erro ao atualizar'), 'error') }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await deleteMut.mutateAsync(deleteTarget.id)
      toast('Instrutor removido.')
      setDeleteTarget(null)
    } catch (e: unknown) { toast(errMsg(e, 'Erro ao remover'), 'error') }
  }

  async function handleToggleAtivo(inst: Instrutor) {
    try {
      await updateMut.mutateAsync({ id: inst.id, payload: { ativo: !inst.ativo } })
      toast(inst.ativo ? 'Instrutor desativado.' : 'Instrutor reativado.')
    } catch (e: unknown) { toast(errMsg(e, 'Erro'), 'error') }
  }

  return (
    <>
      <div className="card">
        <div className="flex items-center justify-between gap-4 p-4 border-b border-slate-100">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" aria-hidden />
            <input
              className="input pl-9"
              placeholder="Buscar instrutor..."
              aria-label="Buscar instrutor"
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
          </div>
          {isAdmin && (
            <button onClick={() => setCreateOpen(true)} className="btn-primary shrink-0">
              <Plus size={16} />
              <span className="hidden sm:inline">Novo Instrutor</span>
            </button>
          )}
        </div>

        {instrutores.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <GraduationCap size={48} className="mb-3 opacity-40" />
            <p className="text-base font-medium">
              {busca ? 'Nenhum resultado para a busca' : 'Nenhum instrutor cadastrado'}
            </p>
            <p className="text-sm">{busca ? 'Tente um nome diferente' : 'Cadastre o primeiro instrutor acima'}</p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['Instrutor', 'Categorias', 'Contato', 'Cadastro', 'Status', ''].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {instrutores.map(inst => (
                    <tr key={inst.id} className="hover:bg-slate-50 transition group">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${inst.ativo ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                            {inst.nome.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}
                          </div>
                          <span className={`font-medium ${inst.ativo ? 'text-slate-900' : 'text-slate-400 line-through'}`}>
                            {inst.nome}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex gap-1 flex-wrap">
                          {inst.categorias.split(',').map(c => <CatBadge key={c} cat={c} />)}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-500">
                        <div>{inst.email ?? '—'}</div>
                        <div>{inst.telefone ?? ''}</div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-400">{formatDate(inst.criado_em.slice(0, 10))}</td>
                      <td className="px-4 py-3.5">
                        <span className={`badge ${inst.ativo ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                          {inst.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {isAdmin && (
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
                            <button onClick={() => handleToggleAtivo(inst)} aria-label={inst.ativo ? `Desativar ${inst.nome}` : `Ativar ${inst.nome}`} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50">
                              {inst.ativo ? <UserX size={15} /> : <UserCheck size={15} />}
                            </button>
                            <button onClick={() => setEditTarget(inst)} aria-label={`Editar ${inst.nome}`} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                              <Pencil size={15} />
                            </button>
                            <button onClick={() => setDeleteTarget(inst)} aria-label={`Excluir ${inst.nome}`} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden space-y-3 p-4">
              {instrutores.map(inst => (
                <div key={inst.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${inst.ativo ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                        {inst.nome.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}
                      </div>
                      <div>
                        <p className={`font-semibold text-sm ${inst.ativo ? 'text-slate-900' : 'text-slate-400 line-through'}`}>{inst.nome}</p>
                        <div className="flex gap-1 mt-0.5">{inst.categorias.split(',').map(c => <CatBadge key={c} cat={c} />)}</div>
                      </div>
                    </div>
                    <span className={`badge ${inst.ativo ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{inst.ativo ? 'Ativo' : 'Inativo'}</span>
                  </div>
                  {isAdmin && (
                    <div className="flex justify-end gap-1 mt-2">
                      <button onClick={() => handleToggleAtivo(inst)} aria-label={inst.ativo ? `Desativar ${inst.nome}` : `Ativar ${inst.nome}`} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50">
                        {inst.ativo ? <UserX size={15} /> : <UserCheck size={15} />}
                      </button>
                      <button onClick={() => setEditTarget(inst)} aria-label={`Editar ${inst.nome}`} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"><Pencil size={15} /></button>
                      <button onClick={() => setDeleteTarget(inst)} aria-label={`Excluir ${inst.nome}`} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"><Trash2 size={15} /></button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-400">
              {instrutores.length} instrutor{instrutores.length !== 1 ? 'es' : ''}
            </div>
          </>
        )}
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Novo Instrutor">
        <InstrutorForm loading={createMut.isPending} onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} />
      </Modal>
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Editar Instrutor">
        <InstrutorForm initial={editTarget ?? undefined} loading={updateMut.isPending} onSubmit={handleUpdate} onCancel={() => setEditTarget(null)} />
      </Modal>
      <DeleteDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleteMut.isPending} aluno={deleteTarget?.nome ?? ''} />
    </>
  )
}
