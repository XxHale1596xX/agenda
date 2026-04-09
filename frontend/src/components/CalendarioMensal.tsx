import { useState } from 'react'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { useDisponibilidadeMes } from '../hooks/useDisponibilidade'
import { PainelDia } from './PainelDia'
import type { StatusSlot } from '../types'
import { cn } from '../lib/utils'

interface Props {
  isAdmin?: boolean
  adminToken?: string
}

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MESES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
]

function statusDia(slots: Record<string, StatusSlot>): 'livre' | 'parcial' | 'cheio' | 'bloqueado' {
  const vals = Object.values(slots)
  if (vals.every(s => s === 'bloqueado')) return 'bloqueado'
  if (vals.some(s => s === 'bloqueado')) return 'parcial'
  if (vals.every(s => s === 'ocupado')) return 'cheio'
  if (vals.some(s => s === 'ocupado')) return 'parcial'
  return 'livre'
}

export function CalendarioMensal({ isAdmin = false, adminToken }: Props) {
  const hoje = new Date()
  const [ano, setAno] = useState(hoje.getFullYear())
  const [mes, setMes] = useState(hoje.getMonth() + 1) // 1-12
  const [diaSelecionado, setDiaSelecionado] = useState<string | null>(null)

  const anoMes = `${ano}-${String(mes).padStart(2, '0')}`
  const { data: disponibilidade, isLoading } = useDisponibilidadeMes(anoMes)

  function navegar(delta: number) {
    setDiaSelecionado(null)
    const novaData = new Date(ano, mes - 1 + delta, 1)
    setAno(novaData.getFullYear())
    setMes(novaData.getMonth() + 1)
  }

  // Montar grade do calendário
  const primeiroDia = new Date(ano, mes - 1, 1).getDay() // 0=Dom
  const diasNoMes = new Date(ano, mes, 0).getDate()
  const celulas: (number | null)[] = [
    ...Array(primeiroDia).fill(null),
    ...Array.from({ length: diasNoMes }, (_, i) => i + 1),
  ]
  // Completar até múltiplo de 7
  while (celulas.length % 7 !== 0) celulas.push(null)

  const hojeStr = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`

  return (
    <div className="space-y-4">
      {/* Cabeçalho de navegação */}
      <div className="flex items-center justify-between">
        <button onClick={() => navegar(-1)} className="btn-ghost p-2">
          <ChevronLeft size={18} />
        </button>
        <h2 className="text-lg font-semibold text-slate-900">
          {MESES[mes - 1]} {ano}
        </h2>
        <button onClick={() => navegar(1)} className="btn-ghost p-2">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-400 inline-block" />Disponível</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" />Ocupado</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />Bloqueado</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />Parcial</span>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16 text-slate-400">
          <Loader2 size={28} className="animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {/* Cabeçalho dias da semana */}
          {DIAS_SEMANA.map(d => (
            <div key={d} className="text-center text-xs font-semibold text-slate-400 pb-2">
              {d}
            </div>
          ))}

          {/* Células */}
          {celulas.map((dia, idx) => {
            if (!dia) return <div key={`empty-${idx}`} />

            const dataStr = `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
            const slots = disponibilidade?.[dataStr]
            const status = slots ? statusDia(slots) : 'livre'
            const isHoje = dataStr === hojeStr
            const isSelecionado = dataStr === diaSelecionado

            const dotColor = {
              livre: 'bg-green-400',
              parcial: 'bg-amber-400',
              cheio: 'bg-blue-400',
              bloqueado: 'bg-red-400',
            }[status]

            return (
              <button
                key={dataStr}
                onClick={() => setDiaSelecionado(isSelecionado ? null : dataStr)}
                className={cn(
                  'relative flex flex-col items-center justify-center rounded-xl p-2 min-h-[56px] transition-all text-sm font-medium border',
                  isSelecionado
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : isHoje
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-white text-slate-700 border-slate-100 hover:border-blue-300 hover:bg-blue-50/50',
                )}
              >
                {dia}
                {slots && (
                  <span className={cn('w-1.5 h-1.5 rounded-full mt-1', isSelecionado ? 'bg-white' : dotColor)} />
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Painel do dia selecionado */}
      {diaSelecionado && disponibilidade && (
        <PainelDia
          data={diaSelecionado}
          slots={disponibilidade[diaSelecionado] ?? {}}
          isAdmin={isAdmin}
          adminToken={adminToken}
          onClose={() => setDiaSelecionado(null)}
        />
      )}
    </div>
  )
}
