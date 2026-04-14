import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  Plus, Car, RefreshCw, CalendarDays, Users, Clock,
  CalendarRange, List, ShieldCheck, LogOut, UserPlus,
} from 'lucide-react'
import { ToastProvider, useToast } from './components/ui/Toast'
import { Modal } from './components/ui/Modal'
import { AgendamentoForm } from './components/AgendamentoForm'
import { AgendamentoTable } from './components/AgendamentoTable'
import { DeleteDialog } from './components/DeleteDialog'
import { FilterBar } from './components/FilterBar'
import { CalendarioMensal } from './components/CalendarioMensal'
import { AdminLoginModal } from './components/AdminLoginModal'
import { UsuarioForm } from './components/UsuarioForm'
import { UsuarioTable } from './components/UsuarioTable'
import {
  useAgendamentos,
  useCreateAgendamento,
  useUpdateAgendamento,
  useDeleteAgendamento,
} from './hooks/useAgendamentos'
import {
  useUsuarios,
  useCreateUsuario,
  useUpdateUsuario,
  useDeleteUsuario,
} from './hooks/useUsuarios'
import { useAdminSession } from './hooks/useAdminSession'
import { usuariosApi } from './api/usuarios'
import type { Agendamento, AgendamentosFilter, Usuario, UsuarioMasked, UsuarioPayload, UsuarioUpdate } from './types'
import { cn } from './lib/utils'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
})

type Tab = 'calendario' | 'agendamentos' | 'admin'
type AdminSubTab = 'disponibilidade' | 'usuarios'

