import { useCallback, useMemo, useState } from 'react'
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { useQuery } from '@tanstack/react-query'
import { bloqueiosApi } from '../api/bloqueios'
import { useAgendamentos } from '../hooks/useAgendamentos'
import type { Agendamento, Bloqueio } from '../types'

// ── Localizer pt-BR ──────────────────────────────────────────────────────────
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 0 }),
  getDay,
  locales: { 'pt-BR': ptBR },
})

// ── Limites de horário ───────────────────────────────────────────────────────
const MIN_TIME = new Date(1970, 1, 1, 8, 0)
const MAX_TIME = new Date(1970, 1, 1, 18, 0)

// ── Paleta de cores por instrutor ────────────────────────────────────────────
const PALETTE = [
  { bg: '#dbeafe', color: '#1e40af' },
  { bg: '#ede9fe', color: '#6d28d9' },
  { bg: '#dcfce7', color: '#15803d' },
  { bg: '#ffedd5', color: '#c2410c' },
  { bg: '#fce7f3', color: '#be185d' },
  { bg: '#ccfbf1', color: '#0f766e' },
]

function instructorColor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return PALETTE[Math.abs(h) % PALETTE.length]
}

// ── Tipos internos ───────────────────────────────────────────────────────────
interface RBCEvent {
  id: number
  title: string
  start: Date
  end: Date
  resource: Agendamento
}

function toEvent(a: Agendamento): RBCEvent {
  const [y, m, d] = a.data_aula.split('-').map(Number)
  const [h, min] = a.hora_aula.split(':').map(Number)
  const start = new Date(y, m - 1, d, h, min)
  const end = new Date(y, m - 1, d, h + 1, min)
  return { id: a.id, title: a.aluno, start, end, resource: a }
}

// ── Mensagens em PT-BR ───────────────────────────────────────────────────────
const messages = {
  allDay: 'Dia inteiro',
  previous: '‹',
  next: '›',
  today: 'Hoje',
  month: 'Mês',
  week: 'Semana',
  day: 'Dia',
  agenda: 'Agenda',
  date: 'Data',
  time: 'Hora',
  event: 'Aula',
  noEventsInRange: 'Nenhuma aula neste período.',
  showMore: (n: number) => `+${n} mais`,
}

// ── Formatos de data ─────────────────────────────────────────────────────────
const formats = {
  dayHeaderFormat: (date: Date) =>
    format(date, "EEE dd/MM", { locale: ptBR }),
  dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) =>
    `${format(start, 'dd/MM', { locale: ptBR })} – ${format(end, 'dd/MM', { locale: ptBR })}`,
  agendaDateFormat: (date: Date) =>
    format(date, "EEE, dd 'de' MMMM", { locale: ptBR }),
  agendaTimeFormat: (date: Date) => format(date, 'HH:mm', { locale: ptBR }),
  timeGutterFormat: (date: Date) => format(date, 'HH:mm', { locale: ptBR }),
  monthHeaderFormat: (date: Date) =>
    format(date, "MMMM 'de' yyyy", { locale: ptBR }),
}

// ── Props ────────────────────────────────────────────────────────────────────
interface Props {
  onSelectSlot: (start: Date) => void
  onSelectEvent: (a: Agendamento) => void
}

// ── Componente ───────────────────────────────────────────────────────────────
export function CalendarioRBC({ onSelectSlot, onSelectEvent }: Props) {
  const [view, setView] = useState<(typeof Views)[keyof typeof Views]>(Views.WEEK)
  const [date, setDate] = useState(new Date())

  const { data: agendamentos = [] } = useAgendamentos()

  const { data: bloqueios = [] } = useQuery<Bloqueio[]>({
    queryKey: ['bloqueios'],
    queryFn: () => bloqueiosApi.list(),
    staleTime: 60_000,
  })

  const events = useMemo(() => agendamentos.map(toEvent), [agendamentos])

  const eventPropGetter = useCallback((event: RBCEvent) => {
    const { bg, color } = instructorColor(event.resource.instrutor)
    return {
      style: {
        backgroundColor: bg,
        color,
        borderLeft: `3px solid ${color}`,
        borderRadius: '6px',
        border: 'none',
        fontSize: '12px',
        fontWeight: 500,
        padding: '2px 6px',
      },
    }
  }, [])

  const slotPropGetter = useCallback(
    (slot: Date) => {
      const dateStr = format(slot, 'yyyy-MM-dd')
      const timeStr = format(slot, 'HH:mm')
      const fullDay = bloqueios.some(b => b.data === dateStr && b.hora === null)
      if (fullDay) return { className: 'rbc-slot-bloqueado-dia' }
      const blocked = bloqueios.some(
        b => b.data === dateStr && b.hora != null && b.hora.startsWith(timeStr),
      )
      if (blocked) return { className: 'rbc-slot-bloqueado' }
      return {}
    },
    [bloqueios],
  )

  const dayPropGetter = useCallback(
    (day: Date) => {
      const dateStr = format(day, 'yyyy-MM-dd')
      const fullDay = bloqueios.some(b => b.data === dateStr && b.hora === null)
      if (fullDay) return { className: 'rbc-day-bloqueado' }
      return {}
    },
    [bloqueios],
  )

  return (
    <div className="rbc-wrapper" style={{ height: 680 }}>
      <Calendar<RBCEvent>
        localizer={localizer}
        culture="pt-BR"
        events={events}
        view={view}
        date={date}
        onView={v => setView(v)}
        onNavigate={d => setDate(d)}
        min={MIN_TIME}
        max={MAX_TIME}
        step={60}
        timeslots={1}
        selectable
        popup
        tooltipAccessor={e => `${e.resource.aluno} — Instrutor: ${e.resource.instrutor}`}
        messages={messages}
        formats={formats}
        eventPropGetter={eventPropGetter}
        slotPropGetter={slotPropGetter}
        dayPropGetter={dayPropGetter}
        onSelectSlot={info => onSelectSlot(info.start)}
        onSelectEvent={e => onSelectEvent(e.resource)}
      />
    </div>
  )
}
