import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from './user.entity';
import { WalletAuthDto } from './dto/wallet-auth.dto';
import { ConfigService } from '@nestjs/config';
export declare class AuthService {
    private userRepository;
    private jwtService;
    private configService;
    private readonly ownerAddress;
    constructor(userRepository: Repository<User>, jwtService: JwtService, configService: ConfigService);
    walletAuth(walletAuthDto: WalletAuthDto): Promise<{
        user: User;
        token: string;
    }>;
    getNonce(): Promise<{
        message: string;
    }>;
}
