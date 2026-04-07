import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { pokemonApi } from '@/lib/api';
import { PokemonQuery, CreatePokemonInput, UpdatePokemonInput } from '@/lib/types';

export const POKEMON_KEYS = {
  all: ['pokemon'] as const,
  list: (query?: PokemonQuery) => ['pokemon', 'list', query] as const,
  detail: (id: string) => ['pokemon', id] as const,
};

export function usePokemons(query?: PokemonQuery) {
  return useQuery({
    queryKey: POKEMON_KEYS.list(query),
    queryFn: () => pokemonApi.getAll(query),
  });
}

export function usePokemon(id: string) {
  return useQuery({
    queryKey: POKEMON_KEYS.detail(id),
    queryFn: () => pokemonApi.getOne(id),
    enabled: !!id,
  });
}

export function useCreatePokemon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePokemonInput) => pokemonApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: POKEMON_KEYS.all }),
  });
}

export function useUpdatePokemon(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdatePokemonInput) => pokemonApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POKEMON_KEYS.all });
      queryClient.invalidateQueries({ queryKey: POKEMON_KEYS.detail(id) });
    },
  });
}

export function useDeletePokemon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => pokemonApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: POKEMON_KEYS.all }),
  });
}

export function useMintPokemon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => pokemonApi.mint(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: POKEMON_KEYS.all });
      queryClient.invalidateQueries({ queryKey: POKEMON_KEYS.detail(id) });
    },
  });
}

export function useContractStats() {
  return useQuery({
    queryKey: [...POKEMON_KEYS.all, 'contract-stats'],
    queryFn: () => api.get('/pokemon/contract/stats').then((r) => r.data),
  });
}
