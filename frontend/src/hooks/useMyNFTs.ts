'use client';

import { useQuery } from '@tanstack/react-query';
import { useWallet } from '@/context/wallet-context';
import { pokemonApi } from '@/lib/api';
import { POKEMON_KEYS } from './usePokemon';

export function useMyNFTs() {
  const { walletAddress, isConnected } = useWallet();

  const query = useQuery({
    queryKey: [...POKEMON_KEYS.all, 'my-nfts', walletAddress],
    queryFn: () => pokemonApi.getAll({ ownerAddress: walletAddress! } as any),
    enabled: isConnected && !!walletAddress,
  });

  return {
    nfts: query.data?.data ?? [],
    isLoading: query.isLoading,
  };
}
