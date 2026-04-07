'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePokemon, useUpdatePokemon, useMintPokemon } from '@/hooks/usePokemon';
import { useWallet } from '@/context/wallet-context';
import PokemonForm from '@/components/PokemonForm';
import Link from 'next/link';
import { CreatePokemonInput } from '@/lib/types';

export default function EditPokemonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { isAdmin, isLoading: authLoading } = useWallet();
  const { data: pokemon, isLoading: pokemonLoading } = usePokemon(id);
  const updateMutation = useUpdatePokemon(id);
  const mintMutation = useMintPokemon();

  useEffect(() => {
    if (!authLoading && !isAdmin) router.push('/');
  }, [isAdmin, authLoading, router]);

  const handleSubmit = async (data: CreatePokemonInput) => {
    await updateMutation.mutateAsync(data);
    router.push(`/pokemon/${id}`);
  };

  const handleMint = async () => {
    await mintMutation.mutateAsync(id);
  };

  if (authLoading || pokemonLoading) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <div className="animate-spin text-4xl">⚡</div>
    </div>
  );

  if (!pokemon) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center py-16 text-red-400">Pokemon not found.</div>
    </div>
  );

  const isMinted = pokemon.isMinted || mintMutation.isSuccess;

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Link href={`/pokemon/${id}`} className="text-purple-400 hover:text-purple-300 mb-6 block">← Back to {pokemon.name}</Link>

        <div className="bg-gray-800/60 backdrop-blur-md border border-gray-700 rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-100 mb-6">Edit {pokemon.name}</h1>

          {/* Mint status section */}
          <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 mb-6 space-y-3">
            <h2 className="text-lg font-semibold text-gray-200">NFT Status</h2>

            {isMinted ? (
              <div className="bg-green-900/40 border border-green-700 text-green-300 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <span>Already Minted ✓</span>
                {pokemon.tokenId != null && (
                  <span className="ml-auto bg-green-800/60 px-2 py-1 rounded text-xs font-mono">
                    Token ID: {pokemon.tokenId}
                  </span>
                )}
                {mintMutation.isSuccess && (mintMutation.data as any)?.tokenId != null && (
                  <span className="ml-auto bg-green-800/60 px-2 py-1 rounded text-xs font-mono">
                    Token ID: {(mintMutation.data as any).tokenId}
                  </span>
                )}
              </div>
            ) : (
              <>
                {mintMutation.isError && (
                  <div className="bg-red-900/40 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">
                    ❌ {(mintMutation.error as any)?.response?.data?.message || 'Minting failed.'}
                  </div>
                )}
                <button
                  onClick={handleMint}
                  disabled={mintMutation.isPending}
                  className="w-full bg-purple-600 text-white py-2.5 px-4 rounded-lg hover:bg-purple-700 transition-colors font-semibold disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
                >
                  {mintMutation.isPending && <span className="animate-spin">⏳</span>}
                  {mintMutation.isPending ? 'Minting...' : mintMutation.isError ? '🔄 Retry Mint' : '🔮 Mint as NFT'}
                </button>
              </>
            )}
          </div>

          {updateMutation.error && (
            <div className="bg-red-900/40 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-4 text-sm">
              {(updateMutation.error as any).response?.data?.message || 'Failed to update Pokemon'}
            </div>
          )}

          <PokemonForm
            defaultValues={{
              name: pokemon.name,
              type: pokemon.type,
              price: pokemon.price,
              priceEth: pokemon.priceEth,
              imageUrl: pokemon.imageUrl,
              stockQuantity: pokemon.stockQuantity,
              description: pokemon.description,
              abilities: pokemon.abilities?.join(', '),
              rarity: pokemon.rarity,
              category: pokemon.category,
            }}
            onSubmit={handleSubmit}
            isLoading={updateMutation.isPending}
            submitLabel="Update Pokemon"
          />
        </div>
      </div>
    </div>
  );
}
