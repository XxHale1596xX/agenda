import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usuariosApi } from '../api/usuarios'
import type { UsuarioPayload, UsuarioUpdate } from '../types'

const KEY = 'usuarios'

export function useUsuarios(busca?: string) {
  return useQuery({
    queryKey: [KEY, busca],
    queryFn: () => usuariosApi.list(busca),
  })
}

export function useCreateUsuario() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UsuarioPayload) => usuariosApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useUpdateUsuario() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UsuarioUpdate }) =>
      usuariosApi.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useDeleteUsuario() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => usuariosApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}
