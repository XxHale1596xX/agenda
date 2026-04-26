import { useState } from 'react'
import { format } from 'date-fns'
import { Plus, UserPlus, RefreshCw } from 'lucide-react'
import { useToast } from './components/ui/Toast'
import { Modal } from './components/ui/Modal'
import { Sidebar } from './components/layout/Sidebar'
import { TopBar } from './components/layout/TopBar'
import { Dashboard } from './components/pages/Dashboard'
import { InstrutoresPage } from './components/pages/InstrutoresPage'
import { VeiculosPage } from './components/pages/VeiculosPage'
import { ComingSoon } from './components/pages/ComingSoon'
import { AgendamentoForm } from './components/AgendamentoForm'
import { AgendamentoTable } from './components/AgendamentoTable'
import { DeleteDialog } from './components/DeleteDialog'
import { FilterBar } from './components/FilterBar'
import { CalendarioRBC } from './components/CalendarioRBC'
import { CalendarioMensal } from './components/CalendarioMensal'
import { AdminLoginModal } from './components/AdminLoginModal'
import { UsuarioForm } from './components/UsuarioForm'
import { UsuarioTable } from './components/UsuarioTable'
import {
  useAgendamentos, useCreateAgendamento,
  useUpdateAgendamento, useDeleteAgendamento,
} from './hooks/useAgendamentos'
import { useUsuarios, useCreateUsuario, useUpdateUsuario, useDeleteUsuario } from './hooks/useUsuarios'
import { useAdminSession } from './hooks/useAdminSession'
import { usuariosApi } from './api/usuarios'
import type {
  Agendamento, AgendamentosFilter,
  Usuario, UsuarioMasked, UsuarioPayload, UsuarioUpdate,
} from './types'
import { cn } from './lib/utils'

export type NavPage =
  | 'dashboard' | 'calendario' | 'agendamentos'
  | 'alunos' | 'instrutores' | 'veiculos'
  | 'financeiro' | 'pedagogico' | 'comunicacao' | 'relatorios'
  | 'admin'

