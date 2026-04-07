'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePokemon, useDeletePokemon, useMintPokemon } from '@/hooks/usePokemon';
import { useBuyPokemon } from '@/hooks/useBuyPokemon';
import { useWallet } from '@/context/wallet-context';
import DeleteModal from '@/components/DeleteModal';
import RarityBadge from '@/components/RarityBadge';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { parseEther } from 'ethers';

const TYPE_COLORS: Record<string, string> = {
  Fire: 'bg-orange-500/20 text-orange-300 border-orange-500/50',
  Water: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
  Grass: 'bg-green-500/20 text-green-300 border-green-500/50',
  Electric: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
  Psychic: 'bg-pink-500/20 text-pink-300 border-pink-500/50',
  Ice: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50',
  Dragon: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50',
  Dark: 'bg-gray-600/20 text-gray-300 border-gray-500/50',
  Fairy: 'bg-pink-400/20 text-pink-300 border-pink-400/50',
  Fighting: 'bg-red-600/20 text-red-300 border-red-500/50',
  Poison: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
  Ground: 'bg-amber-600/20 text-amber-300 border-amber-500/50',
  Flying: 'bg-sky-400/20 text-sky-300 border-sky-400/50',
  Bug: 'bg-lime-500/20 text-lime-300 border-lime-500/50',
  Rock: 'bg-stone-500/20 text-stone-300 border-stone-500/50',
  Ghost: 'bg-violet-500/20 text-violet-300 border-violet-500/50',
  Steel: 'bg-slate-400/20 text-slate-300 border-slate-400/50',
  Normal: 'bg-gray-400/20 text-gray-300 border-gray-400/50',
};

const STAT_COLORS: Record<string, string> = {
  hp: 'bg-red-500',
  attack: 'bg-orange-500',
  defense: 'bg-blue-500',
  speed: 'bg-green-500',
};

const STAT_MAX = 255;

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';

function truncateAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function SkeletonLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass rounded-3xl max-w-5xl w-full p-8 animate-pulse">
        <div className="h-6 w-32 bg-white/10 rounded mb-8" />
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/2 aspect-square bg-white/5 rounded-2xl" />
          <div className="lg:w-1/2 space-y-4">
            <div className="h-10 w-3/4 bg-white/10 rounded" />
            <div className="flex gap-2">
              <div className="h-6 w-20 bg-white/10 rounded-full" />
              <div className="h-6 w-20 bg-white/10 rounded-full" />
            </div>
            <div className="h-4 w-full bg-white/5 rounded" />
            <div className="h-4 w-5/6 bg-white/5 rounded" />
            <div className="space-y-3 mt-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-5 bg-white/5 rounded-full" />
              ))}
            </div>
            <div className="h-12 w-full bg-white/10 rounded-xl mt-6" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PokemonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { isAdmin, isConnected, walletAddress, connectWallet } = useWallet();
  const { data: pokemon, isLoading, error, refetch } = usePokemon(id);
  const deleteMutation = useDeletePokemon();
  const mintMutation = useMintPokemon();
  const { buyPokemon, isPending: isBuying, isSuccess: buySuccess, isError: buyError, error: buyErrorMsg } = useBuyPokemon();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [statsAnimated, setStatsAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStatsAnimated(true), 300);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <SkeletonLoader />;

  if (error || !pokemon) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-3xl p-12 text-center max-w-md"
        >
          <div className="text-6xl mb-4">😿</div>
          <h2 className="text-2xl font-bold text-white mb-2">Pokemon Not Found</h2>
          <p className="text-text-secondary mb-6">
            {error instanceof Error ? error.message : 'Something went wrong loading this Pokemon.'}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => refetch()}
              className="px-6 py-2.5 rounded-xl bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30 hover:bg-accent-cyan/30 transition-colors font-medium"
            >
              Retry
            </button>
            <Link
              href="/"
              className="px-6 py-2.5 rounded-xl bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-colors font-medium"
            >
              Back to Store
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(id);
    router.push('/');
  };

  const handleMint = async () => {
    await mintMutation.mutateAsync(id);
  };

  const handleBuy = () => {
    if (pokemon.tokenId == null) return;
    buyPokemon({
      pokemonId: pokemon.id,
      tokenId: pokemon.tokenId,
      priceInWei: parseEther(pokemon.priceEth).toString(),
    });
  };

  const isOwner = walletAddress && pokemon.ownerAddress
    ? walletAddress.toLowerCase() === pokemon.ownerAddress.toLowerCase()
    : false;
  const canBuy = pokemon.isForSale && pokemon.isMinted && isConnected && !isOwner;
  const typeStyle = TYPE_COLORS[pokemon.type] || TYPE_COLORS.Normal;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Back button */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 text-text-secondary hover:text-white transition-colors mb-6 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            <span>Back to Store</span>
          </button>
        </motion.div>

        {/* Main card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="glass rounded-3xl overflow-hidden"
        >
          <div className="flex flex-col lg:flex-row">
            {/* Image section */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:w-1/2 bg-white/[0.02] flex items-center justify-center p-8 md:p-12 min-h-[300px] lg:min-h-[500px] relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/5 via-transparent to-accent-purple/5" />
              {pokemon.imageUrl ? (
                <img
                  src={pokemon.imageUrl}
                  alt={pokemon.name}
                  className="relative z-10 max-h-80 lg:max-h-96 object-contain drop-shadow-2xl animate-float"
                />
              ) : (
                <div className="relative z-10 text-9xl animate-float">⚡</div>
              )}
            </motion.div>

            {/* Details panel */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="lg:w-1/2 p-6 md:p-8 lg:p-10 flex flex-col"
            >
              {/* Name */}
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">{pokemon.name}</h1>

              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <RarityBadge rarity={pokemon.rarity} />
                <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full border ${typeStyle}`}>
                  {pokemon.type}
                </span>
              </div>

              {/* Description */}
              {pokemon.description && (
                <p className="text-text-secondary text-sm leading-relaxed mb-5">{pokemon.description}</p>
              )}

              {/* Stats bars */}
              {pokemon.stats && (
                <div className="mb-5">
                  <h3 className="text-xs uppercase tracking-wider text-text-muted font-semibold mb-3">Base Stats</h3>
                  <div className="space-y-2.5">
                    {(Object.entries(pokemon.stats) as [string, number][]).map(([stat, value]) => (
                      <div key={stat} className="flex items-center gap-3">
                        <span className="text-xs text-text-secondary capitalize w-16 shrink-0">{stat}</span>
                        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${STAT_COLORS[stat] || 'bg-accent-cyan'} transition-all duration-1000 ease-out`}
                            style={{ width: statsAnimated ? `${(value / STAT_MAX) * 100}%` : '0%' }}
                          />
                        </div>
                        <span className="text-xs font-mono text-white w-8 text-right">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Abilities */}
              {pokemon.abilities && pokemon.abilities.length > 0 && (
                <div className="mb-5">
                  <h3 className="text-xs uppercase tracking-wider text-text-muted font-semibold mb-2">Abilities</h3>
                  <div className="flex flex-wrap gap-2">
                    {pokemon.abilities.map((ability) => (
                      <span
                        key={ability}
                        className="px-3 py-1 text-xs font-medium rounded-full bg-accent-purple/15 text-purple-300 border border-purple-500/20"
                      >
                        {ability}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Price */}
              <div className="mb-4">
                <h3 className="text-xs uppercase tracking-wider text-text-muted font-semibold mb-1">Price</h3>
                <p className="text-3xl font-bold text-white">
                  Ξ {pokemon.priceEth}
                  <span className="text-sm text-text-secondary ml-2 font-normal">ETH</span>
                </p>
              </div>

              {/* Token ID & Owner */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 mb-6 text-sm">
                {pokemon.isMinted && pokemon.tokenId !== undefined && (
                  <div>
                    <span className="text-text-muted">Token: </span>
                    <a
                      href={`https://sepolia.etherscan.io/token/${CONTRACT_ADDRESS}?a=${pokemon.tokenId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-cyan hover:underline font-mono"
                    >
                      #{pokemon.tokenId}
                    </a>
                  </div>
                )}
                {pokemon.ownerAddress && (
                  <div>
                    <span className="text-text-muted">Owner: </span>
                    <span className="text-white font-mono">{truncateAddress(pokemon.ownerAddress)}</span>
                  </div>
                )}
              </div>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Buy / Connect button */}
              <div className="space-y-3">
                {!isConnected ? (
                  <button
                    onClick={connectWallet}
                    className="w-full py-3 rounded-xl font-semibold text-sm bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30 hover:bg-accent-cyan/30 transition-all"
                  >
                    Connect Wallet to Buy
                  </button>
                ) : isOwner ? (
                  <div className="w-full py-3 rounded-xl font-semibold text-sm text-center bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20">
                    ✓ You Own This
                  </div>
                ) : canBuy ? (
                  buySuccess ? (
                    <div className="w-full py-3 rounded-xl font-semibold text-sm text-center bg-green-500/20 text-green-300 border border-green-500/30">
                      ✓ Purchased!
                    </div>
                  ) : buyError ? (
                    <button
                      onClick={handleBuy}
                      className="w-full py-3 rounded-xl font-semibold text-sm bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 transition-all"
                    >
                      Error — Retry Purchase
                    </button>
                  ) : (
                    <button
                      onClick={handleBuy}
                      disabled={isBuying}
                      className="w-full py-3 rounded-xl font-semibold text-sm bg-accent-emerald/80 text-white hover:bg-accent-emerald transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isBuying ? (
                        <>
                          <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Buying…
                        </>
                      ) : (
                        `Buy Now — Ξ ${pokemon.priceEth}`
                      )}
                    </button>
                  )
                ) : isConnected && !pokemon.isMinted ? (
                  <div className="w-full py-3 rounded-xl font-semibold text-sm text-center bg-gray-500/10 text-gray-400 border border-gray-500/20">
                    ⏳ Not Minted Yet
                  </div>
                ) : isConnected && !pokemon.isForSale ? (
                  <div className="w-full py-3 rounded-xl font-semibold text-sm text-center bg-gray-500/10 text-gray-400 border border-gray-500/20">
                    Not For Sale
                  </div>
                ) : null}

                {/* Admin actions */}
                {isAdmin && (
                  <div className="flex gap-2 pt-1">
                    <Link
                      href={`/admin/pokemon/${id}/edit`}
                      className="flex-1 text-center py-2.5 rounded-xl text-sm font-medium bg-blue-500/15 text-blue-300 border border-blue-500/25 hover:bg-blue-500/25 transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-red-500/15 text-red-300 border border-red-500/25 hover:bg-red-500/25 transition-colors"
                    >
                      Delete
                    </button>
                    {!pokemon.isMinted && (
                      <button
                        onClick={handleMint}
                        disabled={mintMutation.isPending}
                        className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-accent-yellow/15 text-yellow-300 border border-yellow-500/25 hover:bg-accent-yellow/25 transition-colors disabled:opacity-50"
                      >
                        {mintMutation.isPending ? 'Minting…' : 'Mint NFT'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {showDeleteModal && (
        <DeleteModal
          pokemonName={pokemon.name}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
