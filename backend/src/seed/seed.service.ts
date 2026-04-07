import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pokemon, PokemonRarity } from '../pokemon/pokemon.entity';
import { User, UserRole } from '../auth/user.entity';
import { ConfigService } from '@nestjs/config';

const RARITY_PRICE_MAP: Record<PokemonRarity, string> = {
  [PokemonRarity.COMMON]: '0.001',
  [PokemonRarity.UNCOMMON]: '0.003',
  [PokemonRarity.RARE]: '0.006',
  [PokemonRarity.LEGENDARY]: '0.01',
};

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Pokemon)
    private pokemonRepository: Repository<Pokemon>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
  ) {}

  async seed(): Promise<{ message: string }> {
    await this.seedUsers();
    await this.seedPokemon();
    console.log('✅ Seeding complete!');
    return { message: 'Seeding complete!' };
  }

  private async seedUsers(): Promise<void> {
    const ownerAddress = this.configService.get<string>('OWNER_ADDRESS', '').toLowerCase();
    if (!ownerAddress) {
      console.log('⚠️ OWNER_ADDRESS not set, skipping admin seed');
      return;
    }
    const adminExists = await this.userRepository.findOne({
      where: { walletAddress: ownerAddress },
    });
    if (!adminExists) {
      const admin = this.userRepository.create({
        walletAddress: ownerAddress,
        name: 'Admin',
        role: UserRole.ADMIN,
      });
      await this.userRepository.save(admin);
      console.log(`✅ Admin user created with wallet: ${ownerAddress}`);
    }
  }

  private async seedPokemon(): Promise<void> {
    const count = await this.pokemonRepository.count();
    if (count > 0) {
      console.log('Pokemon already seeded, skipping...');
      return;
    }

    const pokemonData = [
      { name: 'Pikachu', type: 'Electric', price: 9.99, rarity: PokemonRarity.COMMON, category: 'Mouse Pokemon', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png', stockQuantity: 50, description: 'An Electric-type Pokemon known for its thunderbolt attacks.', abilities: ['Static', 'Lightning Rod'], stats: { hp: 35, attack: 55, defense: 40, speed: 90 } },
      { name: 'Charizard', type: 'Fire/Flying', price: 49.99, rarity: PokemonRarity.RARE, category: 'Flame Pokemon', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png', stockQuantity: 10, description: 'A fearsome Fire/Flying-type Pokemon with immense power.', abilities: ['Blaze', 'Solar Power'], stats: { hp: 78, attack: 84, defense: 78, speed: 100 } },
      { name: 'Bulbasaur', type: 'Grass/Poison', price: 7.99, rarity: PokemonRarity.COMMON, category: 'Seed Pokemon', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png', stockQuantity: 45, description: 'A dual Grass/Poison-type starter Pokemon.', abilities: ['Overgrow', 'Chlorophyll'], stats: { hp: 45, attack: 49, defense: 49, speed: 45 } },
      { name: 'Squirtle', type: 'Water', price: 7.99, rarity: PokemonRarity.COMMON, category: 'Tiny Turtle Pokemon', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png', stockQuantity: 45, description: 'A Water-type starter Pokemon with a hard shell.', abilities: ['Torrent', 'Rain Dish'], stats: { hp: 44, attack: 48, defense: 65, speed: 43 } },
      { name: 'Mewtwo', type: 'Psychic', price: 99.99, rarity: PokemonRarity.LEGENDARY, category: 'Genetic Pokemon', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png', stockQuantity: 2, description: 'A legendary Psychic-type Pokemon created through genetic engineering.', abilities: ['Pressure', 'Unnerve'], stats: { hp: 106, attack: 110, defense: 90, speed: 130 } },
      { name: 'Gengar', type: 'Ghost/Poison', price: 34.99, rarity: PokemonRarity.RARE, category: 'Shadow Pokemon', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png', stockQuantity: 12, description: 'A mischievous Ghost/Poison-type Pokemon that hides in shadows.', abilities: ['Cursed Body'], stats: { hp: 60, attack: 65, defense: 60, speed: 110 } },
      { name: 'Eevee', type: 'Normal', price: 19.99, rarity: PokemonRarity.UNCOMMON, category: 'Evolution Pokemon', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png', stockQuantity: 25, description: 'A Normal-type Pokemon with the potential to evolve into many forms.', abilities: ['Run Away', 'Adaptability'], stats: { hp: 55, attack: 55, defense: 50, speed: 55 } },
      { name: 'Snorlax', type: 'Normal', price: 24.99, rarity: PokemonRarity.UNCOMMON, category: 'Sleeping Pokemon', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/143.png', stockQuantity: 20, description: 'A massive Normal-type Pokemon that loves to eat and sleep.', abilities: ['Immunity', 'Thick Fat'], stats: { hp: 160, attack: 110, defense: 65, speed: 30 } },
      { name: 'Dragonite', type: 'Dragon/Flying', price: 59.99, rarity: PokemonRarity.RARE, category: 'Dragon Pokemon', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/149.png', stockQuantity: 8, description: 'A friendly Dragon/Flying-type Pokemon known for its incredible speed.', abilities: ['Inner Focus', 'Multiscale'], stats: { hp: 91, attack: 134, defense: 95, speed: 80 } },
      { name: 'Alakazam', type: 'Psychic', price: 29.99, rarity: PokemonRarity.RARE, category: 'Psi Pokemon', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/65.png', stockQuantity: 15, description: 'A highly intelligent Psychic-type Pokemon with a remarkably high IQ.', abilities: ['Synchronize', 'Inner Focus'], stats: { hp: 55, attack: 50, defense: 45, speed: 120 } },
      { name: 'Machamp', type: 'Fighting', price: 22.99, rarity: PokemonRarity.UNCOMMON, category: 'Superpower Pokemon', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/68.png', stockQuantity: 18, description: 'A powerful Fighting-type Pokemon with four muscular arms.', abilities: ['Guts', 'No Guard'], stats: { hp: 90, attack: 130, defense: 80, speed: 55 } },
      { name: 'Articuno', type: 'Ice/Flying', price: 79.99, rarity: PokemonRarity.LEGENDARY, category: 'Freeze Pokemon', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/144.png', stockQuantity: 3, description: 'A legendary Ice/Flying-type Pokemon said to appear to doomed travelers.', abilities: ['Pressure', 'Snow Cloak'], stats: { hp: 90, attack: 85, defense: 100, speed: 85 } },
      { name: 'Zapdos', type: 'Electric/Flying', price: 79.99, rarity: PokemonRarity.LEGENDARY, category: 'Electric Pokemon', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/145.png', stockQuantity: 3, description: 'A legendary Electric/Flying-type Pokemon that crackles with electricity.', abilities: ['Pressure', 'Static'], stats: { hp: 90, attack: 90, defense: 85, speed: 100 } },
      { name: 'Moltres', type: 'Fire/Flying', price: 79.99, rarity: PokemonRarity.LEGENDARY, category: 'Flame Pokemon', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/146.png', stockQuantity: 3, description: 'A legendary Fire/Flying-type Pokemon that leaves a trail of flames.', abilities: ['Pressure', 'Flame Body'], stats: { hp: 90, attack: 100, defense: 90, speed: 90 } },
      { name: 'Jigglypuff', type: 'Normal/Fairy', price: 12.99, rarity: PokemonRarity.COMMON, category: 'Balloon Pokemon', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/39.png', stockQuantity: 40, description: 'A cute Normal/Fairy-type Pokemon famous for its sleep-inducing lullaby.', abilities: ['Cute Charm', 'Competitive'], stats: { hp: 115, attack: 45, defense: 20, speed: 20 } },
      { name: 'Vaporeon', type: 'Water', price: 27.99, rarity: PokemonRarity.UNCOMMON, category: 'Bubble Jet Pokemon', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/134.png', stockQuantity: 22, description: 'A Water-type Eeveelution that can melt into water undetected.', abilities: ['Water Absorb', 'Hydration'], stats: { hp: 130, attack: 65, defense: 60, speed: 65 } },
      { name: 'Flareon', type: 'Fire', price: 27.99, rarity: PokemonRarity.UNCOMMON, category: 'Flame Pokemon', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/136.png', stockQuantity: 22, description: 'A Fire-type Eeveelution with a blazing internal temperature.', abilities: ['Flash Fire', 'Guts'], stats: { hp: 65, attack: 130, defense: 60, speed: 65 } },
      { name: 'Lapras', type: 'Water/Ice', price: 32.99, rarity: PokemonRarity.RARE, category: 'Transport Pokemon', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/131.png', stockQuantity: 14, description: 'A gentle Water/Ice-type Pokemon that ferries people across the sea.', abilities: ['Water Absorb', 'Shell Armor'], stats: { hp: 130, attack: 85, defense: 80, speed: 60 } },
      { name: 'Ditto', type: 'Normal', price: 15.99, rarity: PokemonRarity.UNCOMMON, category: 'Transform Pokemon', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/132.png', stockQuantity: 30, description: 'A unique Normal-type Pokemon that can transform into any other Pokemon.', abilities: ['Limber', 'Imposter'], stats: { hp: 48, attack: 48, defense: 48, speed: 48 } },
      { name: 'Lucario', type: 'Fighting/Steel', price: 39.99, rarity: PokemonRarity.RARE, category: 'Aura Pokemon', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/448.png', stockQuantity: 11, description: 'A Fighting/Steel-type Pokemon that can sense and manipulate aura.', abilities: ['Steadfast', 'Inner Focus'], stats: { hp: 70, attack: 110, defense: 70, speed: 90 } },
    ];

    for (const data of pokemonData) {
      const pokemon = this.pokemonRepository.create({
        ...data,
        priceEth: RARITY_PRICE_MAP[data.rarity],
      });
      await this.pokemonRepository.save(pokemon);
    }

    console.log(`✅ Seeded ${pokemonData.length} Pokemon with ETH pricing`);
  }
}
