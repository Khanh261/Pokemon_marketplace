'use client';

import { useState, useCallback, useMemo } from 'react';
import { usePokemons } from '@/hooks/usePokemon';
import PokemonCard from '@/components/PokemonCard';
import SearchBar from '@/components/SearchBar';
import FilterBar from '@/components/FilterBar';
import Pagination from '@/components/Pagination';
import { PokemonRarity } from '@/lib/types';

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [rarity, setRarity] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = usePokemons({
    search: search || undefined,
    type: type || undefined,
    rarity: (rarity as PokemonRarity) || undefined,
    page,
    limit: 12,
  });

  // Derive stats from current data
  const stats = useMemo(() => {
    if (!data) return { total: 0, forSale: 0, minted: 0 };
    return {
      total: data.total,
      forSale: data.data.filter((p) => p.isForSale).length,
      minted: data.data.filter((p) => p.isMinted).length,
    };
  }, [data]);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-white/5">
        {/* Animated gradient background */}
        <div className="absolute inset-0 animate-gradient-shift opacity-40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(6,182,212,0.12),transparent_60%),radial-gradient(ellipse_at_70%_60%,rgba(139,92,246,0.10),transparent_50%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4">
            <span className="gradient-text">Pokemon NFT</span>{' '}
            <span className="text-white">Marketplace</span>
          </h1>
          <p className="text-text-secondary text-lg sm:text-xl max-w-2xl mx-auto mb-10">
            Collect, trade, and own unique Pokemon NFTs on Sepolia
          </p>

          {/* Stats row */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
            {[
              { label: 'Total Pokemon', value: stats.total, icon: '⚡' },
              { label: 'For Sale', value: stats.forSale, icon: '🏷️' },
              { label: 'Minted', value: stats.minted, icon: '💎' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="glass rounded-xl px-6 py-4 min-w-[140px] transition-shadow duration-300 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]"
              >
                <p className="text-2xl font-bold text-white">
                  {stat.icon} {stat.value}
                </p>
                <p className="text-xs text-text-muted mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1">
            <SearchBar value={search} onChange={handleSearch} />
          </div>
          <FilterBar
            type={type}
            rarity={rarity}
            onTypeChange={(v) => { setType(v); setPage(1); }}
            onRarityChange={(v) => { setRarity(v); setPage(1); }}
          />
        </div>

        {/* Loading skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl h-80 animate-pulse bg-card-bg border border-card-border"
              />
            ))}
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">⚠️</p>
            <p className="text-lg text-red-400">
              Failed to load Pokemon. Is the backend running?
            </p>
          </div>
        )}

        {/* Data loaded */}
        {data && (
          <>
            <p className="text-sm text-text-muted mb-4">
              {data.total} Pokemon found
            </p>

            {data.data.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {data.data.map((pokemon) => (
                  <PokemonCard key={pokemon.id} pokemon={pokemon} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-5xl mb-4">🔍</p>
                <p className="text-lg text-text-secondary">
                  No Pokemon found matching your criteria
                </p>
                <p className="text-sm text-text-muted mt-2">
                  Try adjusting your search or filters
                </p>
              </div>
            )}

            <Pagination
              page={page}
              total={data.total}
              limit={12}
              onPageChange={setPage}
            />
          </>
        )}
      </main>
    </div>
  );
}
