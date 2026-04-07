import { PokemonRarity } from '../pokemon.entity';
export declare class PokemonQueryDto {
    search?: string;
    type?: string;
    rarity?: PokemonRarity;
    category?: string;
    page?: number;
    limit?: number;
}
