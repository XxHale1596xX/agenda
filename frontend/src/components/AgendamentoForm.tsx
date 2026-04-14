import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import type { Agendamento } from '../types'

const schema = z.object({
  aluno:      z.string().min(2, 'Nome do aluno é obrigatório'),
  instrutor:  z.string().min(2, 'Nome do instrutor é obrigatório'),
  data_aula:  z.string().min(1, 'Data é obrigatória'),
  hora_aula:  z.string().min(1, 'Hora é obrigatória'),
})

type FormValues = z.infer<typeof schema>

interface Props {
  initial?: Agendamento
  slotDefault?: { data_aula: string; hora_aula: string }
  loading: boolean
  onSubmit: (values: FormValues) => void
  onCancel: () => void
}

export function AgendamentoForm({ initial, slotDefault, loading, onSubmit, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initial
      ? {
          aluno: initial.aluno,
          instrutor: initial.instrutor,
          data_aula: initial.data_aula,
          hora_aula: initial.hora_aula.slice(0, 5),
        }
      : {
          aluno: '',
          instrutor: '',
          data_aula: slotDefault?.data_aula ?? '',
          hora_aula: slotDefault?.hora_aula ?? '',
        },
  })

  useEffect(() => {
    if (initial) {
      reset({
        aluno: initial.aluno,
        instrutor: initial.instrutor,
        data_aula: initial.data_aula,
        hora_aula: initial.hora_aula.slice(0, 5),
      })
    } else {
      reset({
        aluno: '',
        instrutor: '',
        data_aula: slotDefault?.data_aula ?? '',
        hora_aula: slotDefault?.hora_aula ?? '',
      })
    }
  }, [initial, slotDefault, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="aluno" className="label">Aluno</label>
          <input id="aluno" {...register('aluno')} className="input" placeholder="Nome completo" aria-invalid={!!errors.aluno} />
          {errors.aluno && <p className="text-xs text-red-500 mt-1" role="alert">{errors.aluno.message}</p>}
        </div>
        <div>
          <label htmlFor="instrutor" className="label">Instrutor</label>
          <input id="instrutor" {...register('instrutor')} className="input" placeholder="Nome do instrutor" aria-invalid={!!errors.instrutor} />
          {errors.instrutor && <p className="text-xs text-red-500 mt-1" role="alert">{errors.instrutor.message}</p>}
        </div>
        <div>
          <label htmlFor="data_aula" className="label">Data da Aula</label>
          <input id="data_aula" {...register('data_aula')} type="date" className="input" aria-invalid={!!errors.data_aula} />
          {errors.data_aula && <p className="text-xs text-red-500 mt-1" role="alert">{errors.data_aula.message}</p>}
        </div>
        <div>
          <label htmlFor="hora_aula" className="label">Horário</label>
          <input id="hora_aula" {...register('hora_aula')} type="time" className="input" aria-invalid={!!errors.hora_aula} />
          {errors.hora_aula && <p className="text-xs text-red-500 mt-1" role="alert">{errors.hora_aula.message}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancelar
        </button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading && <Loader2 size={14} className="animate-spin" />}
          {initial ? 'Salvar' : 'Agendar'}
        </button>
      </div>
    </form>
  )
}
