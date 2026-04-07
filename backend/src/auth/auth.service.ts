import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ethers } from 'ethers';
import { User, UserRole } from './user.entity';
import { WalletAuthDto } from './dto/wallet-auth.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly ownerAddress: string;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.ownerAddress = this.configService.get<string>('OWNER_ADDRESS', '').toLowerCase();
  }

  async walletAuth(walletAuthDto: WalletAuthDto): Promise<{ user: User; token: string }> {
    const { walletAddress, signature, message } = walletAuthDto;

    // Verify signature
    let recoveredAddress: string;
    try {
      recoveredAddress = ethers.verifyMessage(message, signature);
    } catch {
      throw new UnauthorizedException('Invalid signature');
    }

    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      throw new UnauthorizedException('Signature does not match wallet address');
    }

    // Find or create user
    let user = await this.userRepository.findOne({
      where: { walletAddress: walletAddress.toLowerCase() },
    });

    if (!user) {
      // Determine role: if wallet matches owner address, make admin
      const isOwner = walletAddress.toLowerCase() === this.ownerAddress;
      user = this.userRepository.create({
        walletAddress: walletAddress.toLowerCase(),
        name: walletAuthDto.name || `User-${walletAddress.slice(0, 6)}`,
        role: isOwner ? UserRole.ADMIN : UserRole.USER,
      });
      await this.userRepository.save(user);
    }

    const token = this.jwtService.sign({
      sub: user.id,
      walletAddress: user.walletAddress,
      role: user.role,
    });

    return { user, token };
  }

  async getNonce(): Promise<{ message: string }> {
    const nonce = Math.floor(Math.random() * 1000000);
    return { message: `Sign in to Pokemon NFT Marketplace: ${nonce}` };
  }
}
