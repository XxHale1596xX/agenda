import { useEffect, useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { useInstructorAuth } from '../../context/InstructorAuthContext'
import { instrutorAuthApi, type DisponibilidadeSlot } from '../../api/authInstrutor'
import type { Agendamento } from '../../types'

const HORAS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']
const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function startOfWeek(d: Date): Date {
  const dt = new Date(d)
  dt.setDate(dt.getDate() - dt.getDay())
  dt.setHours(0, 0, 0, 0)
  return dt
}

function addDays(d: Date, n: number): Date {
  const dt = new Date(d)
  dt.setDate(dt.getDate() + n)
  return dt
}

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function formatHeader(d: Date): string {
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

type SlotStatus = 'disponivel' | 'ocupado' | 'livre' | 'loading'

export function InstructorAgenda() {
  const { token } = useInstructorAuth()
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()))
  const [disponibilidade, setDisponibilidade] = useState<DisponibilidadeSlot[]>([])
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [loadingSlot, setLoadingSlot] = useState<string | null>(null)
  const [fetching, setFetching] = useState(false)

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const weekEnd = addDays(weekStart, 6)

  const load = useCallback(async () => {
    if (!token) return
    setFetching(true)
    try {
      const [disp, agenda] = await Promise.all([
        instrutorAuthApi.disponibilidade(token, toDateStr(weekStart), toDateStr(weekEnd)),
        instrutorAuthApi.agenda(token),
      ])
      setDisponibilidade(disp)
      setAgendamentos(agenda)
    } finally {
      setFetching(false)
    }
  }, [token, weekStart])

  useEffect(() => { load() }, [load])

  function getSlotKey(dateStr: string, hora: string) { return `${dateStr}-${hora}` }

  function getStatus(dateStr: string, hora: string): SlotStatus {
    const key = getSlotKey(dateStr, hora)
    if (loadingSlot === key) return 'loading'
    const temAgendamento = agendamentos.some(
      a => a.data_aula === dateStr && a.hora_aula.slice(0, 5) === hora
    )
    if (temAgendamento) return 'ocupado'
    const temDisp = disponibilidade.some(
      d => d.data === dateStr && d.hora.slice(0, 5) === hora
    )
    return temDisp ? 'disponivel' : 'livre'
  }

  function getDispId(dateStr: string, hora: string): number | null {
    const d = disponibilidade.find(d => d.data === dateStr && d.hora.slice(0, 5) === hora)
    return d?.id ?? null
  }

  async function toggleSlot(dateStr: string, hora: string) {
    if (!token) return
    const status = getStatus(dateStr, hora)
    if (status === 'ocupado' || status === 'loading') return
    const key = getSlotKey(dateStr, hora)
    setLoadingSlot(key)
    try {
      if (status === 'disponivel') {
        const id = getDispId(dateStr, hora)
        if (id) {
          await instrutorAuthApi.desmarcarSlot(token, id)
          setDisponibilidade(prev => prev.filter(d => d.id !== id))
        }
      } else {
        const novo = await instrutorAuthApi.marcarSlot(token, dateStr, `${hora}:00`)
        setDisponibilidade(prev => [...prev, novo])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingSlot(null)
    }
  }

  const today = toDateStr(new Date())

  function weekLabel() {
    const ini = weekStart.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    const fim = weekEnd.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    return `${ini} – ${fim}`
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Minha Agenda</h2>
        <div className="flex items-center gap-2">
          {fetching && <Loader2 size={15} className="animate-spin text-slate-400" />}
          <button
            onClick={() => setWeekStart(startOfWeek(new Date()))}
            className="text-xs text-blue-600 font-medium px-2.5 py-1 rounded-lg hover:bg-blue-50 transition"
          >
            Hoje
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-slate-600">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-400 inline-block" />Disponível (clique para remover)</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-400 inline-block" />Aula agendada</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-slate-100 border border-slate-200 inline-block" />Livre (clique para marcar)</span>
      </div>

      {/* Week navigation */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 px-4 py-2.5">
        <button
          onClick={() => setWeekStart(w => addDays(w, -7))}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition"
          aria-label="Semana anterior"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-semibold text-slate-800 capitalize">{weekLabel()}</span>
        <button
          onClick={() => setWeekStart(w => addDays(w, 7))}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition"
          aria-label="Próxima semana"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Grid */}
      <div className="card overflow-x-auto">
        <table className="w-full text-xs border-collapse min-w-[600px]">
          <thead>
            <tr>
              <th className="w-16 px-2 py-2 text-slate-400 font-medium border-b border-slate-100 text-left">Hora</th>
              {weekDays.map((d, i) => {
                const ds = toDateStr(d)
                const isToday = ds === today
                return (
                  <th
                    key={ds}
                    className={`px-1 py-2 font-semibold border-b border-slate-100 text-center ${isToday ? 'text-blue-600' : 'text-slate-600'}`}
                  >
                    <span className="block">{DIAS_SEMANA[i]}</span>
                    <span className={`block text-base font-bold ${isToday ? 'text-blue-600' : 'text-slate-900'}`}>
                      {formatHeader(d)}
                    </span>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {HORAS.map(hora => (
              <tr key={hora} className="border-b border-slate-50 last:border-0">
                <td className="px-2 py-1 text-slate-400 font-mono font-medium">{hora}</td>
                {weekDays.map(d => {
                  const ds = toDateStr(d)
                  const status = getStatus(ds, hora)
                  const isPast = ds < today || (ds === today && parseInt(hora) < new Date().getHours())
                  const key = getSlotKey(ds, hora)

                  const bg =
                    status === 'ocupado'    ? 'bg-blue-100 text-blue-700 cursor-default' :
                    status === 'disponivel' ? 'bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer' :
                    status === 'loading'    ? 'bg-slate-100 cursor-wait animate-pulse' :
                    isPast                 ? 'bg-slate-50 text-slate-300 cursor-default' :
                                            'hover:bg-green-50 cursor-pointer text-slate-300'

                  return (
                    <td key={key} className="p-0.5">
                      <button
                        onClick={() => !isPast && toggleSlot(ds, hora)}
                        disabled={status === 'ocupado' || status === 'loading' || isPast}
                        className={`w-full rounded-md py-2 text-xs font-medium transition ${bg}`}
                        title={
                          status === 'ocupado' ? 'Aula agendada' :
                          status === 'disponivel' ? 'Disponível — clique para remover' :
                          isPast ? 'Passado' : 'Livre — clique para marcar'
                        }
                      >
                        {status === 'loading' ? '...' :
                         status === 'ocupado' ? '📚' :
                         status === 'disponivel' ? '✓' : ''}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-400">
        Clique nos slots para marcar ou desmarcar sua disponibilidade. Slots com aulas agendadas não podem ser alterados.
      </p>
    </div>
  )
}
