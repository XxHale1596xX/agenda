import { useState } from 'react'
import { Plus, Pencil, Trash2, Car, Search, CheckCircle2, XCircle } from 'lucide-react'
import { useVeiculos, useCreateVeiculo, useUpdateVeiculo, useDeleteVeiculo } from '../../hooks/useVeiculos'
import { Modal } from '../ui/Modal'
import { DeleteDialog } from '../DeleteDialog'
import { VeiculoForm } from '../VeiculoForm'
import { useToast } from '../ui/Toast'
import { formatDate } from '../../lib/utils'
import type { Veiculo, VeiculoPayload } from '../../types'

interface Props {
  isAdmin: boolean
  adminToken: string
}

const CAT_COLOR: Record<string, string> = {
  A: 'bg-red-100 text-red-700',
  B: 'bg-blue-100 text-blue-700',
  C: 'bg-green-100 text-green-700',
  D: 'bg-purple-100 text-purple-700',
  E: 'bg-orange-100 text-orange-700',
}

function errMsg(e: unknown, fb: string) { return e instanceof Error ? e.message : fb }

export function VeiculosPage({ isAdmin, adminToken }: Props) {
  const { toast } = useToast()
  const [busca, setBusca] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Veiculo | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Veiculo | null>(null)

  const { data: veiculos = [] } = useVeiculos(busca || undefined)
  const createMut = useCreateVeiculo(adminToken)
  const updateMut = useUpdateVeiculo(adminToken)
  const deleteMut = useDeleteVeiculo(adminToken)

  async function handleCreate(values: VeiculoPayload) {
    try {
      await createMut.mutateAsync(values)
      toast('Veículo cadastrado!')
      setCreateOpen(false)
    } catch (e: unknown) { toast(errMsg(e, 'Erro ao cadastrar'), 'error') }
  }

  async function handleUpdate(values: VeiculoPayload) {
    if (!editTarget) return
    try {
      await updateMut.mutateAsync({ id: editTarget.id, payload: { modelo: values.modelo, marca: values.marca, ano: values.ano, categoria: values.categoria, km_atual: values.km_atual } })
      toast('Veículo atualizado!')
      setEditTarget(null)
    } catch (e: unknown) { toast(errMsg(e, 'Erro ao atualizar'), 'error') }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await deleteMut.mutateAsync(deleteTarget.id)
      toast('Veículo removido.')
      setDeleteTarget(null)
    } catch (e: unknown) { toast(errMsg(e, 'Erro ao remover'), 'error') }
  }

  async function handleToggleAtivo(v: Veiculo) {
    try {
      await updateMut.mutateAsync({ id: v.id, payload: { ativo: !v.ativo } })
      toast(v.ativo ? 'Veículo desativado.' : 'Veículo reativado.')
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
              placeholder="Buscar por placa ou modelo..."
              aria-label="Buscar veículo"
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
          </div>
          {isAdmin && (
            <button onClick={() => setCreateOpen(true)} className="btn-primary shrink-0">
              <Plus size={16} />
              <span className="hidden sm:inline">Novo Veículo</span>
            </button>
          )}
        </div>

        {veiculos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Car size={48} className="mb-3 opacity-40" />
            <p className="text-base font-medium">
              {busca ? 'Nenhum resultado para a busca' : 'Nenhum veículo cadastrado'}
            </p>
            <p className="text-sm">{busca ? 'Tente placa ou modelo diferente' : 'Cadastre o primeiro veículo acima'}</p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['Veículo', 'Placa', 'Categoria', 'Ano', 'KM atual', 'Cadastro', 'Status', ''].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {veiculos.map(v => (
                    <tr key={v.id} className="hover:bg-slate-50 transition group">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${v.ativo ? 'bg-blue-50' : 'bg-slate-100'}`}>
                            <Car size={15} className={v.ativo ? 'text-blue-600' : 'text-slate-400'} />
                          </div>
                          <div>
                            <p className={`font-medium ${v.ativo ? 'text-slate-900' : 'text-slate-400 line-through'}`}>{v.marca} {v.modelo}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-600 text-xs tracking-wider">{v.placa}</td>
                      <td className="px-4 py-3.5">
                        <span className={`badge ${CAT_COLOR[v.categoria] ?? 'bg-slate-100 text-slate-600'}`}>Cat. {v.categoria}</span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500">{v.ano ?? '—'}</td>
                      <td className="px-4 py-3.5 text-slate-500">{v.km_atual.toLocaleString('pt-BR')} km</td>
                      <td className="px-4 py-3.5 text-xs text-slate-400">{formatDate(v.criado_em.slice(0, 10))}</td>
                      <td className="px-4 py-3.5">
                        <span className={`badge ${v.ativo ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                          {v.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {isAdmin && (
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
                            <button onClick={() => handleToggleAtivo(v)} aria-label={v.ativo ? `Desativar ${v.placa}` : `Ativar ${v.placa}`} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50">
                              {v.ativo ? <XCircle size={15} /> : <CheckCircle2 size={15} />}
                            </button>
                            <button onClick={() => setEditTarget(v)} aria-label={`Editar ${v.placa}`} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"><Pencil size={15} /></button>
                            <button onClick={() => setDeleteTarget(v)} aria-label={`Excluir ${v.placa}`} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"><Trash2 size={15} /></button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3 p-4">
              {veiculos.map(v => (
                <div key={v.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className={`font-semibold text-sm ${v.ativo ? 'text-slate-900' : 'text-slate-400 line-through'}`}>{v.marca} {v.modelo}</p>
                      <p className="font-mono text-xs text-slate-400 mt-0.5">{v.placa}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`badge ${CAT_COLOR[v.categoria] ?? 'bg-slate-100 text-slate-600'}`}>Cat. {v.categoria}</span>
                      <span className={`badge ${v.ativo ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{v.ativo ? 'Ativo' : 'Inativo'}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">{v.km_atual.toLocaleString('pt-BR')} km {v.ano ? `· ${v.ano}` : ''}</p>
                  {isAdmin && (
                    <div className="flex justify-end gap-1">
                      <button onClick={() => handleToggleAtivo(v)} aria-label={v.ativo ? `Desativar ${v.placa}` : `Ativar ${v.placa}`} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50">
                        {v.ativo ? <XCircle size={15} /> : <CheckCircle2 size={15} />}
                      </button>
                      <button onClick={() => setEditTarget(v)} aria-label={`Editar ${v.placa}`} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"><Pencil size={15} /></button>
                      <button onClick={() => setDeleteTarget(v)} aria-label={`Excluir ${v.placa}`} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"><Trash2 size={15} /></button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-400">
              {veiculos.length} veículo{veiculos.length !== 1 ? 's' : ''}
            </div>
          </>
        )}
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Novo Veículo">
        <VeiculoForm loading={createMut.isPending} onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} />
      </Modal>
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Editar Veículo">
        <VeiculoForm initial={editTarget ?? undefined} loading={updateMut.isPending} onSubmit={handleUpdate} onCancel={() => setEditTarget(null)} />
      </Modal>
      <DeleteDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleteMut.isPending} aluno={deleteTarget ? `${deleteTarget.marca} ${deleteTarget.modelo} (${deleteTarget.placa})` : ''} />
    </>
  )
}
