'use client';

import Link from 'next/link';
import { useWallet } from '@/context/wallet-context';
import { useMyNFTs } from '@/hooks/useMyNFTs';
import PokemonCard from '@/components/PokemonCard';

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-[var(--card-border)] bg-gray-900/80 overflow-hidden animate-pulse">
      <div className="h-52 bg-gray-800/50" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-700/50 rounded w-3/4" />
        <div className="h-4 bg-gray-700/50 rounded w-1/2" />
        <div className="h-6 bg-gray-700/50 rounded w-1/3" />
      </div>
    </div>
  );
}

export default function MyNFTsPage() {
  const { walletAddress, isConnected, connectWallet } = useWallet();
  const { nfts, isLoading } = useMyNFTs();

  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  // Not connected
  if (!isConnected) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="text-6xl">🔒</div>
          <h1 className="text-2xl font-bold text-white">Connect Your Wallet</h1>
          <p className="text-[var(--text-secondary)]">
            Connect your wallet to view your NFTs
          </p>
          <button
            onClick={connectWallet}
            className="bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-purple)] text-white px-6 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            🦊 Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold gradient-text">My NFTs</h1>
        <p className="text-[var(--text-muted)] font-mono text-sm">
          {truncateAddress(walletAddress!)}
        </p>
      </div>

      {/* Stats */}
      {!isLoading && (
        <div className="mb-8">
          <div className="glass rounded-xl px-5 py-3 inline-flex items-center gap-3">
            <span className="text-[var(--text-secondary)] text-sm">Total Owned</span>
            <span className="text-xl font-bold text-white">{nfts.length}</span>
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && nfts.length === 0 && (
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="text-center space-y-4 max-w-md">
            <div className="text-6xl">🎒</div>
            <h2 className="text-xl font-bold text-white">No NFTs Yet</h2>
            <p className="text-[var(--text-secondary)]">
              You don&apos;t own any Pokemon NFTs yet. Browse the marketplace to find your first!
            </p>
            <Link
              href="/"
              className="inline-block bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-purple)] text-white px-6 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Browse Marketplace
            </Link>
          </div>
        </div>
      )}

      {/* Grid */}
      {!isLoading && nfts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {nfts.map((pokemon) => (
            <div key={pokemon.id} className="relative">
              <div className="absolute top-2.5 left-2.5 z-10">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/30">
                  Owned
                </span>
              </div>
              <PokemonCard pokemon={pokemon} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
