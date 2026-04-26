import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Clock, CheckCircle2, ArrowRight } from 'lucide-react'
import { useStudentAuth } from '../../context/StudentAuthContext'
import { authApi } from '../../api/auth'
import { formatTime } from '../../lib/utils'
import type { Agendamento } from '../../types'

const COLORS = [
  'bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700',
  'bg-green-100 text-green-700', 'bg-orange-100 text-orange-700',
  'bg-pink-100 text-pink-700', 'bg-teal-100 text-teal-700',
]
function instructorColor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return COLORS[Math.abs(h) % COLORS.length]
}

export function PortalDashboard() {
  const { student, token } = useStudentAuth()
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const today = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    if (!token) return
    authApi.meAgendamentos(token).then(setAgendamentos).catch(() => {})
  }, [token])

  const upcoming = agendamentos
    .filter(a => a.data_aula >= today)
    .sort((a, b) => a.data_aula.localeCompare(b.data_aula) || a.hora_aula.localeCompare(b.hora_aula))
    .slice(0, 5)

  const total = agendamentos.length
  const realizadas = agendamentos.filter(a => a.data_aula < today).length

  return (
    <div className="space-y-6">
      {/* Boas-vindas */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
        <p className="text-blue-100 text-sm mb-1">Bem-vindo(a) de volta</p>
        <h1 className="text-2xl font-bold">{student?.nome.split(' ')[0]} 👋</h1>
        <p className="text-blue-100 text-sm mt-2">Acompanhe suas aulas e progresso aqui.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{total}</p>
          <p className="text-xs text-slate-500 mt-1">Total de aulas</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{realizadas}</p>
          <p className="text-xs text-slate-500 mt-1">Realizadas</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{upcoming.length}</p>
          <p className="text-xs text-slate-500 mt-1">Agendadas</p>
        </div>
      </div>

      {/* Próximas aulas */}
      <div className="card">
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <CalendarDays size={16} className="text-blue-600" />
            Próximas aulas
          </h2>
          <Link to="/portal/aulas" className="text-xs text-blue-600 font-medium flex items-center gap-1 hover:underline">
            Ver todas <ArrowRight size={12} />
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Clock size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">Nenhuma aula agendada</p>
            <p className="text-xs">Entre em contato com a autoescola para agendar</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-50">
            {upcoming.map(a => (
              <li key={a.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="shrink-0 w-12 text-center">
                  <p className="text-[10px] font-semibold uppercase text-slate-400 leading-none">
                    {new Date(a.data_aula + 'T00:00').toLocaleDateString('pt-BR', { month: 'short' })}
                  </p>
                  <p className="text-xl font-bold text-slate-900 leading-tight">{a.data_aula.slice(8)}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{formatTime(a.hora_aula)}</p>
                  <span className={`text-xs badge ${instructorColor(a.instrutor)}`}>{a.instrutor}</span>
                </div>
                <CheckCircle2 size={18} className="text-blue-200 shrink-0" />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Dica */}
      <div className="rounded-xl bg-amber-50 border border-amber-100 p-4 text-sm text-amber-800">
        <strong>Lembrete:</strong> Chegue com 10 minutos de antecedência para suas aulas práticas.
        Em caso de imprevisto, avise a autoescola com pelo menos 2h de antecedência.
      </div>
    </div>
  )
}
