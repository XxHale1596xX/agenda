import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { instrutoresApi } from '../api/instrutores'
import type { InstrutorPayload, InstrutorUpdate } from '../types'

export function useInstrutores(busca?: string, ativo?: boolean) {
  return useQuery({
    queryKey: ['instrutores', busca, ativo],
    queryFn: () => instrutoresApi.list(busca, ativo),
    staleTime: 30_000,
  })
}

export function useCreateInstrutor(adminToken: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: InstrutorPayload) => instrutoresApi.create(payload, adminToken),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['instrutores'] }),
  })
}

export function useUpdateInstrutor(adminToken: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: InstrutorUpdate }) =>
      instrutoresApi.update(id, payload, adminToken),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['instrutores'] }),
  })
}

export function useDeleteInstrutor(adminToken: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => instrutoresApi.delete(id, adminToken),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['instrutores'] }),
  })
}
