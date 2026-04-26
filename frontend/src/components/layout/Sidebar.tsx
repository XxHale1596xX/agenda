import {
  LayoutDashboard, CalendarRange, List, Users, GraduationCap, Car,
  DollarSign, BookOpen, MessageSquare, BarChart3, ShieldCheck, X,
  ChevronRight,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import type { NavPage } from '../../App'

interface NavItem {
  id: NavPage
  label: string
  icon: React.ReactNode
  soon?: boolean
  adminOnly?: boolean
}

const NAV_MAIN: NavItem[] = [
  { id: 'dashboard',    label: 'Dashboard',     icon: <LayoutDashboard size={17} /> },
  { id: 'calendario',   label: 'Calendário',    icon: <CalendarRange size={17} /> },
  { id: 'agendamentos', label: 'Agendamentos',  icon: <List size={17} /> },
  { id: 'alunos',       label: 'Alunos',        icon: <Users size={17} /> },
  { id: 'instrutores',  label: 'Instrutores',   icon: <GraduationCap size={17} /> },
  { id: 'veiculos',     label: 'Veículos',      icon: <Car size={17} /> },
]

const NAV_SOON: NavItem[] = [
  { id: 'financeiro',   label: 'Financeiro',    icon: <DollarSign size={17} />,    soon: true },
  { id: 'pedagogico',   label: 'Pedagógico',    icon: <BookOpen size={17} />,      soon: true },
  { id: 'comunicacao',  label: 'Comunicação',   icon: <MessageSquare size={17} />, soon: true },
  { id: 'relatorios',   label: 'Relatórios',    icon: <BarChart3 size={17} />,     soon: true },
]

interface Props {
  page: NavPage
  onNavigate: (p: NavPage) => void
  isAdmin: boolean
  open: boolean       // mobile overlay open
  onClose: () => void
}

function NavBtn({
  item, active, onClick,
}: { item: NavItem; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all',
        active
          ? 'bg-white/10 text-white'
          : item.soon
          ? 'text-slate-500 cursor-default'
          : 'text-slate-400 hover:bg-white/5 hover:text-slate-200',
      )}
      disabled={item.soon}
    >
      <span className={cn('shrink-0', active ? 'text-white' : item.soon ? 'text-slate-600' : 'text-slate-500')}>
        {item.icon}
      </span>
      <span className="flex-1 text-left">{item.label}</span>
      {item.soon && (
        <span className="text-[10px] font-semibold bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded">
          em breve
        </span>
      )}
      {active && !item.soon && <ChevronRight size={13} className="text-slate-400" />}
    </button>
  )
}

export function Sidebar({ page, onNavigate, isAdmin, open, onClose }: Props) {
  const content = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5">
        <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center shrink-0">
          <Car size={18} className="text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-white leading-none truncate">AutoEscola dos Brothers</p>
          <p className="text-xs text-slate-500 leading-none mt-0.5">Sistema de Gestão</p>
        </div>
        {/* Mobile close */}
        <button onClick={onClose} className="ml-auto lg:hidden text-slate-500 hover:text-slate-300">
          <X size={18} />
        </button>
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV_MAIN.map(item => (
          <NavBtn
            key={item.id}
            item={item}
            active={page === item.id}
            onClick={() => { onNavigate(item.id); onClose() }}
          />
        ))}

        <div className="pt-4 pb-1">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
            Em breve
          </p>
        </div>

        {NAV_SOON.map(item => (
          <NavBtn key={item.id} item={item} active={false} onClick={() => {}} />
        ))}
      </nav>

      {/* Admin */}
      <div className="px-3 py-4 border-t border-white/5">
        <NavBtn
          item={{ id: 'admin', label: 'Administração', icon: <ShieldCheck size={17} /> }}
          active={page === 'admin'}
          onClick={() => { onNavigate('admin'); onClose() }}
        />
        {isAdmin && (
          <div className="mt-2 mx-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
            <span className="text-xs text-slate-500">Admin autenticado</span>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-slate-900 shrink-0 h-screen sticky top-0">
        {content}
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />
          <aside className="absolute left-0 top-0 bottom-0 w-60 bg-slate-900 flex flex-col">
            {content}
          </aside>
        </div>
      )}
    </>
  )
}
