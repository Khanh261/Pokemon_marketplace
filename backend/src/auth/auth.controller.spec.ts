import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRole } from './user.entity';

const mockAuthService = {
  getNonce: jest.fn(),
  walletAuth: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  describe('GET /auth/nonce', () => {
    it('should return a nonce message', async () => {
      const nonceResponse = { message: 'Sign in to Pokemon NFT Marketplace: 123456' };
      mockAuthService.getNonce.mockResolvedValue(nonceResponse);

      const result = await controller.getNonce();
      expect(result).toEqual(nonceResponse);
      expect(mockAuthService.getNonce).toHaveBeenCalled();
    });
  });

  describe('POST /auth/wallet', () => {
    it('should authenticate with wallet signature and return user + token', async () => {
      const dto = {
        walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
        signature: '0xsignature',
        message: 'Sign in to Pokemon NFT Marketplace: 123456',
      };
      const authResponse = {
        user: {
          id: 'user-uuid',
          walletAddress: dto.walletAddress.toLowerCase(),
          role: UserRole.USER,
        },
        token: 'mock-jwt-token',
      };
      mockAuthService.walletAuth.mockResolvedValue(authResponse);

      const result = await controller.walletAuth(dto);
      expect(result).toEqual(authResponse);
      expect(mockAuthService.walletAuth).toHaveBeenCalledWith(dto);
    });
  });
});
