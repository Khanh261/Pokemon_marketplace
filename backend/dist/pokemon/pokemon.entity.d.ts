export declare enum PokemonRarity {
    COMMON = "Common",
    UNCOMMON = "Uncommon",
    RARE = "Rare",
    LEGENDARY = "Legendary"
}
export interface PokemonStats {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
}
export declare class Pokemon {
    id: string;
    name: string;
    type: string;
    price: number;
    imageUrl: string;
    stockQuantity: number;
    description: string;
    abilities: string[];
    stats: PokemonStats;
    rarity: PokemonRarity;
    category: string;
    tokenId: number;
    priceEth: string;
    ownerAddress: string;
    isMinted: boolean;
    isForSale: boolean;
    createdAt: Date;
    updatedAt: Date;
}
