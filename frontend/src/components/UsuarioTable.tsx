import { Pencil, Trash2, UserCheck, UserX, Search } from 'lucide-react'
import type { UsuarioMasked } from '../types'
import { formatDate } from '../lib/utils'

interface Props {
  usuarios: UsuarioMasked[]
  busca: string
  onBuscaChange: (v: string) => void
  onEdit: (u: UsuarioMasked) => void
  onDelete: (u: UsuarioMasked) => void
  onToggleAtivo: (u: UsuarioMasked) => void
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

export function UsuarioTable({ usuarios, busca, onBuscaChange, onEdit, onDelete, onToggleAtivo }: Props) {
  return (
    <div>
      <div className="p-4 border-b border-slate-100">
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            className="input pl-9"
            placeholder="Buscar por nome ou CPF..."
            value={busca}
            onChange={e => onBuscaChange(e.target.value)}
          />
        </div>
      </div>

      {usuarios.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <UserCheck size={48} className="mb-3 opacity-40" />
          <p className="text-base font-medium">Nenhum usuário encontrado</p>
          <p className="text-sm">Cadastre o primeiro usuário acima</p>
        </div>
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Usuário</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">CPF</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">E-mail</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Telefone</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Cadastro</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {usuarios.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 transition group">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${u.ativo ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                          {initials(u.nome)}
                        </div>
                        <span className={`font-medium ${u.ativo ? 'text-slate-900' : 'text-slate-400 line-through'}`}>
                          {u.nome}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-500 text-xs tracking-wider">
                      {u.cpf_mascarado}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 text-xs">
                      {u.email_mascarado ?? <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 text-xs">
                      {u.telefone ?? <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 text-xs">
                      {formatDate(u.criado_em.slice(0, 10))}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`badge ${u.ativo ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {u.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button onClick={() => onToggleAtivo(u)} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50" title={u.ativo ? 'Desativar' : 'Ativar'}>
                          {u.ativo ? <UserX size={15} /> : <UserCheck size={15} />}
                        </button>
                        <button onClick={() => onEdit(u)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50" title="Editar">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => onDelete(u)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50" title="Excluir">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="md:hidden space-y-3 p-4">
            {usuarios.map(u => (
              <div key={u.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${u.ativo ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                      {initials(u.nome)}
                    </div>
                    <div>
                      <p className={`font-semibold text-sm ${u.ativo ? 'text-slate-900' : 'text-slate-400 line-through'}`}>{u.nome}</p>
                      <p className="font-mono text-xs text-slate-400 tracking-wider">{u.cpf_mascarado}</p>
                    </div>
                  </div>
                  <span className={`badge ${u.ativo ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {u.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                {u.email_mascarado && (
                  <p className="text-xs text-slate-400 mt-1 ml-11">{u.email_mascarado}</p>
                )}
                <div className="flex justify-end gap-1 mt-2">
                  <button onClick={() => onToggleAtivo(u)} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50">
                    {u.ativo ? <UserX size={15} /> : <UserCheck size={15} />}
                  </button>
                  <button onClick={() => onEdit(u)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => onDelete(u)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-400">
            {usuarios.length} usuário{usuarios.length !== 1 ? 's' : ''}
          </div>
        </>
      )}
    </div>
  )
}
