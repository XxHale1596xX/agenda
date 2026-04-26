import { CalendarDays, Clock, Users, GraduationCap, Car, TrendingUp } from 'lucide-react'
import { useAgendamentos } from '../../hooks/useAgendamentos'
import { useUsuarios } from '../../hooks/useUsuarios'
import { useInstrutores } from '../../hooks/useInstrutores'
import { useVeiculos } from '../../hooks/useVeiculos'
import { formatDate, formatTime } from '../../lib/utils'

const COLORS = [
  'bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700',
  'bg-green-100 text-green-700', 'bg-orange-100 text-orange-700',
  'bg-pink-100 text-pink-700', 'bg-teal-100 text-teal-700',
]
function instructorColor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return COLORS[Math.abs(h) % COLORS.length]
}

interface StatCardProps {
  label: string
  value: number | string
  icon: React.ReactNode
  bg: string
  iconColor: string
  sub?: string
}

function StatCard({ label, value, icon, bg, iconColor, sub }: StatCardProps) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
        <span className={iconColor}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-slate-900 leading-none">{value}</p>
        <p className="text-xs text-slate-500 font-medium mt-1">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export function Dashboard() {
  const today = new Date().toISOString().slice(0, 10)
  const { data: agendamentos = [] } = useAgendamentos()
  const { data: usuarios = [] } = useUsuarios()
  const { data: instrutores = [] } = useInstrutores()
  const { data: veiculos = [] } = useVeiculos()

  const todayList = agendamentos
    .filter(a => a.data_aula === today)
    .sort((a, b) => a.hora_aula.localeCompare(b.hora_aula))

  const upcoming = agendamentos
    .filter(a => a.data_aula >= today)
    .sort((a, b) => a.data_aula.localeCompare(b.data_aula) || a.hora_aula.localeCompare(b.hora_aula))
    .slice(0, 8)

  const alunosAtivos = usuarios.filter(u => u.ativo).length
  const instrutoresAtivos = instrutores.filter(i => i.ativo).length
  const veiculosAtivos = veiculos.filter(v => v.ativo).length

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Agendamentos"    value={agendamentos.length}  icon={<CalendarDays size={22} />} bg="bg-blue-50"   iconColor="text-blue-600" />
        <StatCard label="Aulas hoje"      value={todayList.length}     icon={<Clock size={22} />}        bg="bg-amber-50"  iconColor="text-amber-600" />
        <StatCard label="Alunos ativos"   value={alunosAtivos}         icon={<Users size={22} />}        bg="bg-violet-50" iconColor="text-violet-600" />
        <StatCard label="Instrutores"     value={instrutoresAtivos}    icon={<GraduationCap size={22} />} bg="bg-green-50" iconColor="text-green-600" />
        <StatCard label="Veículos"        value={veiculosAtivos}       icon={<Car size={22} />}          bg="bg-orange-50" iconColor="text-orange-600" />
        <StatCard label="Total aulas/mês" value={agendamentos.filter(a => a.data_aula.slice(0, 7) === today.slice(0, 7)).length} icon={<TrendingUp size={22} />} bg="bg-teal-50" iconColor="text-teal-600" sub="mês corrente" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Aulas hoje */}
        <div className="card">
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">Aulas de hoje</h2>
            <span className="badge bg-blue-100 text-blue-700">{formatDate(today)}</span>
          </div>
          {todayList.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              <Clock size={32} className="mx-auto mb-2 opacity-30" />
              Nenhuma aula agendada para hoje
            </div>
          ) : (
            <ul className="divide-y divide-slate-50">
              {todayList.map(a => (
                <li key={a.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="text-sm font-mono font-medium text-slate-500 w-12 shrink-0">
                    {formatTime(a.hora_aula)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{a.aluno}</p>
                  </div>
                  <span className={`badge ${instructorColor(a.instrutor)}`}>{a.instrutor}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Próximas aulas */}
        <div className="card">
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">Próximas aulas</h2>
            <span className="badge bg-slate-100 text-slate-600">{upcoming.length} agendadas</span>
          </div>
          {upcoming.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              <CalendarDays size={32} className="mx-auto mb-2 opacity-30" />
              Nenhum agendamento futuro
            </div>
          ) : (
            <ul className="divide-y divide-slate-50">
              {upcoming.map(a => (
                <li key={a.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="shrink-0 text-center w-10">
                    <p className="text-[10px] font-semibold uppercase text-slate-400 leading-none">
                      {new Date(a.data_aula + 'T00:00').toLocaleDateString('pt-BR', { month: 'short' })}
                    </p>
                    <p className="text-lg font-bold text-slate-900 leading-tight">
                      {a.data_aula.slice(8)}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{a.aluno}</p>
                    <p className="text-xs text-slate-400">{formatTime(a.hora_aula)}</p>
                  </div>
                  <span className={`badge ${instructorColor(a.instrutor)}`}>{a.instrutor}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
