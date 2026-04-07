'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Pokemon, PokemonRarity } from '@/lib/types';
import RarityBadge from './RarityBadge';

const rarityGlow: Record<PokemonRarity, string> = {
  [PokemonRarity.COMMON]: 'border-gray-500/40 hover:shadow-[0_0_25px_rgba(107,114,128,0.4)]',
  [PokemonRarity.UNCOMMON]: 'border-emerald-500/40 hover:shadow-[0_0_25px_rgba(16,185,129,0.4)]',
  [PokemonRarity.RARE]: 'border-blue-500/40 hover:shadow-[0_0_25px_rgba(59,130,246,0.4)]',
  [PokemonRarity.LEGENDARY]:
    'border-yellow-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)] hover:shadow-[0_0_30px_rgba(234,179,8,0.4),0_0_60px_rgba(168,85,247,0.2)]',
};

const typeColors: Record<string, string> = {
  Electric: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
  Fire: 'bg-red-500/20 text-red-300 border-red-500/40',
  Water: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  Grass: 'bg-green-500/20 text-green-300 border-green-500/40',
  Psychic: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
  Ice: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
  Dragon: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
  Dark: 'bg-gray-700/40 text-gray-300 border-gray-500/40',
  Fairy: 'bg-pink-400/20 text-pink-300 border-pink-400/40',
  Fighting: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
  Poison: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  Ground: 'bg-amber-600/20 text-amber-300 border-amber-600/40',
  Flying: 'bg-sky-400/20 text-sky-300 border-sky-400/40',
  Bug: 'bg-lime-500/20 text-lime-300 border-lime-500/40',
  Rock: 'bg-stone-500/20 text-stone-300 border-stone-500/40',
  Ghost: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
  Steel: 'bg-slate-400/20 text-slate-300 border-slate-400/40',
  Normal: 'bg-gray-400/20 text-gray-300 border-gray-400/40',
};

function getStatusBadge(pokemon: Pokemon) {
  if (!pokemon.isMinted) {
    return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400 border border-gray-500/30">Not Minted</span>;
  }
  if (pokemon.isForSale) {
    return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">For Sale</span>;
  }
  return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">Sold</span>;
}

interface PokemonCardProps {
  pokemon: Pokemon;
}

export default function PokemonCard({ pokemon }: PokemonCardProps) {
  const typeStyle = typeColors[pokemon.type] ?? 'bg-gray-500/20 text-gray-300 border-gray-500/40';

  return (
    <Link href={`/pokemon/${pokemon.id}`} className="block">
      <motion.div
        whileHover={{ scale: 1.03, y: -4 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={`relative rounded-2xl border bg-gray-900/80 backdrop-blur-xl overflow-hidden cursor-pointer transition-shadow duration-300 ${rarityGlow[pokemon.rarity]}`}
      >
        {/* Image Section */}
        <div className="relative h-52 bg-gray-800/50 flex items-center justify-center p-4">
          {pokemon.imageUrl ? (
            <img
              src={pokemon.imageUrl}
              alt={pokemon.name}
              className="h-full w-full object-contain drop-shadow-[0_0_12px_rgba(255,255,255,0.1)]"
            />
          ) : (
            <div className="text-6xl opacity-60">⚡</div>
          )}

          {/* Dark overlay gradient */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-gray-900/90 to-transparent" />

          {/* Rarity badge — top right */}
          <div className="absolute top-2.5 right-2.5">
            <RarityBadge rarity={pokemon.rarity} />
          </div>

          {/* Status badge — top left */}
          <div className="absolute top-2.5 left-2.5">
            {getStatusBadge(pokemon)}
          </div>
        </div>

        {/* Info Section */}
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-lg text-white truncate">{pokemon.name}</h3>
            {pokemon.tokenId != null && (
              <span className="text-[10px] text-text-muted font-mono shrink-0">
                #{pokemon.tokenId}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${typeStyle}`}>
              {pokemon.type}
            </span>
            {pokemon.category && (
              <span className="text-[11px] text-text-secondary">{pokemon.category}</span>
            )}
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-white/5">
            <span className="text-xl font-bold text-white tracking-tight">
              Ξ {pokemon.priceEth}
            </span>
            <span className="text-xs text-text-muted">
              ${Number(pokemon.price).toFixed(2)}
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
