import { useMutation, useQueryClient } from '@tanstack/react-query'
import { bloqueiosApi } from '../api/bloqueios'
import type { BloqueioPayload } from '../types'

export function useCreateBloqueio(adminToken: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: BloqueioPayload) => bloqueiosApi.create(payload, adminToken),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['disponibilidade'] })
    },
  })
}

export function useDeleteBloqueio(adminToken: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => bloqueiosApi.delete(id, adminToken),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['disponibilidade'] })
    },
  })
}