function AppContent() {
  const { toast } = useToast()
  const [tab, setTab] = useState<Tab>('calendario')
  const [adminSubTab, setAdminSubTab] = useState<AdminSubTab>('disponibilidade')

  // ── Agendamentos ───────────────────────────────────────────────────────────
  const [filter, setFilter] = useState<AgendamentosFilter>({})
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Agendamento | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Agendamento | null>(null)

  const { data: agendamentos = [], isFetching, refetch, isError } = useAgendamentos(filter)
  const create = useCreateAgendamento()
  const update = useUpdateAgendamento()
  const remove = useDeleteAgendamento()

  // ── Usuários (restrito ao admin) ───────────────────────────────────────────
  const [buscaUsuario, setBuscaUsuario] = useState('')
  const [createUsuarioOpen, setCreateUsuarioOpen] = useState(false)
  const [editUsuario, setEditUsuario] = useState<Usuario | null>(null)
  const [deleteUsuario, setDeleteUsuario] = useState<UsuarioMasked | null>(null)

  const { data: usuarios = [] } = useUsuarios(buscaUsuario || undefined)
  const createUsuario = useCreateUsuario()
  const updateUsuario = useUpdateUsuario()
  const deleteUsuarioMut = useDeleteUsuario()

  // ── Admin ──────────────────────────────────────────────────────────────────
  const { adminToken, isAdmin, login, logout, loading: adminLoading, error: adminError } = useAdminSession()

  // ── Stats ──────────────────────────────────────────────────────────────────
  const { data: all = [] } = useAgendamentos()
  const today = new Date().toISOString().slice(0, 10)
  const todayCount = all.filter(a => a.data_aula === today).length

  // ── Handlers Agendamentos ──────────────────────────────────────────────────
  function errMsg(e: unknown, fallback: string) {
    return e instanceof Error ? e.message : fallback
  }

  async function handleCreate(values: Omit<Agendamento, 'id'>) {
    try {
      await create.mutateAsync({ ...values, hora_aula: `${values.hora_aula}:00` })
      toast('Agendamento criado com sucesso!')
      setCreateOpen(false)
    } catch (e: unknown) {
      toast(errMsg(e, 'Erro ao criar agendamento'), 'error')
    }
  }

  async function handleUpdate(values: Omit<Agendamento, 'id'>) {
    if (!editTarget) return
    try {
      await update.mutateAsync({ id: editTarget.id, payload: { ...values, hora_aula: `${values.hora_aula}:00` } })
      toast('Agendamento atualizado!')
      setEditTarget(null)
    } catch (e: unknown) {
      toast(errMsg(e, 'Erro ao atualizar'), 'error')
    }
  }

  async function handleDeleteAgendamento() {
    if (!deleteTarget) return
    try {
      await remove.mutateAsync(deleteTarget.id)
      toast('Agendamento removido.')
      setDeleteTarget(null)
    } catch (e: unknown) {
      toast(errMsg(e, 'Erro ao remover'), 'error')
    }
  }

  // ── Handlers Usuários ──────────────────────────────────────────────────────
  async function handleCreateUsuario(values: UsuarioPayload) {
    try {
      await createUsuario.mutateAsync(values)
      toast('Usuário cadastrado com sucesso!')
      setCreateUsuarioOpen(false)
    } catch (e: unknown) {
      toast(errMsg(e, 'Erro ao cadastrar'), 'error')
    }
  }

  async function handleOpenEdit(masked: UsuarioMasked) {
    try {
      const full = await usuariosApi.get(masked.id)
      setEditUsuario(full)
    } catch {
      toast('Erro ao carregar dados do usuário', 'error')
    }
  }

  async function handleUpdateUsuario(values: UsuarioPayload) {
    if (!editUsuario) return
    const payload: UsuarioUpdate = { nome: values.nome, email: values.email, telefone: values.telefone }
    try {
      await updateUsuario.mutateAsync({ id: editUsuario.id, payload })
      toast('Usuário atualizado!')
      setEditUsuario(null)
    } catch (e: unknown) {
      toast(errMsg(e, 'Erro ao atualizar'), 'error')
    }
  }

  async function handleDeleteUsuario() {
    if (!deleteUsuario) return
    try {
      await deleteUsuarioMut.mutateAsync(deleteUsuario.id)
      toast('Usuário removido.')
      setDeleteUsuario(null)
    } catch (e: unknown) {
      toast(errMsg(e, 'Erro ao remover'), 'error')
    }
  }

  async function handleToggleAtivo(u: UsuarioMasked) {
    try {
      await updateUsuario.mutateAsync({ id: u.id, payload: { ativo: !u.ativo } })
      toast(u.ativo ? 'Usuário desativado.' : 'Usuário reativado.')
    } catch (e: unknown) {
      toast(errMsg(e, 'Erro'), 'error')
    }
  }

  // ── Tabs principais (sem Usuários — restrito ao admin) ─────────────────────
  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'calendario',   label: 'Calendário',   icon: <CalendarRange size={16} /> },
    { id: 'agendamentos', label: 'Agendamentos', icon: <List size={16} /> },
    { id: 'admin',        label: 'Admin',        icon: <ShieldCheck size={16} /> },
  ]

  const isAdminUsuarios = tab === 'admin' && isAdmin && adminSubTab === 'usuarios'

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Car size={16} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-base leading-none">AutoEscola dos Brothers</span>
              <p className="text-xs text-slate-400 leading-none mt-0.5">Sistema de Agendamentos</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button onClick={logout} aria-label="Sair do admin" className="btn-ghost text-slate-500 text-xs gap-1">
                <LogOut size={14} />
                <span className="hidden sm:inline">Sair do admin</span>
              </button>
            )}
            {isAdminUsuarios ? (
              <button onClick={() => setCreateUsuarioOpen(true)} className="btn-primary">
                <UserPlus size={16} />
                <span className="hidden sm:inline">Novo Usuário</span>
                <span className="sm:hidden">Novo</span>
              </button>
            ) : (
              <button onClick={() => setCreateOpen(true)} className="btn-primary">
                <Plus size={16} />
                <span className="hidden sm:inline">Novo Agendamento</span>
                <span className="sm:hidden">Novo</span>
              </button>
            )}
          </div>
        </div>

        {/* Tabs principais */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex gap-1 border-t border-slate-100 overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                tab === t.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              )}
            >
              {t.icon}
              {t.label}
              {t.id === 'admin' && isAdmin && (
                <span className="ml-1 w-2 h-2 rounded-full bg-green-500" title="Autenticado" />
              )}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card p-5 flex items-center gap-4">
            <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
              <CalendarDays size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{all.length}</p>
              <p className="text-xs text-slate-500 font-medium">Total de agendamentos</p>
            </div>
          </div>
          <div className="card p-5 flex items-center gap-4">
            <div className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
              <Clock size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{todayCount}</p>
              <p className="text-xs text-slate-500 font-medium">Aulas hoje</p>
            </div>
          </div>
          {/* Contagem de usuários só visível para admin autenticado */}
          {isAdmin ? (
            <div className="card p-5 flex items-center gap-4">
              <div className="w-11 h-11 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
                <Users size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{usuarios.length}</p>
                <p className="text-xs text-slate-500 font-medium">Usuários cadastrados</p>
              </div>
            </div>
          ) : (
            <div className="card p-5 flex items-center gap-4 opacity-40 select-none">
              <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                <ShieldCheck size={20} className="text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Acesso restrito</p>
                <p className="text-xs text-slate-400">Área do administrador</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Calendário ──────────────────────────────────────────────────── */}
        {tab === 'calendario' && (
          <div className="card p-6">
            <CalendarioMensal />
          </div>
        )}

        {/* ── Agendamentos ────────────────────────────────────────────────── */}
        {tab === 'agendamentos' && (
          <div className="card">
            <div className="flex items-center justify-between gap-4 p-4 border-b border-slate-100">
              <div className="flex-1">
                <FilterBar filter={filter} onChange={setFilter} />
              </div>
              <button onClick={() => refetch()} disabled={isFetching} aria-label="Atualizar agendamentos" className="btn-ghost shrink-0">
                <RefreshCw size={15} className={isFetching ? 'animate-spin' : ''} />
              </button>
            </div>
            {isError ? (
              <div className="py-16 text-center text-red-500 text-sm">Não foi possível conectar à API.</div>
            ) : (
              <AgendamentoTable agendamentos={agendamentos} hasFilters={!!(filter.instrutor || filter.data_aula)} onEdit={setEditTarget} onDelete={setDeleteTarget} />
            )}
            {agendamentos.length > 0 && (
              <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-400">
                {agendamentos.length} agendamento{agendamentos.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        )}

        {/* ── Admin ───────────────────────────────────────────────────────── */}
        {tab === 'admin' && (
          isAdmin ? (
            <div className="card">
              {/* Cabeçalho da área admin */}
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-green-600" />
                  <h3 className="font-semibold text-slate-900">Painel Administrativo</h3>
                </div>
                <span className="badge bg-green-100 text-green-700">Admin ativo</span>
              </div>

              {/* Sub-tabs: Disponibilidade | Usuários */}
              <div className="flex gap-1 px-6 border-b border-slate-100">
                {([
                  { id: 'disponibilidade' as AdminSubTab, label: 'Disponibilidade', icon: <CalendarRange size={14} /> },
                  { id: 'usuarios'        as AdminSubTab, label: 'Usuários',        icon: <Users size={14} /> },
                ] as const).map(s => (
                  <button
                    key={s.id}
                    onClick={() => setAdminSubTab(s.id)}
                    className={cn(
                      'flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                      adminSubTab === s.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    )}
                  >
                    {s.icon}
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Conteúdo: Disponibilidade */}
              {adminSubTab === 'disponibilidade' && (
                <div className="p-6">
                  <p className="text-sm text-slate-500 mb-6">
                    Clique em um dia para ver os horários. Clique em um slot para{' '}
                    <strong>bloquear</strong> ou <strong>desbloquear</strong>.
                    Slots com agendamentos não podem ser bloqueados.
                  </p>
                  <CalendarioMensal isAdmin adminToken={adminToken ?? ''} />
                </div>
              )}

              {/* Conteúdo: Usuários */}
              {adminSubTab === 'usuarios' && (
                <UsuarioTable
                  usuarios={usuarios}
                  busca={buscaUsuario}
                  onBuscaChange={setBuscaUsuario}
                  onEdit={handleOpenEdit}
                  onDelete={setDeleteUsuario}
                  onToggleAtivo={handleToggleAtivo}
                />
              )}
            </div>
          ) : (
            <AdminLoginModal onLogin={login} loading={adminLoading} error={adminError} />
          )
        )}
      </main>

      {/* ── Modals Agendamentos ──────────────────────────────────────────── */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Novo Agendamento">
        <AgendamentoForm loading={create.isPending} onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} />
      </Modal>
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Editar Agendamento">
        <AgendamentoForm initial={editTarget ?? undefined} loading={update.isPending} onSubmit={handleUpdate} onCancel={() => setEditTarget(null)} />
      </Modal>
      <DeleteDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDeleteAgendamento} loading={remove.isPending} aluno={deleteTarget?.aluno ?? ''} />

      {/* ── Modals Usuários ──────────────────────────────────────────────── */}
      <Modal open={createUsuarioOpen} onClose={() => setCreateUsuarioOpen(false)} title="Cadastrar Usuário">
        <UsuarioForm loading={createUsuario.isPending} onSubmit={handleCreateUsuario} onCancel={() => setCreateUsuarioOpen(false)} />
      </Modal>
      <Modal open={!!editUsuario} onClose={() => setEditUsuario(null)} title="Editar Usuário">
        <UsuarioForm initial={editUsuario ?? undefined} loading={updateUsuario.isPending} onSubmit={handleUpdateUsuario} onCancel={() => setEditUsuario(null)} />
      </Modal>
      <DeleteDialog open={!!deleteUsuario} onClose={() => setDeleteUsuario(null)} onConfirm={handleDeleteUsuario} loading={deleteUsuarioMut.isPending} aluno={deleteUsuario?.nome ?? ''} />
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </QueryClientProvider>
  )
}
