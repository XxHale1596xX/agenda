import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { validateCPF, maskCPF, cpfDigits } from '../lib/utils'
import type { Instrutor, InstrutorPayload } from '../types'

const CATS = ['A', 'B', 'C', 'D', 'E'] as const

const schema = z.object({
  nome:     z.string().min(2, 'Nome é obrigatório'),
  cpf:      z.string().min(14, 'CPF incompleto').refine(v => validateCPF(v), 'CPF inválido'),
  email:    z.string().email('E-mail inválido').optional().or(z.literal('')),
  telefone: z.string().optional(),
  categorias: z.array(z.string()).min(1, 'Selecione ao menos uma categoria'),
})

type FormValues = z.infer<typeof schema>

interface Props {
  initial?: Instrutor
  loading: boolean
  onSubmit: (values: InstrutorPayload) => void
  onCancel: () => void
}

export function InstrutorForm({ initial, loading, onSubmit, onCancel }: Props) {
  const {
    register, handleSubmit, reset, setValue, watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initial
      ? {
          nome: initial.nome, cpf: maskCPF(initial.cpf),
          email: initial.email ?? '', telefone: initial.telefone ?? '',
          categorias: initial.categorias.split(','),
        }
      : { nome: '', cpf: '', email: '', telefone: '', categorias: ['B'] },
  })

  useEffect(() => {
    if (initial) {
      reset({
        nome: initial.nome, cpf: maskCPF(initial.cpf),
        email: initial.email ?? '', telefone: initial.telefone ?? '',
        categorias: initial.categorias.split(','),
      })
    } else {
      reset({ nome: '', cpf: '', email: '', telefone: '', categorias: ['B'] })
    }
  }, [initial, reset])

  const cpfValue = watch('cpf')
  const categoriasSel = watch('categorias') ?? []
  const cpfDigitCount = (cpfValue ?? '').replace(/\D/g, '').length
  const cpfOk = validateCPF(cpfValue ?? '')
  const [cpfMasked, setCpfMasked] = useState(initial ? maskCPF(initial.cpf) : '')

  function handleCPFChange(e: React.ChangeEvent<HTMLInputElement>) {
    const masked = maskCPF(e.target.value)
    setCpfMasked(masked)
    setValue('cpf', masked, { shouldValidate: true })
  }

  function toggleCat(cat: string) {
    const next = categoriasSel.includes(cat)
      ? categoriasSel.filter(c => c !== cat)
      : [...categoriasSel, cat]
    setValue('categorias', next, { shouldValidate: true })
  }

  function handleFormSubmit(values: FormValues) {
    onSubmit({
      nome: values.nome,
      cpf: cpfDigits(values.cpf),
      email: values.email || undefined,
      telefone: values.telefone || undefined,
      categorias: values.categorias.sort().join(','),
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label htmlFor="inst-nome" className="label">Nome completo</label>
        <input id="inst-nome" {...register('nome')} className="input" placeholder="Nome do instrutor" aria-invalid={!!errors.nome} />
        {errors.nome && <p className="text-xs text-red-500 mt-1" role="alert">{errors.nome.message}</p>}
      </div>

      <div>
        <label htmlFor="inst-cpf" className="label">CPF</label>
        <div className="relative">
          <input
            id="inst-cpf"
            value={cpfMasked}
            onChange={handleCPFChange}
            className={`input pr-10 ${errors.cpf ? 'border-red-400' : ''}`}
            placeholder="000.000.000-00"
            maxLength={14}
            inputMode="numeric"
            disabled={!!initial}
            aria-invalid={!!errors.cpf}
          />
          {cpfDigitCount >= 11 && (
            <span aria-hidden="true" className={`absolute right-3 top-1/2 -translate-y-1/2 text-lg ${cpfOk ? 'text-green-500' : 'text-red-500'}`}>
              {cpfOk ? '✓' : '✗'}
            </span>
          )}
        </div>
        {errors.cpf && <p className="text-xs text-red-500 mt-1" role="alert">{errors.cpf.message}</p>}
        {initial && <p className="text-xs text-slate-400 mt-1">O CPF não pode ser alterado.</p>}
      </div>

      <div>
        <label className="label">Categorias habilitadas</label>
        <div className="flex gap-2 flex-wrap">
          {CATS.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => toggleCat(cat)}
              className={`w-10 h-10 rounded-lg border-2 text-sm font-bold transition-all ${
                categoriasSel.includes(cat)
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        {errors.categorias && <p className="text-xs text-red-500 mt-1" role="alert">{errors.categorias.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="inst-email" className="label">E-mail <span className="text-slate-400 font-normal">(opcional)</span></label>
          <input id="inst-email" {...register('email')} type="email" className="input" placeholder="email@exemplo.com" />
          {errors.email && <p className="text-xs text-red-500 mt-1" role="alert">{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="inst-tel" className="label">Telefone <span className="text-slate-400 font-normal">(opcional)</span></label>
          <input id="inst-tel" {...register('telefone')} className="input" placeholder="(11) 99999-9999" />
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
