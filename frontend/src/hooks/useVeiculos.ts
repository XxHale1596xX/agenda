import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { veiculosApi } from '../api/veiculos'
import type { VeiculoPayload, VeiculoUpdate } from '../types'

export function useVeiculos(busca?: string, ativo?: boolean) {
  return useQuery({
    queryKey: ['veiculos', busca, ativo],
    queryFn: () => veiculosApi.list(busca, ativo),
    staleTime: 30_000,
  })
}

export function useCreateVeiculo(adminToken: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: VeiculoPayload) => veiculosApi.create(payload, adminToken),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['veiculos'] }),
  })
}

export function useUpdateVeiculo(adminToken: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: VeiculoUpdate }) =>
      veiculosApi.update(id, payload, adminToken),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['veiculos'] }),
  })
}

export function useDeleteVeiculo(adminToken: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => veiculosApi.delete(id, adminToken),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['veiculos'] }),
  })
}
