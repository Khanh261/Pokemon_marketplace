'use client';

import { PokemonRarity } from '@/lib/types';

interface FilterBarProps {
  type: string;
  rarity: string;
  onTypeChange: (value: string) => void;
  onRarityChange: (value: string) => void;
}

const POKEMON_TYPES = ['Fire', 'Water', 'Grass', 'Electric', 'Psychic', 'Ice', 'Dragon', 'Normal', 'Fighting', 'Ghost', 'Steel'];

const selectClass =
  'px-3 py-2.5 rounded-xl bg-card-bg border border-card-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 focus:border-accent-cyan/50 backdrop-blur-sm transition-all duration-200 appearance-none cursor-pointer';

export default function FilterBar({ type, rarity, onTypeChange, onRarityChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <select
        value={type}
        onChange={(e) => onTypeChange(e.target.value)}
        className={selectClass}
      >
        <option value="">All Types</option>
        {POKEMON_TYPES.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
      <select
        value={rarity}
        onChange={(e) => onRarityChange(e.target.value)}
        className={selectClass}
      >
        <option value="">All Rarities</option>
        {Object.values(PokemonRarity).map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>
    </div>
  );
}
