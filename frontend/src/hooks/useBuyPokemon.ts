'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useContract } from './useContract';
import { pokemonApi } from '@/lib/api';
import { useWallet } from '@/context/wallet-context';
import { POKEMON_KEYS } from './usePokemon';

interface BuyPokemonParams {
  pokemonId: string;
  tokenId: number;
  priceInWei: string;
}

export function useBuyPokemon() {
  const { contract } = useContract();
  const { walletAddress } = useWallet();
  const queryClient = useQueryClient();
  const [txHash, setTxHash] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async ({ pokemonId, tokenId, priceInWei }: BuyPokemonParams) => {
      if (!contract || !walletAddress) {
        throw new Error('Wallet not connected');
      }

      const tx = await contract.buyPokemon(tokenId, { value: priceInWei });
      setTxHash(tx.hash);

      await tx.wait();

      const pokemon = await pokemonApi.confirmPurchase(pokemonId, {
        txHash: tx.hash,
        buyerAddress: walletAddress,
      });

      return pokemon;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POKEMON_KEYS.all });
    },
    onError: () => {
      setTxHash(null);
    },
  });

  return {
    buyPokemon: mutation.mutate,
    buyPokemonAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    txHash,
  };
}
