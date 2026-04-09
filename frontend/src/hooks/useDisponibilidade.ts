import { useQuery } from '@tanstack/react-query'
import { disponibilidadeApi } from '../api/disponibilidade'

export function useDisponibilidadeMes(anoMes: string) {
  return useQuery({
    queryKey: ['disponibilidade', anoMes],
    queryFn: () => disponibilidadeApi.getMes(anoMes),
    staleTime: 60_000,
  })
}
