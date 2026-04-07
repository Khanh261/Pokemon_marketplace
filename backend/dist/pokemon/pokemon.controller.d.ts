import { PokemonService } from './pokemon.service';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { PokemonQueryDto } from './dto/pokemon-query.dto';
export declare class PokemonController {
    private readonly pokemonService;
    constructor(pokemonService: PokemonService);
    create(createPokemonDto: CreatePokemonDto): Promise<import("./pokemon.entity").Pokemon>;
    findAll(query: PokemonQueryDto): Promise<{
        data: import("./pokemon.entity").Pokemon[];
        total: number;
        page: number;
        limit: number;
    }>;
    getContractStats(): Promise<{
        totalMinted: number;
        commissionRate: number;
        totalCommissionEarned: string;
        tokensForSale: any;
        error?: undefined;
    } | {
        totalMinted: number;
        commissionRate: number;
        totalCommissionEarned: string;
        tokensForSale: never[];
        error: string;
    }>;
    findOne(id: string): Promise<import("./pokemon.entity").Pokemon>;
    getMetadata(id: string): Promise<{
        name: string;
        description: string;
        image: string;
        external_url: string;
        attributes: ({
            trait_type: string;
            value: string;
            display_type?: undefined;
        } | {
            trait_type: string;
            display_type: string;
            value: number;
        })[];
    }>;
    mintPokemon(id: string): Promise<import("./pokemon.entity").Pokemon>;
    confirmPurchase(id: string, body: {
        txHash: string;
        buyerAddress: string;
    }): Promise<import("./pokemon.entity").Pokemon>;
    update(id: string, updatePokemonDto: UpdatePokemonDto): Promise<import("./pokemon.entity").Pokemon>;
    remove(id: string): Promise<void>;
}
