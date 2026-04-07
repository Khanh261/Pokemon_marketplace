import { Test, TestingModule } from '@nestjs/testing';
import { PokemonController } from './pokemon.controller';
import { PokemonService } from './pokemon.service';
import { PokemonRarity } from './pokemon.entity';

const mockPokemon = {
  id: 'test-uuid',
  name: 'Pikachu',
  type: 'Electric',
  price: 9.99,
  rarity: PokemonRarity.COMMON,
  isMinted: false,
  isForSale: true,
  priceEth: '0.001',
};

const mockPokemonService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  getMetadata: jest.fn(),
  mintPokemon: jest.fn(),
  confirmPurchase: jest.fn(),
  getContractStats: jest.fn(),
};

describe('PokemonController', () => {
  let controller: PokemonController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PokemonController],
      providers: [{ provide: PokemonService, useValue: mockPokemonService }],
    }).compile();

    controller = module.get<PokemonController>(PokemonController);
    jest.clearAllMocks();
  });

  describe('POST /pokemon', () => {
    it('should create a pokemon', async () => {
      mockPokemonService.create.mockResolvedValue(mockPokemon);
      const dto = { name: 'Pikachu', type: 'Electric', price: 9.99 };
      const result = await controller.create(dto as any);
      expect(result).toEqual(mockPokemon);
      expect(mockPokemonService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('GET /pokemon', () => {
    it('should return paginated pokemon list', async () => {
      const response = { data: [mockPokemon], total: 1, page: 1, limit: 12 };
      mockPokemonService.findAll.mockResolvedValue(response);
      const result = await controller.findAll({ page: 1, limit: 12 });
      expect(result).toEqual(response);
    });
  });

  describe('GET /pokemon/:id', () => {
    it('should return a pokemon by id', async () => {
      mockPokemonService.findOne.mockResolvedValue(mockPokemon);
      const result = await controller.findOne('test-uuid');
      expect(result).toEqual(mockPokemon);
    });
  });

  describe('GET /pokemon/:id/metadata', () => {
    it('should return ERC-721 metadata', async () => {
      const metadata = {
        name: 'Pikachu',
        description: 'Electric mouse',
        attributes: [{ trait_type: 'Type', value: 'Electric' }],
      };
      mockPokemonService.getMetadata.mockResolvedValue(metadata);
      const result = await controller.getMetadata('test-uuid');
      expect(result).toEqual(metadata);
      expect(mockPokemonService.getMetadata).toHaveBeenCalledWith('test-uuid');
    });
  });

  describe('POST /pokemon/:id/mint', () => {
    it('should mint a pokemon as NFT', async () => {
      const minted = { ...mockPokemon, isMinted: true, tokenId: 1 };
      mockPokemonService.mintPokemon.mockResolvedValue(minted);
      const result = await controller.mintPokemon('test-uuid');
      expect(result).toEqual(minted);
      expect(mockPokemonService.mintPokemon).toHaveBeenCalledWith('test-uuid');
    });
  });

  describe('POST /pokemon/:id/purchase', () => {
    it('should confirm a purchase', async () => {
      const purchased = { ...mockPokemon, ownerAddress: '0xbuyer', isForSale: false };
      mockPokemonService.confirmPurchase.mockResolvedValue(purchased);
      const body = { txHash: '0xtxhash', buyerAddress: '0xBuyer' };
      const result = await controller.confirmPurchase('test-uuid', body);
      expect(result).toEqual(purchased);
      expect(mockPokemonService.confirmPurchase).toHaveBeenCalledWith('test-uuid', '0xtxhash', '0xBuyer');
    });
  });

  describe('GET /pokemon/contract/stats', () => {
    it('should return contract statistics', async () => {
      const stats = { totalMinted: 10, commissionRate: 5, totalCommissionEarned: '0.5', tokensForSale: [1, 2] };
      mockPokemonService.getContractStats.mockResolvedValue(stats);
      const result = await controller.getContractStats();
      expect(result).toEqual(stats);
    });
  });

  describe('PATCH /pokemon/:id', () => {
    it('should update a pokemon', async () => {
      const updated = { ...mockPokemon, price: 14.99 };
      mockPokemonService.update.mockResolvedValue(updated);
      const result = await controller.update('test-uuid', { price: 14.99 } as any);
      expect(result).toEqual(updated);
    });
  });

  describe('DELETE /pokemon/:id', () => {
    it('should remove a pokemon', async () => {
      mockPokemonService.remove.mockResolvedValue(undefined);
      await controller.remove('test-uuid');
      expect(mockPokemonService.remove).toHaveBeenCalledWith('test-uuid');
    });
  });
});
