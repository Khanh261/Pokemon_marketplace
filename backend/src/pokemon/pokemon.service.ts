import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { Pokemon } from './pokemon.entity';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { PokemonQueryDto } from './dto/pokemon-query.dto';
import { getContract, getReadOnlyContract, getProvider } from './contract.config';

@Injectable()
export class PokemonService {
  constructor(
    @InjectRepository(Pokemon)
    private readonly pokemonRepository: Repository<Pokemon>,
    private readonly configService: ConfigService,
  ) {}

  async create(createPokemonDto: CreatePokemonDto): Promise<Pokemon> {
    const existing = await this.pokemonRepository.findOne({
      where: { name: createPokemonDto.name },
    });
    if (existing) {
      throw new ConflictException(`Pokemon "${createPokemonDto.name}" already exists`);
    }
    const pokemon = this.pokemonRepository.create(createPokemonDto);
    return this.pokemonRepository.save(pokemon);
  }

  async findAll(query: PokemonQueryDto): Promise<{ data: Pokemon[]; total: number; page: number; limit: number }> {
    const { search, type, rarity, category, page = 1, limit = 12 } = query;
    const where: any = {};

    if (search) where.name = ILike(`%${search}%`);
    if (type) where.type = type;
    if (rarity) where.rarity = rarity;
    if (category) where.category = category;

    const [data, total] = await this.pokemonRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Pokemon> {
    const pokemon = await this.pokemonRepository.findOne({ where: { id } });
    if (!pokemon) {
      throw new NotFoundException(`Pokemon with id "${id}" not found`);
    }
    return pokemon;
  }

  async update(id: string, updatePokemonDto: UpdatePokemonDto): Promise<Pokemon> {
    const pokemon = await this.findOne(id);
    if (updatePokemonDto.name && updatePokemonDto.name !== pokemon.name) {
      const existing = await this.pokemonRepository.findOne({
        where: { name: updatePokemonDto.name },
      });
      if (existing) {
        throw new ConflictException(`Pokemon "${updatePokemonDto.name}" already exists`);
      }
    }
    Object.assign(pokemon, updatePokemonDto);
    return this.pokemonRepository.save(pokemon);
  }

  async remove(id: string): Promise<void> {
    const pokemon = await this.findOne(id);
    await this.pokemonRepository.remove(pokemon);
  }

  async getMetadata(id: string) {
    const pokemon = await this.findOne(id);
    const baseUrl = this.configService.get<string>('BASE_URL', 'http://localhost:3001');
    return {
      name: pokemon.name,
      description: pokemon.description || `A ${pokemon.rarity} ${pokemon.type} Pokemon`,
      image: pokemon.imageUrl || '',
      external_url: `${baseUrl}/pokemon/${id}`,
      attributes: [
        { trait_type: 'Type', value: pokemon.type },
        { trait_type: 'Rarity', value: pokemon.rarity },
        { trait_type: 'Category', value: pokemon.category || 'Unknown' },
        ...(pokemon.stats ? [
          { trait_type: 'HP', display_type: 'number', value: pokemon.stats.hp },
          { trait_type: 'Attack', display_type: 'number', value: pokemon.stats.attack },
          { trait_type: 'Defense', display_type: 'number', value: pokemon.stats.defense },
          { trait_type: 'Speed', display_type: 'number', value: pokemon.stats.speed },
        ] : []),
        ...(pokemon.abilities ? pokemon.abilities.map(a => ({ trait_type: 'Ability', value: a })) : []),
      ],
    };
  }

  async mintPokemon(id: string): Promise<Pokemon> {
    const pokemon = await this.findOne(id);
    if (pokemon.isMinted) {
      throw new ConflictException(`Pokemon "${pokemon.name}" is already minted`);
    }

    const contract = getContract(this.configService);
    const baseUrl = this.configService.get<string>('BASE_URL', 'http://localhost:3001');
    const tokenURI = `${baseUrl}/pokemon/${id}/metadata`;
    const priceInWei = ethers.parseEther(pokemon.priceEth);

    const tx = await contract.mintPokemon(tokenURI, priceInWei);
    const receipt = await tx.wait();

    const mintEvent = receipt.logs.find((log: any) => {
      try {
        const parsed = contract.interface.parseLog({ topics: log.topics as string[], data: log.data });
        return parsed?.name === 'PokemonMinted';
      } catch { return false; }
    });

    let tokenId = 0;
    if (mintEvent) {
      const parsed = contract.interface.parseLog({ topics: mintEvent.topics as string[], data: mintEvent.data });
      tokenId = Number(parsed?.args[0]);
    }

    const ownerAddress = this.configService.get<string>('OWNER_ADDRESS', '');
    pokemon.tokenId = tokenId;
    pokemon.isMinted = true;
    pokemon.isForSale = true;
    pokemon.ownerAddress = ownerAddress.toLowerCase();
    return this.pokemonRepository.save(pokemon);
  }

  async confirmPurchase(id: string, txHash: string, buyerAddress: string): Promise<Pokemon> {
    const pokemon = await this.findOne(id);
    if (!pokemon.isMinted) {
      throw new NotFoundException('Pokemon is not minted as NFT');
    }

    const provider = getProvider(this.configService);
    const receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt || receipt.status !== 1) {
      throw new ConflictException('Transaction failed or not found');
    }

    pokemon.ownerAddress = buyerAddress.toLowerCase();
    pokemon.isForSale = false;
    if (pokemon.stockQuantity > 0) pokemon.stockQuantity -= 1;
    return this.pokemonRepository.save(pokemon);
  }

  async getContractStats() {
    try {
      const contract = getReadOnlyContract(this.configService);
      const totalMinted = await contract.totalMinted();
      const commissionRate = await contract.commissionRate();
      const totalCommission = await contract.totalCommissionEarned();
      const tokensForSale = await contract.getTokensForSale();

      return {
        totalMinted: Number(totalMinted),
        commissionRate: Number(commissionRate) / 100,
        totalCommissionEarned: ethers.formatEther(totalCommission),
        tokensForSale: tokensForSale.map(Number),
      };
    } catch {
      return {
        totalMinted: 0,
        commissionRate: 5,
        totalCommissionEarned: '0',
        tokensForSale: [],
        error: 'Contract not configured or not deployed',
      };
    }
  }
}
