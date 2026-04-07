import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Pokemon } from './pokemon.entity';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { PokemonQueryDto } from './dto/pokemon-query.dto';
export declare class PokemonService {
    private readonly pokemonRepository;
    private readonly configService;
    constructor(pokemonRepository: Repository<Pokemon>, configService: ConfigService);
    create(createPokemonDto: CreatePokemonDto): Promise<Pokemon>;
    findAll(query: PokemonQueryDto): Promise<{
        data: Pokemon[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<Pokemon>;
    update(id: string, updatePokemonDto: UpdatePokemonDto): Promise<Pokemon>;
    remove(id: string): Promise<void>;
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
    mintPokemon(id: string): Promise<Pokemon>;
    confirmPurchase(id: string, txHash: string, buyerAddress: string): Promise<Pokemon>;
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
}
