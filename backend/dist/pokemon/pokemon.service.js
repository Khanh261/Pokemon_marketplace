"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PokemonService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const ethers_1 = require("ethers");
const pokemon_entity_1 = require("./pokemon.entity");
const contract_config_1 = require("./contract.config");
let PokemonService = class PokemonService {
    pokemonRepository;
    configService;
    constructor(pokemonRepository, configService) {
        this.pokemonRepository = pokemonRepository;
        this.configService = configService;
    }
    async create(createPokemonDto) {
        const existing = await this.pokemonRepository.findOne({
            where: { name: createPokemonDto.name },
        });
        if (existing) {
            throw new common_1.ConflictException(`Pokemon "${createPokemonDto.name}" already exists`);
        }
        const pokemon = this.pokemonRepository.create(createPokemonDto);
        return this.pokemonRepository.save(pokemon);
    }
    async findAll(query) {
        const { search, type, rarity, category, page = 1, limit = 12 } = query;
        const where = {};
        if (search)
            where.name = (0, typeorm_2.ILike)(`%${search}%`);
        if (type)
            where.type = type;
        if (rarity)
            where.rarity = rarity;
        if (category)
            where.category = category;
        const [data, total] = await this.pokemonRepository.findAndCount({
            where,
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: 'DESC' },
        });
        return { data, total, page, limit };
    }
    async findOne(id) {
        const pokemon = await this.pokemonRepository.findOne({ where: { id } });
        if (!pokemon) {
            throw new common_1.NotFoundException(`Pokemon with id "${id}" not found`);
        }
        return pokemon;
    }
    async update(id, updatePokemonDto) {
        const pokemon = await this.findOne(id);
        if (updatePokemonDto.name && updatePokemonDto.name !== pokemon.name) {
            const existing = await this.pokemonRepository.findOne({
                where: { name: updatePokemonDto.name },
            });
            if (existing) {
                throw new common_1.ConflictException(`Pokemon "${updatePokemonDto.name}" already exists`);
            }
        }
        Object.assign(pokemon, updatePokemonDto);
        return this.pokemonRepository.save(pokemon);
    }
    async remove(id) {
        const pokemon = await this.findOne(id);
        await this.pokemonRepository.remove(pokemon);
    }
    async getMetadata(id) {
        const pokemon = await this.findOne(id);
        const baseUrl = this.configService.get('BASE_URL', 'http://localhost:3001');
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
    async mintPokemon(id) {
        const pokemon = await this.findOne(id);
        if (pokemon.isMinted) {
            throw new common_1.ConflictException(`Pokemon "${pokemon.name}" is already minted`);
        }
        const contract = (0, contract_config_1.getContract)(this.configService);
        const baseUrl = this.configService.get('BASE_URL', 'http://localhost:3001');
        const tokenURI = `${baseUrl}/pokemon/${id}/metadata`;
        const priceInWei = ethers_1.ethers.parseEther(pokemon.priceEth);
        const tx = await contract.mintPokemon(tokenURI, priceInWei);
        const receipt = await tx.wait();
        const mintEvent = receipt.logs.find((log) => {
            try {
                const parsed = contract.interface.parseLog({ topics: log.topics, data: log.data });
                return parsed?.name === 'PokemonMinted';
            }
            catch {
                return false;
            }
        });
        let tokenId = 0;
        if (mintEvent) {
            const parsed = contract.interface.parseLog({ topics: mintEvent.topics, data: mintEvent.data });
            tokenId = Number(parsed?.args[0]);
        }
        const ownerAddress = this.configService.get('OWNER_ADDRESS', '');
        pokemon.tokenId = tokenId;
        pokemon.isMinted = true;
        pokemon.isForSale = true;
        pokemon.ownerAddress = ownerAddress.toLowerCase();
        return this.pokemonRepository.save(pokemon);
    }
    async confirmPurchase(id, txHash, buyerAddress) {
        const pokemon = await this.findOne(id);
        if (!pokemon.isMinted) {
            throw new common_1.NotFoundException('Pokemon is not minted as NFT');
        }
        const provider = (0, contract_config_1.getProvider)(this.configService);
        const receipt = await provider.getTransactionReceipt(txHash);
        if (!receipt || receipt.status !== 1) {
            throw new common_1.ConflictException('Transaction failed or not found');
        }
        pokemon.ownerAddress = buyerAddress.toLowerCase();
        pokemon.isForSale = false;
        if (pokemon.stockQuantity > 0)
            pokemon.stockQuantity -= 1;
        return this.pokemonRepository.save(pokemon);
    }
    async getContractStats() {
        try {
            const contract = (0, contract_config_1.getReadOnlyContract)(this.configService);
            const totalMinted = await contract.totalMinted();
            const commissionRate = await contract.commissionRate();
            const totalCommission = await contract.totalCommissionEarned();
            const tokensForSale = await contract.getTokensForSale();
            return {
                totalMinted: Number(totalMinted),
                commissionRate: Number(commissionRate) / 100,
                totalCommissionEarned: ethers_1.ethers.formatEther(totalCommission),
                tokensForSale: tokensForSale.map(Number),
            };
        }
        catch {
            return {
                totalMinted: 0,
                commissionRate: 5,
                totalCommissionEarned: '0',
                tokensForSale: [],
                error: 'Contract not configured or not deployed',
            };
        }
    }
};
exports.PokemonService = PokemonService;
exports.PokemonService = PokemonService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(pokemon_entity_1.Pokemon)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        config_1.ConfigService])
], PokemonService);
//# sourceMappingURL=pokemon.service.js.map