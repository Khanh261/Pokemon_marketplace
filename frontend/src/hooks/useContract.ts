'use client';

import { useMemo } from 'react';
import { Contract } from 'ethers';
import { useWallet } from '@/context/wallet-context';
import { getContract } from '@/lib/contract';

export function useContract(): { contract: Contract | null; isReady: boolean } {
  const { signer, isConnected, isCorrectNetwork } = useWallet();

  const contract = useMemo(() => {
    if (!signer || !isConnected || !isCorrectNetwork) return null;
    return getContract(signer);
  }, [signer, isConnected, isCorrectNetwork]);

  return { contract, isReady: contract !== null };
}
