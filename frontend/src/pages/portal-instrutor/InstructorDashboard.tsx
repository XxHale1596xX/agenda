import { useEffect, useState } from 'react'
import { CalendarDays, Clock, CheckCircle2, Link as LinkIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useInstructorAuth } from '../../context/InstructorAuthContext'
import { instrutorAuthApi } from '../../api/authInstrutor'
import { formatDate, formatTime } from '../../lib/utils'
import type { Agendamento } from '../../types'

export function InstructorDashboard() {
  const { token, instructor } = useInstructorAuth()
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const today = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    if (!token) return
    instrutorAuthApi.agenda(token).then(setAgendamentos).catch(() => {})
  }, [token])

  const todayList = agendamentos
    .filter(a => a.data_aula === today)
    .sort((a, b) => a.hora_aula.localeCompare(b.hora_aula))

  const upcoming = agendamentos
    .filter(a => a.data_aula >= today)
    .sort((a, b) => a.data_aula.localeCompare(b.data_aula) || a.hora_aula.localeCompare(b.hora_aula))
    .slice(0, 6)

  const totalMes = agendamentos.filter(a => a.data_aula.slice(0, 7) === today.slice(0, 7)).length

  return (
    <div className="space-y-6">
      {/* Boas-vindas */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 text-white">
        <p className="text-green-100 text-sm mb-1">Bem-vindo(a)</p>
        <h1 className="text-2xl font-bold">{instructor?.nome.split(' ')[0]} 👋</h1>
        <div className="flex items-center gap-2 mt-2">
          {instructor?.categorias.split(',').map(c => (
            <span key={c} className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded">Cat. {c}</span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{todayList.length}</p>
          <p className="text-xs text-slate-500 mt-1">Aulas hoje</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{upcoming.length}</p>
          <p className="text-xs text-slate-500 mt-1">Próximas</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{totalMes}</p>
          <p className="text-xs text-slate-500 mt-1">Este mês</p>
        </div>
      </div>

      {/* Aulas de hoje */}
      <div className="card">
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Clock size={16} className="text-green-600" />
            Aulas de hoje — {formatDate(today)}
          </h2>
        </div>
        {todayList.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-sm">
            <Clock size={28} className="mx-auto mb-2 opacity-30" />
            Nenhuma aula hoje
          </div>
        ) : (
          <ul className="divide-y divide-slate-50">
            {todayList.map(a => (
              <li key={a.id} className="flex items-center gap-4 px-5 py-3.5">
                <span className="text-sm font-mono font-semibold text-slate-700 w-14 shrink-0">
                  {formatTime(a.hora_aula)}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{a.aluno}</p>
                </div>
                <CheckCircle2 size={16} className="text-green-200" />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Próximas aulas */}
      <div className="card">
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <CalendarDays size={16} className="text-green-600" />
            Próximas aulas
          </h2>
          <Link to="/portal-instrutor/agenda" className="text-xs text-green-600 hover:underline flex items-center gap-1">
            Ver agenda <LinkIcon size={11} />
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-sm">Nenhuma aula agendada</div>
        ) : (
          <ul className="divide-y divide-slate-50">
            {upcoming.map(a => (
              <li key={a.id} className="flex items-center gap-4 px-5 py-3">
                <div className="shrink-0 w-12 text-center">
                  <p className="text-[10px] font-semibold uppercase text-slate-400 leading-none">
                    {new Date(a.data_aula + 'T00:00').toLocaleDateString('pt-BR', { month: 'short' })}
                  </p>
                  <p className="text-xl font-bold text-slate-900 leading-tight">{a.data_aula.slice(8)}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{a.aluno}</p>
                  <p className="text-xs text-slate-400">{formatTime(a.hora_aula)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
