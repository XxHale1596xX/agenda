import { Lock, Unlock, Loader2, X, Calendar } from 'lucide-react'
import { bloqueiosApi } from '../api/bloqueios'
import { useCreateBloqueio, useDeleteBloqueio } from '../hooks/useBloqueios'
import { useDisponibilidadeMes } from '../hooks/useDisponibilidade'
import { useToast } from './ui/Toast'
import type { StatusSlot } from '../types'
import { cn, formatDate } from '../lib/utils'

interface Props {
  data: string              // "YYYY-MM-DD"
  slots: Record<string, StatusSlot>
  isAdmin: boolean
  adminToken?: string
  onClose: () => void
}

const statusConfig: Record<StatusSlot, { label: string; bg: string; text: string; dot: string }> = {
  disponivel: { label: 'Disponível', bg: 'bg-green-50 border-green-200 hover:bg-green-100', text: 'text-green-700', dot: 'bg-green-400' },
  ocupado:    { label: 'Ocupado',    bg: 'bg-blue-50 border-blue-200',                       text: 'text-blue-700',  dot: 'bg-blue-400'  },
  bloqueado:  { label: 'Bloqueado',  bg: 'bg-red-50 border-red-200',                         text: 'text-red-700',   dot: 'bg-red-400'   },
}

export function PainelDia({ data, slots, isAdmin, adminToken, onClose }: Props) {
  const { toast } = useToast()
  const anoMes = data.slice(0, 7)
  const { data: dispMes } = useDisponibilidadeMes(anoMes)

  const createBloqueio = useCreateBloqueio(adminToken ?? '')
  const deleteBloqueio = useDeleteBloqueio(adminToken ?? '')

  // Obtém bloqueios da data para conseguir o ID
  async function toggleSlot(hora: string, status: StatusSlot) {
    if (!isAdmin || !adminToken) return
    if (status === 'ocupado') return // não pode bloquear slot com agendamento

    try {
      if (status === 'bloqueado') {
        // buscar id do bloqueio e remover
        const lista = await bloqueiosApi.list(data)
        const bloqueio = lista.find(b =>
          b.hora ? b.hora.slice(0, 5) === hora : b.hora === null
        )
        if (bloqueio) {
          await deleteBloqueio.mutateAsync(bloqueio.id)
          toast(`Horário ${hora} desbloqueado.`)
        }
      } else {
        await createBloqueio.mutateAsync({ data, hora: `${hora}:00` })
        toast(`Horário ${hora} bloqueado.`)
      }
    } catch (e: any) {
      toast(e.message ?? 'Erro ao alterar bloqueio', 'error')
    }
  }

  async function bloquearDia() {
    if (!isAdmin || !adminToken) return
    try {
      await createBloqueio.mutateAsync({ data, hora: null })
      toast('Dia inteiro bloqueado.')
    } catch (e: any) {
      toast(e.message ?? 'Erro', 'error')
    }
  }

  async function desbloquearDia() {
    if (!isAdmin || !adminToken) return
    try {
      const lista = await bloqueiosApi.list(data)
      for (const b of lista) {
        await deleteBloqueio.mutateAsync(b.id)
      }
      toast('Todos os bloqueios do dia removidos.')
    } catch (e: any) {
      toast(e.message ?? 'Erro', 'error')
    }
  }

  // Usa dados atualizados do cache se disponíveis
  const slotsAtuais: Record<string, StatusSlot> = dispMes?.[data] ?? slots
  const isDiaBloqueado = Object.values(slotsAtuais).every(s => s === 'bloqueado')
  const isMutating = createBloqueio.isPending || deleteBloqueio.isPending

  return (
    <div className="card p-5 mt-2 animate-in slide-in-from-top-2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-slate-400" />
          <h3 className="font-semibold text-slate-900">{formatDate(data)}</h3>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            isDiaBloqueado ? (
              <button
                onClick={desbloquearDia}
                disabled={isMutating}
                className="btn-secondary text-xs gap-1.5"
              >
                <Unlock size={13} />
                Desbloquear dia
              </button>
            ) : (
              <button
                onClick={bloquearDia}
                disabled={isMutating}
                className="btn-danger text-xs gap-1.5"
              >
                <Lock size={13} />
                Bloquear dia inteiro
              </button>
            )
          )}
          <button onClick={onClose} className="btn-ghost p-1.5">
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {Object.entries(slotsAtuais).map(([hora, status]) => {
          const cfg = statusConfig[status]
          const clicavel = isAdmin && status !== 'ocupado'

          return (
            <button
              key={hora}
              onClick={() => toggleSlot(hora, status)}
              disabled={!clicavel || isMutating}
              className={cn(
                'flex flex-col items-center gap-1 rounded-xl border p-3 text-xs font-medium transition-all',
                cfg.bg,
                cfg.text,
                clicavel ? 'cursor-pointer' : 'cursor-default',
                !clicavel && 'opacity-90',
              )}
            >
              <span className="text-sm font-bold">{hora}</span>
              <span className="flex items-center gap-1">
                <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
                {cfg.label}
              </span>
              {isAdmin && status !== 'ocupado' && (
                isMutating
                  ? <Loader2 size={11} className="animate-spin opacity-50" />
                  : status === 'bloqueado'
                  ? <Unlock size={11} className="opacity-60" />
                  : <Lock size={11} className="opacity-40" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
