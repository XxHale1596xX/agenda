import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { validateCPF, maskCPF, cpfDigits } from '../lib/utils'
import type { Usuario } from '../types'

const schema = z.object({
  nome:     z.string().min(2, 'Nome é obrigatório'),
  cpf:      z.string()
              .min(14, 'CPF incompleto')
              .refine(v => validateCPF(v), 'CPF inválido'),
  email:    z.string().email('E-mail inválido').optional().or(z.literal('')),
  telefone: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  initial?: Usuario
  loading: boolean
  onSubmit: (values: { nome: string; cpf: string; email?: string; telefone?: string }) => void
  onCancel: () => void
}

export function UsuarioForm({ initial, loading, onSubmit, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initial
      ? { nome: initial.nome, cpf: maskCPF(initial.cpf), email: initial.email ?? '', telefone: initial.telefone ?? '' }
      : { nome: '', cpf: '', email: '', telefone: '' },
  })

  useEffect(() => {
    if (initial) {
      reset({ nome: initial.nome, cpf: maskCPF(initial.cpf), email: initial.email ?? '', telefone: initial.telefone ?? '' })
    } else {
      reset({ nome: '', cpf: '', email: '', telefone: '' })
    }
  }, [initial, reset])

  const cpfValue = watch('cpf')

  function handleCPFChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue('cpf', maskCPF(e.target.value), { shouldValidate: true })
  }

  function handleSubmitForm(values: FormValues) {
    onSubmit({
      nome: values.nome,
      cpf: cpfDigits(values.cpf),   // envia só os dígitos para a API
      email: values.email || undefined,
      telefone: values.telefone || undefined,
    })
  }

  const cpfOk = validateCPF(cpfValue ?? '')

  return (
    <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-4">
      <div>
        <label className="label">Nome completo</label>
        <input {...register('nome')} className="input" placeholder="Nome do aluno" />
        {errors.nome && <p className="text-xs text-red-500 mt-1">{errors.nome.message}</p>}
      </div>

      <div>
        <label className="label">CPF</label>
        <div className="relative">
          <input
            {...register('cpf')}
            onChange={handleCPFChange}
            className="input pr-10"
            placeholder="000.000.000-00"
            maxLength={14}
            inputMode="numeric"
            disabled={!!initial}  // CPF não pode ser alterado após cadastro
          />
          {cpfValue && cpfValue.length >= 14 && (
            <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-lg ${cpfOk ? 'text-green-500' : 'text-red-500'}`}>
              {cpfOk ? '✓' : '✗'}
            </span>
          )}
        </div>
        {errors.cpf && <p className="text-xs text-red-500 mt-1">{errors.cpf.message}</p>}
        {initial && <p className="text-xs text-slate-400 mt-1">O CPF não pode ser alterado.</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">E-mail <span className="text-slate-400 font-normal">(opcional)</span></label>
          <input {...register('email')} type="email" className="input" placeholder="email@exemplo.com" />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className="label">Telefone <span className="text-slate-400 font-normal">(opcional)</span></label>
          <input {...register('telefone')} className="input" placeholder="(11) 99999-9999" />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancelar</button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading && <Loader2 size={14} className="animate-spin" />}
          {initial ? 'Salvar' : 'Cadastrar'}
        </button>
      </div>
    </form>
  )
}
