import { PokemonRarity } from '../pokemon.entity';
import type { PokemonStats } from '../pokemon.entity';
export declare class CreatePokemonDto {
    name: string;
    type: string;
    price: number;
    imageUrl?: string;
    stockQuantity?: number;
    description?: string;
    abilities?: string[];
    stats?: PokemonStats;
    rarity?: PokemonRarity;
    category?: string;
}
