import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/agendamentos'
import type { AgendamentoPayload, AgendamentosFilter } from '../types'

export const QUERY_KEY = 'agendamentos'

export function useAgendamentos(filter?: AgendamentosFilter) {
  return useQuery({
    queryKey: [QUERY_KEY, filter],
    queryFn: () => api.list(filter),
  })
}

export function useCreateAgendamento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: AgendamentoPayload) => api.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}

export function useUpdateAgendamento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AgendamentoPayload }) =>
      api.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}

export function useDeleteAgendamento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}
