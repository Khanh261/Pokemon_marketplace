import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { PokemonService } from './pokemon.service';
import { Pokemon, PokemonRarity } from './pokemon.entity';
import { NotFoundException, ConflictException } from '@nestjs/common';

// Mock contract.config module
const mockContract = {
  mintPokemon: jest.fn(),
  interface: { parseLog: jest.fn() },
  totalMinted: jest.fn(),
  commissionRate: jest.fn(),
  totalCommissionEarned: jest.fn(),
  getTokensForSale: jest.fn(),
};

const mockProvider = {
  getTransactionReceipt: jest.fn(),
};

jest.mock('./contract.config', () => ({
  getContract: jest.fn(() => mockContract),
  getReadOnlyContract: jest.fn(() => mockContract),
  getProvider: jest.fn(() => mockProvider),
}));

jest.mock('ethers', () => ({
  ethers: {
    parseEther: jest.fn((val: string) => BigInt(Math.round(parseFloat(val) * 1e18))),
    formatEther: jest.fn((val: bigint) => '0.5'),
  },
}));

const mockPokemon: Pokemon = {
  id: 'test-uuid',
  name: 'Pikachu',
  type: 'Electric',
  price: 9.99,
  rarity: PokemonRarity.COMMON,
  category: 'Mouse Pokemon',
  imageUrl: 'https://example.com/pikachu.png',
  stockQuantity: 50,
  description: 'Electric mouse',
  abilities: ['Static'],
  stats: { hp: 35, attack: 55, defense: 40, speed: 90 },
  tokenId: null,
  priceEth: '0.001',
  ownerAddress: null,
  isMinted: false,
  isForSale: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  findAndCount: jest.fn(),
  remove: jest.fn(),
};

const mockConfigService = {
  get: jest.fn((key: string, defaultVal?: string) => {
    const config: Record<string, string> = {
      BASE_URL: 'http://localhost:3001',
      OWNER_ADDRESS: '0xOwnerAddr',
      CONTRACT_ADDRESS: '0xContractAddr',
    };
    return config[key] ?? defaultVal ?? '';
  }),
};

