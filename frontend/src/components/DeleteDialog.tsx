import { Loader2, Trash2 } from 'lucide-react'
import { Modal } from './ui/Modal'

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  loading: boolean
  aluno: string
}

export function DeleteDialog({ open, onClose, onConfirm, loading, aluno }: Props) {
  return (
    <Modal open={open} onClose={onClose} title="Confirmar exclusão" size="sm">
      <p className="text-sm text-slate-600 mb-6">
        Tem certeza que deseja remover o agendamento de{' '}
        <span className="font-semibold text-slate-900">{aluno}</span>? Esta ação não pode ser desfeita.
      </p>
      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="btn-secondary">Cancelar</button>
        <button onClick={onConfirm} disabled={loading} className="btn-danger">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          Excluir
        </button>
      </div>
    </Modal>
  )
}
