import { Repository } from 'typeorm';
import { Pokemon } from '../pokemon/pokemon.entity';
import { User } from '../auth/user.entity';
import { ConfigService } from '@nestjs/config';
export declare class SeedService {
    private pokemonRepository;
    private userRepository;
    private configService;
    constructor(pokemonRepository: Repository<Pokemon>, userRepository: Repository<User>, configService: ConfigService);
    seed(): Promise<{
        message: string;
    }>;
    private seedUsers;
    private seedPokemon;
}