export default function AppContent() {
  const { toast } = useToast()
  const [page, setPage] = useState<NavPage>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // ── Admin ──────────────────────────────────────────────────────────────────
  const { adminToken, isAdmin, login, logout, loading: adminLoading, error: adminError } = useAdminSession()
  type AdminSubTab = 'disponibilidade' | 'usuarios'
  const [adminSubTab, setAdminSubTab] = useState<AdminSubTab>('disponibilidade')

  // ── Agendamentos ───────────────────────────────────────────────────────────
  const [filter, setFilter] = useState<AgendamentosFilter>({})
  const [createOpen, setCreateOpen]   = useState(false)
  const [slotDefault, setSlotDefault] = useState<{ data_aula: string; hora_aula: string } | undefined>()
  const [editTarget,  setEditTarget]  = useState<Agendamento | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Agendamento | null>(null)

  const { data: agendamentos = [], isFetching, refetch, isError } = useAgendamentos(filter)
  const create  = useCreateAgendamento()
  const update  = useUpdateAgendamento()
  const remove  = useDeleteAgendamento()

  // ── Usuários ───────────────────────────────────────────────────────────────
  const [buscaUsuario, setBuscaUsuario]       = useState('')
  const [createUsuarioOpen, setCreateUsuarioOpen] = useState(false)
  const [editUsuario, setEditUsuario]         = useState<Usuario | null>(null)
  const [deleteUsuario, setDeleteUsuario]     = useState<UsuarioMasked | null>(null)

  const { data: usuarios = [] } = useUsuarios(buscaUsuario || undefined)
  const createUsuario   = useCreateUsuario()
  const updateUsuario   = useUpdateUsuario()
  const deleteUsuarioMut = useDeleteUsuario()

  // ── Helpers ────────────────────────────────────────────────────────────────
  function errMsg(e: unknown, fb: string) {
    return e instanceof Error ? e.message : fb
  }

  // ── Agendamento handlers ───────────────────────────────────────────────────
  function handleSelectSlot(start: Date) {
    setSlotDefault({ data_aula: format(start, 'yyyy-MM-dd'), hora_aula: format(start, 'HH:mm') })
    setCreateOpen(true)
  }
  function handleCloseCreate() { setCreateOpen(false); setSlotDefault(undefined) }

  async function handleCreate(values: Omit<Agendamento, 'id'>) {
    try {
      await create.mutateAsync({ ...values, hora_aula: `${values.hora_aula}:00` })
      toast('Agendamento criado!')
      handleCloseCreate()
    } catch (e: unknown) { toast(errMsg(e, 'Erro ao criar agendamento'), 'error') }
  }

  async function handleUpdate(values: Omit<Agendamento, 'id'>) {
    if (!editTarget) return
    try {
      await update.mutateAsync({ id: editTarget.id, payload: { ...values, hora_aula: `${values.hora_aula}:00` } })
      toast('Agendamento atualizado!')
      setEditTarget(null)
    } catch (e: unknown) { toast(errMsg(e, 'Erro ao atualizar'), 'error') }
  }

  async function handleDeleteAgendamento() {
    if (!deleteTarget) return
    try {
      await remove.mutateAsync(deleteTarget.id)
      toast('Agendamento removido.')
      setDeleteTarget(null)
    } catch (e: unknown) { toast(errMsg(e, 'Erro ao remover'), 'error') }
  }

  // ── Usuário handlers ───────────────────────────────────────────────────────
  async function handleCreateUsuario(values: UsuarioPayload) {
    try {
      await createUsuario.mutateAsync(values)
      toast('Aluno cadastrado!')
      setCreateUsuarioOpen(false)
    } catch (e: unknown) { toast(errMsg(e, 'Erro ao cadastrar'), 'error') }
  }

  async function handleOpenEdit(masked: UsuarioMasked) {
    try {
      const full = await usuariosApi.get(masked.id)
      setEditUsuario(full)
    } catch { toast('Erro ao carregar dados do aluno', 'error') }
  }

  async function handleUpdateUsuario(values: UsuarioPayload) {
    if (!editUsuario) return
    const payload: UsuarioUpdate = { nome: values.nome, email: values.email, telefone: values.telefone }
    try {
      await updateUsuario.mutateAsync({ id: editUsuario.id, payload })
      toast('Aluno atualizado!')
      setEditUsuario(null)
    } catch (e: unknown) { toast(errMsg(e, 'Erro ao atualizar'), 'error') }
  }

  async function handleDeleteUsuario() {
    if (!deleteUsuario) return
    try {
      await deleteUsuarioMut.mutateAsync(deleteUsuario.id)
      toast('Aluno removido.')
      setDeleteUsuario(null)
    } catch (e: unknown) { toast(errMsg(e, 'Erro ao remover'), 'error') }
  }

  async function handleToggleAtivo(u: UsuarioMasked) {
    try {
      await updateUsuario.mutateAsync({ id: u.id, payload: { ativo: !u.ativo } })
      toast(u.ativo ? 'Aluno desativado.' : 'Aluno reativado.')
    } catch (e: unknown) { toast(errMsg(e, 'Erro'), 'error') }
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar
        page={page}
        onNavigate={setPage}
        isAdmin={isAdmin}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar
          page={page}
          isAdmin={isAdmin}
          onMenuClick={() => setSidebarOpen(true)}
          onLogout={logout}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

            {/* ── Dashboard ─────────────────────────────────────────── */}
            {page === 'dashboard' && <Dashboard />}

            {/* ── Calendário ────────────────────────────────────────── */}
            {page === 'calendario' && (
              <div className="card p-4">
                <CalendarioRBC
                  onSelectSlot={handleSelectSlot}
                  onSelectEvent={setEditTarget}
                />
              </div>
            )}

            {/* ── Agendamentos ──────────────────────────────────────── */}
            {page === 'agendamentos' && (
              <div className="card">
                <div className="flex items-center justify-between gap-4 p-4 border-b border-slate-100">
                  <div className="flex-1">
                    <FilterBar filter={filter} onChange={setFilter} />
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => refetch()} disabled={isFetching} aria-label="Atualizar" className="btn-ghost shrink-0">
                      <RefreshCw size={15} className={isFetching ? 'animate-spin' : ''} />
                    </button>
                    <button onClick={() => setCreateOpen(true)} className="btn-primary shrink-0">
                      <Plus size={15} />
                      <span className="hidden sm:inline">Novo</span>
                    </button>
                  </div>
                </div>
                {isError ? (
                  <div className="py-16 text-center text-red-500 text-sm">Não foi possível conectar à API.</div>
                ) : (
                  <AgendamentoTable
                    agendamentos={agendamentos}
                    hasFilters={!!(filter.instrutor || filter.data_aula)}
                    onEdit={setEditTarget}
                    onDelete={setDeleteTarget}
                  />
                )}
                {agendamentos.length > 0 && (
                  <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-400">
                    {agendamentos.length} agendamento{agendamentos.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            )}

            {/* ── Alunos ────────────────────────────────────────────── */}
            {page === 'alunos' && (
              <div className="card">
                <div className="flex items-center justify-between gap-4 p-4 border-b border-slate-100">
                  <h2 className="text-sm font-semibold text-slate-700">Alunos cadastrados</h2>
                  {isAdmin && (
                    <button onClick={() => setCreateUsuarioOpen(true)} className="btn-primary">
                      <UserPlus size={15} />
                      <span className="hidden sm:inline">Novo Aluno</span>
                    </button>
                  )}
                </div>
                <UsuarioTable
                  usuarios={usuarios}
                  busca={buscaUsuario}
                  onBuscaChange={setBuscaUsuario}
                  onEdit={handleOpenEdit}
                  onDelete={setDeleteUsuario}
                  onToggleAtivo={handleToggleAtivo}
                />
              </div>
            )}

            {/* ── Instrutores ───────────────────────────────────────── */}
            {page === 'instrutores' && (
              <InstrutoresPage isAdmin={isAdmin} adminToken={adminToken ?? ''} />
            )}

            {/* ── Veículos ──────────────────────────────────────────── */}
            {page === 'veiculos' && (
              <VeiculosPage isAdmin={isAdmin} adminToken={adminToken ?? ''} />
            )}

            {/* ── Módulos em breve ──────────────────────────────────── */}
            {page === 'financeiro'  && <ComingSoon module="Financeiro" />}
            {page === 'pedagogico'  && <ComingSoon module="Pedagógico" />}
            {page === 'comunicacao' && <ComingSoon module="Comunicação" />}
            {page === 'relatorios'  && <ComingSoon module="Relatórios" />}

            {/* ── Admin ─────────────────────────────────────────────── */}
            {page === 'admin' && (
              isAdmin ? (
                <div className="card">
                  <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
                    <h3 className="font-semibold text-slate-900">Painel de Disponibilidade</h3>
                    <span className="badge bg-green-100 text-green-700">Admin ativo</span>
                  </div>
                  {/* Sub-tabs */}
                  <div className="flex gap-1 px-6 border-b border-slate-100">
                    {(['disponibilidade', 'usuarios'] as const).map(s => (
                      <button
                        key={s}
                        onClick={() => setAdminSubTab(s)}
                        className={cn(
                          'flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors capitalize',
                          adminSubTab === s
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                        )}
                      >
                        {s === 'disponibilidade' ? 'Disponibilidade' : 'Usuários'}
                      </button>
                    ))}
                  </div>
                  {adminSubTab === 'disponibilidade' && (
                    <div className="p-6">
                      <p className="text-sm text-slate-500 mb-6">
                        Clique em um dia para ver os horários. Clique em um slot para <strong>bloquear</strong> ou <strong>desbloquear</strong>.
                      </p>
                      <CalendarioMensal isAdmin adminToken={adminToken ?? ''} />
                    </div>
                  )}
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
          </div>
        </main>
      </div>

      {/* ── Modals Agendamentos ──────────────────────────────────────── */}
      <Modal open={createOpen} onClose={handleCloseCreate} title="Novo Agendamento">
        <AgendamentoForm slotDefault={slotDefault} loading={create.isPending} onSubmit={handleCreate} onCancel={handleCloseCreate} />
      </Modal>
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Editar Agendamento">
        <AgendamentoForm initial={editTarget ?? undefined} loading={update.isPending} onSubmit={handleUpdate} onCancel={() => setEditTarget(null)} />
      </Modal>
      <DeleteDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDeleteAgendamento} loading={remove.isPending} aluno={deleteTarget?.aluno ?? ''} />

      {/* ── Modals Alunos ────────────────────────────────────────────── */}
      <Modal open={createUsuarioOpen} onClose={() => setCreateUsuarioOpen(false)} title="Cadastrar Aluno">
        <UsuarioForm loading={createUsuario.isPending} onSubmit={handleCreateUsuario} onCancel={() => setCreateUsuarioOpen(false)} />
      </Modal>
      <Modal open={!!editUsuario} onClose={() => setEditUsuario(null)} title="Editar Aluno">
        <UsuarioForm initial={editUsuario ?? undefined} loading={updateUsuario.isPending} onSubmit={handleUpdateUsuario} onCancel={() => setEditUsuario(null)} />
      </Modal>
      <DeleteDialog open={!!deleteUsuario} onClose={() => setDeleteUsuario(null)} onConfirm={handleDeleteUsuario} loading={deleteUsuarioMut.isPending} aluno={deleteUsuario?.nome ?? ''} />
    </div>
  )
}

