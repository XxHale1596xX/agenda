import { useEffect, useState } from 'react'
import { Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { useStudentAuth } from '../../context/StudentAuthContext'
import { authApi } from '../../api/auth'
import { formatDate, formatTime } from '../../lib/utils'
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

type Filtro = 'todas' | 'proximas' | 'realizadas'

export function PortalAulas() {
  const { token } = useStudentAuth()
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<Filtro>('proximas')
  const today = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    if (!token) return
    authApi.meAgendamentos(token)
      .then(data => { setAgendamentos(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [token])

  const filtered = agendamentos
    .filter(a => {
      if (filtro === 'proximas') return a.data_aula >= today
      if (filtro === 'realizadas') return a.data_aula < today
      return true
    })
    .sort((a, b) => {
      if (filtro === 'realizadas') return b.data_aula.localeCompare(a.data_aula) || b.hora_aula.localeCompare(a.hora_aula)
      return a.data_aula.localeCompare(b.data_aula) || a.hora_aula.localeCompare(b.hora_aula)
    })

  const TABS: { id: Filtro; label: string }[] = [
    { id: 'proximas', label: 'Próximas' },
    { id: 'realizadas', label: 'Realizadas' },
    { id: 'todas', label: 'Todas' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Minhas Aulas</h2>
        <span className="badge bg-slate-100 text-slate-600">{agendamentos.length} total</span>
      </div>

      {/* Filtro tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setFiltro(t.id)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${filtro === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card py-16 text-center text-slate-400 text-sm">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="card py-16 text-center text-slate-400">
          <Calendar size={36} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">Nenhuma aula encontrada</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(a => {
            const isPast = a.data_aula < today
            return (
              <div key={a.id} className={`card p-4 flex items-center gap-4 ${isPast ? 'opacity-75' : ''}`}>
                <div className={`shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center ${isPast ? 'bg-slate-100' : 'bg-blue-50'}`}>
                  <p className="text-[10px] font-semibold uppercase text-slate-400 leading-none">
                    {new Date(a.data_aula + 'T00:00').toLocaleDateString('pt-BR', { month: 'short' })}
                  </p>
                  <p className={`text-xl font-bold leading-tight ${isPast ? 'text-slate-500' : 'text-blue-700'}`}>{a.data_aula.slice(8)}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`badge ${instructorColor(a.instrutor)}`}>{a.instrutor}</span>
                    {isPast ? (
                      <span className="badge bg-green-100 text-green-700 flex items-center gap-1">
                        <CheckCircle2 size={11} /> Realizada
                      </span>
                    ) : (
                      <span className="badge bg-blue-100 text-blue-700 flex items-center gap-1">
                        <AlertCircle size={11} /> Agendada
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} /> {formatDate(a.data_aula)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> {formatTime(a.hora_aula)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
