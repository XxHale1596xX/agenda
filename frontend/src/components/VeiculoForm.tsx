import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import type { Veiculo, VeiculoPayload } from '../types'

const CATS = ['A', 'B', 'C', 'D', 'E'] as const

const THIS_YEAR = new Date().getFullYear()

const schema = z.object({
  placa:     z.string().min(7, 'Placa inválida').max(8, 'Placa inválida'),
  modelo:    z.string().min(1, 'Modelo é obrigatório'),
  marca:     z.string().min(1, 'Marca é obrigatória'),
  ano:       z.string().optional(),
  categoria: z.enum(['A', 'B', 'C', 'D', 'E']),
  km_atual:  z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  initial?: Veiculo
  loading: boolean
  onSubmit: (values: VeiculoPayload) => void
  onCancel: () => void
}

export function VeiculoForm({ initial, loading, onSubmit, onCancel }: Props) {
  const {
    register, handleSubmit, reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initial
      ? { placa: initial.placa, modelo: initial.modelo, marca: initial.marca,
          ano: initial.ano ? String(initial.ano) : '',
          categoria: initial.categoria as 'A'|'B'|'C'|'D'|'E',
          km_atual: String(initial.km_atual) }
      : { placa: '', modelo: '', marca: '', ano: '', categoria: 'B', km_atual: '0' },
  })

  useEffect(() => {
    if (initial) {
      reset({ placa: initial.placa, modelo: initial.modelo, marca: initial.marca,
              ano: initial.ano ? String(initial.ano) : '',
              categoria: initial.categoria as 'A'|'B'|'C'|'D'|'E',
              km_atual: String(initial.km_atual) })
    } else {
      reset({ placa: '', modelo: '', marca: '', ano: '', categoria: 'B', km_atual: '0' })
    }
  }, [initial, reset])

  function handleFormSubmit(values: FormValues) {
    const anoNum = values.ano ? parseInt(values.ano, 10) : undefined
    const kmNum  = values.km_atual ? parseInt(values.km_atual, 10) : 0
    if (anoNum && (anoNum < 1950 || anoNum > THIS_YEAR + 1)) return
    onSubmit({
      placa: values.placa.toUpperCase(),
      modelo: values.modelo,
      marca: values.marca,
      ano: anoNum,
      categoria: values.categoria,
      km_atual: kmNum,
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="v-placa" className="label">Placa</label>
          <input
            id="v-placa"
            {...register('placa')}
            className="input uppercase"
            placeholder="ABC-1234 ou ABC1D23"
            disabled={!!initial}
            aria-invalid={!!errors.placa}
          />
          {errors.placa && <p className="text-xs text-red-500 mt-1" role="alert">{errors.placa.message}</p>}
          {initial && <p className="text-xs text-slate-400 mt-1">A placa não pode ser alterada.</p>}
        </div>
        <div>
          <label htmlFor="v-categoria" className="label">Categoria</label>
          <select id="v-categoria" {...register('categoria')} className="input" aria-invalid={!!errors.categoria}>
            {CATS.map(c => <option key={c} value={c}>Categoria {c}</option>)}
          </select>
          {errors.categoria && <p className="text-xs text-red-500 mt-1" role="alert">{errors.categoria.message}</p>}
        </div>
        <div>
          <label htmlFor="v-marca" className="label">Marca</label>
          <input id="v-marca" {...register('marca')} className="input" placeholder="Volkswagen, Fiat…" aria-invalid={!!errors.marca} />
          {errors.marca && <p className="text-xs text-red-500 mt-1" role="alert">{errors.marca.message}</p>}
        </div>
        <div>
          <label htmlFor="v-modelo" className="label">Modelo</label>
          <input id="v-modelo" {...register('modelo')} className="input" placeholder="Gol, Uno, HB20…" aria-invalid={!!errors.modelo} />
          {errors.modelo && <p className="text-xs text-red-500 mt-1" role="alert">{errors.modelo.message}</p>}
        </div>
        <div>
          <label htmlFor="v-ano" className="label">Ano <span className="text-slate-400 font-normal">(opcional)</span></label>
          <input id="v-ano" {...register('ano')} type="number" className="input" placeholder="2022" />
          {errors.ano && <p className="text-xs text-red-500 mt-1" role="alert">{String(errors.ano.message)}</p>}
        </div>
        <div>
          <label htmlFor="v-km" className="label">KM atual <span className="text-slate-400 font-normal">(opcional)</span></label>
          <input id="v-km" {...register('km_atual')} type="number" className="input" placeholder="15000" min={0} />
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
