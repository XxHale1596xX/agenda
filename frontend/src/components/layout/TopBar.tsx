import { Menu, LogOut, ShieldCheck, ShieldOff } from 'lucide-react'
import type { NavPage } from '../../App'

const PAGE_LABELS: Record<NavPage, string> = {
  dashboard:    'Dashboard',
  calendario:   'Calendário',
  agendamentos: 'Agendamentos',
  alunos:       'Alunos',
  instrutores:  'Instrutores',
  veiculos:     'Veículos',
  financeiro:   'Financeiro',
  pedagogico:   'Pedagógico',
  comunicacao:  'Comunicação',
  relatorios:   'Relatórios',
  admin:        'Administração',
}

interface Props {
  page: NavPage
  isAdmin: boolean
  onMenuClick: () => void
  onLogout: () => void
}

export function TopBar({ page, isAdmin, onMenuClick, onLogout }: Props) {
  return (
    <header className="h-14 bg-white border-b border-slate-200 sticky top-0 z-20 flex items-center px-4 sm:px-6 gap-4">
      {/* Mobile hamburger */}
      <button
        onClick={onMenuClick}
        aria-label="Abrir menu"
        className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
      >
        <Menu size={20} />
      </button>

      <h1 className="text-base font-semibold text-slate-900 flex-1">
        {PAGE_LABELS[page]}
      </h1>

      {isAdmin ? (
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-green-600 font-medium bg-green-50 px-2.5 py-1 rounded-full">
            <ShieldCheck size={13} />
            Admin
          </div>
          <button
            onClick={onLogout}
            aria-label="Sair do admin"
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg transition"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <ShieldOff size={13} />
          <span className="hidden sm:inline">Visitante</span>
        </div>
      )}
    </header>
  )
}
