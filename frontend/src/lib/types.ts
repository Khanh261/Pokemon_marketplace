export enum PokemonRarity {
  COMMON = 'Common',
  UNCOMMON = 'Uncommon',
  RARE = 'Rare',
  LEGENDARY = 'Legendary',
}

export interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
}

export interface Pokemon {
  id: string;
  name: string;
  type: string;
  price: number;
  imageUrl?: string;
  stockQuantity: number;
  description?: string;
  abilities?: string[];
  stats?: PokemonStats;
  rarity: PokemonRarity;
  category?: string;
  tokenId?: number;
  priceEth: string;
  ownerAddress?: string;
  isMinted: boolean;
  isForSale: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface User {
  id: string;
  name: string;
  walletAddress: string;
  role: 'Admin' | 'User';
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface PokemonQuery {
  search?: string;
  type?: string;
  rarity?: PokemonRarity;
  category?: string;
  page?: number;
  limit?: number;
}

export interface CreatePokemonInput {
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
  priceEth?: string;
}

export type UpdatePokemonInput = Partial<CreatePokemonInput>;

export const RARITY_PRICE_MAP: Record<PokemonRarity, string> = {
  [PokemonRarity.COMMON]: '0.001',
  [PokemonRarity.UNCOMMON]: '0.003',
  [PokemonRarity.RARE]: '0.006',
  [PokemonRarity.LEGENDARY]: '0.01',
};

export const OWNER_ADDRESS = '0x0466408257b63D3E50C00BACF2cfF4bcD11aD33D';
export const SEPOLIA_CHAIN_ID = 11155111;
