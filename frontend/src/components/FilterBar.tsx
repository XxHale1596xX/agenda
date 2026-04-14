import { Search, X } from 'lucide-react'
import type { AgendamentosFilter } from '../types'

interface Props {
  filter: AgendamentosFilter
  onChange: (f: AgendamentosFilter) => void
}

export function FilterBar({ filter, onChange }: Props) {
  const hasFilters = filter.instrutor || filter.data_aula

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[180px]">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" aria-hidden="true" />
        <input
          className="input pl-9"
          placeholder="Filtrar por instrutor..."
          aria-label="Filtrar por instrutor"
          value={filter.instrutor ?? ''}
          onChange={e => onChange({ ...filter, instrutor: e.target.value || undefined })}
        />
      </div>
      <div className="relative">
        <input
          type="date"
          className="input w-auto"
          value={filter.data_aula ?? ''}
          onChange={e => onChange({ ...filter, data_aula: e.target.value || undefined })}
        />
      </div>
      {hasFilters && (
        <button
          className="btn-ghost text-slate-500"
          onClick={() => onChange({})}
        >
          <X size={14} />
          Limpar filtros
        </button>
      )}
    </div>
  )
}
