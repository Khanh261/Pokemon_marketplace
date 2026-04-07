import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User, UserRole } from './user.entity';
import { ethers } from 'ethers';

jest.mock('ethers', () => ({
  ethers: {
    verifyMessage: jest.fn(),
  },
}));

const OWNER_ADDRESS = '0xOwnerAddress1234567890abcdef1234567890ab';

const mockUserRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
};

const mockConfigService = {
  get: jest.fn((key: string, defaultVal?: string) => {
    if (key === 'OWNER_ADDRESS') return OWNER_ADDRESS;
    return defaultVal ?? '';
  }),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('getNonce', () => {
    it('should return a message containing a nonce', async () => {
      const result = await service.getNonce();
      expect(result).toHaveProperty('message');
      expect(result.message).toMatch(/^Sign in to Pokemon NFT Marketplace: \d+$/);
    });
  });

  describe('walletAuth', () => {
    const walletAddress = '0x1234567890abcdef1234567890abcdef12345678';
    const dto = {
      walletAddress,
      signature: '0xsignature',
      message: 'Sign in to Pokemon NFT Marketplace: 123456',
    };

    it('should authenticate and return user + token for existing user', async () => {
      const existingUser: Partial<User> = {
        id: 'user-uuid',
        walletAddress: walletAddress.toLowerCase(),
        name: 'TestUser',
        role: UserRole.USER,
      };

      (ethers.verifyMessage as jest.Mock).mockReturnValue(walletAddress);
      mockUserRepository.findOne.mockResolvedValue(existingUser);

      const result = await service.walletAuth(dto);

      expect(ethers.verifyMessage).toHaveBeenCalledWith(dto.message, dto.signature);
      expect(result.user).toEqual(existingUser);
      expect(result.token).toBe('mock-jwt-token');
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: existingUser.id,
        walletAddress: existingUser.walletAddress,
        role: existingUser.role,
      });
    });

    it('should create a new user if not found', async () => {
      const newUser: Partial<User> = {
        id: 'new-uuid',
        walletAddress: walletAddress.toLowerCase(),
        name: `User-${walletAddress.slice(0, 6)}`,
        role: UserRole.USER,
      };

      (ethers.verifyMessage as jest.Mock).mockReturnValue(walletAddress);
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(newUser);
      mockUserRepository.save.mockResolvedValue(newUser);

      const result = await service.walletAuth(dto);

      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalledWith(newUser);
      expect(result.user).toEqual(newUser);
      expect(result.token).toBe('mock-jwt-token');
    });

    it('should assign ADMIN role if wallet matches owner address', async () => {
      const adminDto = {
        ...dto,
        walletAddress: OWNER_ADDRESS,
      };
      const adminUser: Partial<User> = {
        id: 'admin-uuid',
        walletAddress: OWNER_ADDRESS.toLowerCase(),
        role: UserRole.ADMIN,
      };

      (ethers.verifyMessage as jest.Mock).mockReturnValue(OWNER_ADDRESS);
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(adminUser);
      mockUserRepository.save.mockResolvedValue(adminUser);

      await service.walletAuth(adminDto);

      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ role: UserRole.ADMIN }),
      );
    });

    it('should throw UnauthorizedException for invalid signature', async () => {
      (ethers.verifyMessage as jest.Mock).mockImplementation(() => {
        throw new Error('invalid signature');
      });

      await expect(service.walletAuth(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if recovered address does not match', async () => {
      (ethers.verifyMessage as jest.Mock).mockReturnValue('0xDIFFERENTaddress');

      await expect(service.walletAuth(dto)).rejects.toThrow(UnauthorizedException);
    });
  });
});
