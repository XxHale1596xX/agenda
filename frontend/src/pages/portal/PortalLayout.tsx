import { useEffect } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Car, LayoutDashboard, CalendarDays, User, LogOut } from 'lucide-react'
import { useStudentAuth } from '../../context/StudentAuthContext'
import { cn } from '../../lib/utils'

const NAV = [
  { to: '/portal',        label: 'Início',      icon: <LayoutDashboard size={17} />, end: true },
  { to: '/portal/aulas',  label: 'Minhas Aulas', icon: <CalendarDays size={17} /> },
  { to: '/portal/perfil', label: 'Meu Perfil',   icon: <User size={17} /> },
]

export function PortalLayout() {
  const { isAuthenticated, student, logout, refreshMe } = useStudentAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) { navigate('/entrar'); return }
    if (!student) refreshMe()
  }, [isAuthenticated, student, navigate, refreshMe])

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <Car size={14} className="text-white" />
            </div>
            <span className="font-bold text-slate-900 text-sm hidden sm:block">AutoEscola dos Brothers</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-1">
            {NAV.map(n => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition',
                    isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800')
                }
              >
                {n.icon}
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {student && (
              <span className="text-sm text-slate-600 hidden sm:block">
                Olá, <strong>{student.nome.split(' ')[0]}</strong>
              </span>
            )}
            <button
              onClick={() => { logout(); navigate('/') }}
              aria-label="Sair"
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg transition"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="sm:hidden flex border-t border-slate-100">
          {NAV.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                cn('flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition',
                  isActive ? 'text-blue-600' : 'text-slate-400')
              }
            >
              {n.icon}
              {n.label}
            </NavLink>
          ))}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <Outlet />
      </main>
    </div>
  )
}