describe('PokemonService', () => {
  let service: PokemonService;
  let repository: Repository<Pokemon>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PokemonService,
        { provide: getRepositoryToken(Pokemon), useValue: mockRepository },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<PokemonService>(PokemonService);
    repository = module.get<Repository<Pokemon>>(getRepositoryToken(Pokemon));
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new pokemon', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockPokemon);
      mockRepository.save.mockResolvedValue(mockPokemon);

      const result = await service.create({ name: 'Pikachu', type: 'Electric', price: 9.99 });
      expect(result).toEqual(mockPokemon);
      expect(mockRepository.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if pokemon name exists', async () => {
      mockRepository.findOne.mockResolvedValue(mockPokemon);
      await expect(service.create({ name: 'Pikachu', type: 'Electric', price: 9.99 })).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return paginated pokemon list', async () => {
      mockRepository.findAndCount.mockResolvedValue([[mockPokemon], 1]);
      const result = await service.findAll({ page: 1, limit: 12 });
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a pokemon by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockPokemon);
      const result = await service.findOne('test-uuid');
      expect(result).toEqual(mockPokemon);
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a pokemon', async () => {
      mockRepository.findOne.mockResolvedValue({ ...mockPokemon });
      mockRepository.save.mockResolvedValue({ ...mockPokemon, price: 14.99 });
      const result = await service.update('test-uuid', { price: 14.99 });
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a pokemon', async () => {
      mockRepository.findOne.mockResolvedValue(mockPokemon);
      mockRepository.remove.mockResolvedValue(mockPokemon);
      await service.remove('test-uuid');
      expect(mockRepository.remove).toHaveBeenCalledWith(mockPokemon);
    });
  });

  describe('getMetadata', () => {
    it('should return ERC-721 metadata for a pokemon', async () => {
      mockRepository.findOne.mockResolvedValue(mockPokemon);

      const result = await service.getMetadata('test-uuid');

      expect(result.name).toBe('Pikachu');
      expect(result.description).toBe('Electric mouse');
      expect(result.external_url).toBe('http://localhost:3001/pokemon/test-uuid');
      expect(result.attributes).toEqual(
        expect.arrayContaining([
          { trait_type: 'Type', value: 'Electric' },
          { trait_type: 'Rarity', value: PokemonRarity.COMMON },
          { trait_type: 'Category', value: 'Mouse Pokemon' },
          { trait_type: 'HP', display_type: 'number', value: 35 },
          { trait_type: 'Ability', value: 'Static' },
        ]),
      );
    });

    it('should throw NotFoundException if pokemon not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.getMetadata('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('mintPokemon', () => {
    it('should mint a pokemon and update its fields', async () => {
      const unmintedPokemon = { ...mockPokemon, isMinted: false };
      mockRepository.findOne.mockResolvedValue(unmintedPokemon);

      const mockReceipt = {
        logs: [{ topics: ['0x123'], data: '0xdata' }],
      };
      mockContract.mintPokemon.mockResolvedValue({ wait: jest.fn().mockResolvedValue(mockReceipt) });
      mockContract.interface.parseLog
        .mockReturnValueOnce({ name: 'PokemonMinted', args: [BigInt(42)] })
        .mockReturnValueOnce({ name: 'PokemonMinted', args: [BigInt(42)] });

      const savedPokemon = { ...unmintedPokemon, tokenId: 42, isMinted: true, isForSale: true, ownerAddress: '0xowneraddr' };
      mockRepository.save.mockResolvedValue(savedPokemon);

      const result = await service.mintPokemon('test-uuid');

      expect(mockContract.mintPokemon).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result.isMinted).toBe(true);
      expect(result.tokenId).toBe(42);
    });

    it('should throw ConflictException if already minted', async () => {
      mockRepository.findOne.mockResolvedValue({ ...mockPokemon, isMinted: true });
      await expect(service.mintPokemon('test-uuid')).rejects.toThrow(ConflictException);
    });
  });

  describe('confirmPurchase', () => {
    it('should confirm purchase and update ownership', async () => {
      const mintedPokemon = { ...mockPokemon, isMinted: true, isForSale: true, stockQuantity: 5 };
      mockRepository.findOne.mockResolvedValue(mintedPokemon);
      mockProvider.getTransactionReceipt.mockResolvedValue({ status: 1 });

      const updatedPokemon = { ...mintedPokemon, ownerAddress: '0xbuyer', isForSale: false, stockQuantity: 4 };
      mockRepository.save.mockResolvedValue(updatedPokemon);

      const result = await service.confirmPurchase('test-uuid', '0xtxhash', '0xBuyer');

      expect(mockProvider.getTransactionReceipt).toHaveBeenCalledWith('0xtxhash');
      expect(result.ownerAddress).toBe('0xbuyer');
      expect(result.isForSale).toBe(false);
    });

    it('should throw NotFoundException if pokemon is not minted', async () => {
      mockRepository.findOne.mockResolvedValue({ ...mockPokemon, isMinted: false });
      await expect(service.confirmPurchase('test-uuid', '0xtxhash', '0xBuyer')).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if transaction failed', async () => {
      mockRepository.findOne.mockResolvedValue({ ...mockPokemon, isMinted: true });
      mockProvider.getTransactionReceipt.mockResolvedValue({ status: 0 });
      await expect(service.confirmPurchase('test-uuid', '0xtxhash', '0xBuyer')).rejects.toThrow(ConflictException);
    });
  });

  describe('getContractStats', () => {
    it('should return contract statistics', async () => {
      mockContract.totalMinted.mockResolvedValue(BigInt(10));
      mockContract.commissionRate.mockResolvedValue(BigInt(500));
      mockContract.totalCommissionEarned.mockResolvedValue(BigInt(1e18));
      mockContract.getTokensForSale.mockResolvedValue([BigInt(1), BigInt(2)]);

      const result = await service.getContractStats();

      expect(result.totalMinted).toBe(10);
      expect(result.commissionRate).toBe(5);
      expect(result.totalCommissionEarned).toBe('0.5');
      expect(result.tokensForSale).toEqual([1, 2]);
    });

    it('should return fallback stats on contract error', async () => {
      mockContract.totalMinted.mockRejectedValue(new Error('not deployed'));

      const result = await service.getContractStats();

      expect(result.totalMinted).toBe(0);
      expect(result.error).toBe('Contract not configured or not deployed');
    });
  });
});
