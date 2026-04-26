import { Construction } from 'lucide-react'

const ROADMAP: Record<string, { items: string[]; quarter: string }> = {
  Financeiro: {
    quarter: 'Q3 2026',
    items: ['Planos e pacotes de curso', 'Controle de mensalidades', 'Emissão de boletos', 'Relatório de inadimplência'],
  },
  Pedagógico: {
    quarter: 'Q3 2026',
    items: ['Videoaulas por categoria', 'Simulados de prova teórica', 'Material didático digital', 'Trilhas de aprendizagem'],
  },
  Comunicação: {
    quarter: 'Q4 2026',
    items: ['Lembretes automáticos por e-mail', 'Integração com WhatsApp', 'Notificações de vencimento', 'Histórico de atendimento'],
  },
  Relatórios: {
    quarter: 'Q4 2026',
    items: ['Frequência e aprovação', 'Faturamento mensal', 'Desempenho por instrutor', 'Exportação PDF/Excel'],
  },
}

interface Props {
  module: string
}

export function ComingSoon({ module }: Props) {
  const info = ROADMAP[module] ?? { quarter: 'Em breve', items: [] }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-5">
        <Construction size={32} className="text-amber-500" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Módulo {module}</h2>
      <p className="text-slate-500 mb-1">Em desenvolvimento — previsão <strong>{info.quarter}</strong></p>
      <p className="text-sm text-slate-400 mb-8 max-w-sm">
        Esta funcionalidade está no roadmap do produto e será disponibilizada em breve.
      </p>

      {info.items.length > 0 && (
        <div className="card p-6 max-w-sm w-full text-left">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
            O que está por vir
          </p>
          <ul className="space-y-2">
            {info.items.map(item => (
              <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
