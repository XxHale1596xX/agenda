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
  loading: boolean
  onSubmit: (values: FormValues) => void
  onCancel: () => void
}

export function AgendamentoForm({ initial, loading, onSubmit, onCancel }: Props) {
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
      : {},
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
      reset({ aluno: '', instrutor: '', data_aula: '', hora_aula: '' })
    }
  }, [initial, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Aluno</label>
          <input {...register('aluno')} className="input" placeholder="Nome completo" />
          {errors.aluno && <p className="text-xs text-red-500 mt-1">{errors.aluno.message}</p>}
        </div>
        <div>
          <label className="label">Instrutor</label>
          <input {...register('instrutor')} className="input" placeholder="Nome do instrutor" />
          {errors.instrutor && <p className="text-xs text-red-500 mt-1">{errors.instrutor.message}</p>}
        </div>
        <div>
          <label className="label">Data da Aula</label>
          <input {...register('data_aula')} type="date" className="input" />
          {errors.data_aula && <p className="text-xs text-red-500 mt-1">{errors.data_aula.message}</p>}
        </div>
        <div>
          <label className="label">Horário</label>
          <input {...register('hora_aula')} type="time" className="input" />
          {errors.hora_aula && <p className="text-xs text-red-500 mt-1">{errors.hora_aula.message}</p>}
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
