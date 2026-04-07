'use client';

import { PokemonRarity } from '@/lib/types';

const rarityStyles: Record<PokemonRarity, string> = {
  [PokemonRarity.COMMON]: 'bg-gray-500/20 text-gray-300 border-gray-500/40',
  [PokemonRarity.UNCOMMON]: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  [PokemonRarity.RARE]: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  [PokemonRarity.LEGENDARY]:
    'bg-gradient-to-r from-purple-500/20 to-yellow-500/20 text-yellow-300 border-yellow-500/40 animate-pulse-glow',
};

interface RarityBadgeProps {
  rarity: PokemonRarity;
  className?: string;
}

export default function RarityBadge({ rarity, className = '' }: RarityBadgeProps) {
  return (
    <span
      className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full border ${rarityStyles[rarity]} ${className}`}
    >
      {rarity === PokemonRarity.LEGENDARY && (
        <span className="mr-1">✦</span>
      )}
      {rarity}
    </span>
  );
}
