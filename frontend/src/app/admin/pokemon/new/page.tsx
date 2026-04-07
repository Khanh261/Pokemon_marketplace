'use client';

import { useRouter } from 'next/navigation';
import { useCreatePokemon, useMintPokemon } from '@/hooks/usePokemon';
import { useWallet } from '@/context/wallet-context';
import { useEffect, useState } from 'react';
import PokemonForm from '@/components/PokemonForm';
import Link from 'next/link';
import { CreatePokemonInput, Pokemon } from '@/lib/types';

export default function NewPokemonPage() {
  const router = useRouter();
  const { isAdmin, isLoading } = useWallet();
  const createMutation = useCreatePokemon();
  const mintMutation = useMintPokemon();
  const [createdPokemon, setCreatedPokemon] = useState<Pokemon | null>(null);

  useEffect(() => {
    if (!isLoading && !isAdmin) router.push('/');
  }, [isAdmin, isLoading, router]);

  const handleSubmit = async (data: CreatePokemonInput) => {
    const pokemon = await createMutation.mutateAsync(data);
    setCreatedPokemon(pokemon);
  };

  const handleMint = async () => {
    if (!createdPokemon) return;
    await mintMutation.mutateAsync(createdPokemon.id);
  };

  if (isLoading) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <div className="animate-spin text-4xl">⚡</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Link href="/admin" className="text-purple-400 hover:text-purple-300 mb-6 block">← Back to dashboard</Link>

        <div className="bg-gray-800/60 backdrop-blur-md border border-gray-700 rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-100 mb-6">Add New Pokemon</h1>

          {createMutation.error && (
            <div className="bg-red-900/40 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-4 text-sm">
              {(createMutation.error as any).response?.data?.message || 'Failed to create Pokemon'}
            </div>
          )}

          {createdPokemon ? (
            <div className="space-y-4">
              <div className="bg-green-900/40 border border-green-700 text-green-300 px-4 py-3 rounded-lg text-sm">
                ✅ <strong>{createdPokemon.name}</strong> created successfully!
              </div>

              {/* Mint NFT section */}
              <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 space-y-3">
                <h2 className="text-lg font-semibold text-gray-200">Mint as NFT</h2>

                {mintMutation.isSuccess && (
                  <div className="bg-green-900/40 border border-green-700 text-green-300 px-4 py-3 rounded-lg text-sm">
                    🎉 Minted successfully! Token ID: <strong>{(mintMutation.data as any)?.tokenId ?? 'N/A'}</strong>
                  </div>
                )}

                {mintMutation.isError && (
                  <div className="bg-red-900/40 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">
                    ❌ {(mintMutation.error as any)?.response?.data?.message || 'Minting failed. Try again.'}
                  </div>
                )}

                <button
                  onClick={handleMint}
                  disabled={mintMutation.isPending || mintMutation.isSuccess}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {mintMutation.isPending && <span className="animate-spin">⏳</span>}
                  {mintMutation.isPending ? 'Minting...' : mintMutation.isSuccess ? 'Minted ✓' : '🔮 Mint NFT'}
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => router.push(`/pokemon/${createdPokemon.id}`)}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors font-semibold"
                >
                  View Pokemon
                </button>
                <button
                  onClick={() => { setCreatedPokemon(null); createMutation.reset(); mintMutation.reset(); }}
                  className="flex-1 bg-gray-700 text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors font-semibold"
                >
                  Create Another
                </button>
              </div>
            </div>
          ) : (
            <PokemonForm
              onSubmit={handleSubmit}
              isLoading={createMutation.isPending}
              submitLabel="Create Pokemon"
            />
          )}
        </div>
      </div>
    </div>
  );
}
