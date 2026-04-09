import { Pencil, Trash2, Calendar, Clock } from 'lucide-react'
import type { Agendamento } from '../types'
import { formatDate, formatTime } from '../lib/utils'

interface Props {
  agendamentos: Agendamento[]
  onEdit: (a: Agendamento) => void
  onDelete: (a: Agendamento) => void
}

const COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-green-100 text-green-700',
  'bg-orange-100 text-orange-700',
  'bg-pink-100 text-pink-700',
  'bg-teal-100 text-teal-700',
]

function instructorColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return COLORS[Math.abs(hash) % COLORS.length]
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

export function AgendamentoTable({ agendamentos, onEdit, onDelete }: Props) {
  if (agendamentos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Calendar size={48} className="mb-3 opacity-40" />
        <p className="text-base font-medium">Nenhum agendamento encontrado</p>
        <p className="text-sm">Crie um novo agendamento acima</p>
      </div>
    )
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Aluno</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Instrutor</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Data</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Horário</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {agendamentos.map(a => (
              <tr key={a.id} className="hover:bg-slate-50 transition group">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                      {initials(a.aluno)}
                    </div>
                    <span className="font-medium text-slate-900">{a.aluno}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span className={`badge ${instructorColor(a.instrutor)}`}>
                    {a.instrutor}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-slate-400" />
                    {formatDate(a.data_aula)}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <Clock size={13} className="text-slate-400" />
                    {formatTime(a.hora_aula)}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => onEdit(a)}
                      className="btn-ghost p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                      title="Editar"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => onDelete(a)}
                      className="btn-ghost p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                      title="Excluir"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3 p-4">
        {agendamentos.map(a => (
          <div key={a.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500">
                  {initials(a.aluno)}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{a.aluno}</p>
                  <span className={`badge mt-0.5 ${instructorColor(a.instrutor)}`}>{a.instrutor}</span>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => onEdit(a)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                  <Pencil size={15} />
                </button>
                <button onClick={() => onDelete(a)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
            <div className="flex gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1"><Calendar size={12} />{formatDate(a.data_aula)}</span>
              <span className="flex items-center gap-1"><Clock size={12} />{formatTime(a.hora_aula)}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
