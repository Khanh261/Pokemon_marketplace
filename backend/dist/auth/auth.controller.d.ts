import { AuthService } from './auth.service';
import { WalletAuthDto } from './dto/wallet-auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    getNonce(): Promise<{
        message: string;
    }>;
    walletAuth(walletAuthDto: WalletAuthDto): Promise<{
        user: import("./user.entity").User;
        token: string;
    }>;
}
