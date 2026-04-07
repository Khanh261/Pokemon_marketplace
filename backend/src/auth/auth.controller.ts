import { Controller, Post, Body, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { WalletAuthDto } from './dto/wallet-auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('nonce')
  @ApiOperation({ summary: 'Get a nonce message to sign with MetaMask' })
  @ApiResponse({ status: 200, description: 'Returns message to sign' })
  getNonce() {
    return this.authService.getNonce();
  }

  @Post('wallet')
  @ApiOperation({ summary: 'Authenticate with MetaMask wallet signature' })
  @ApiResponse({ status: 200, description: 'Returns JWT token and user info' })
  @ApiResponse({ status: 401, description: 'Invalid signature' })
  walletAuth(@Body() walletAuthDto: WalletAuthDto) {
    return this.authService.walletAuth(walletAuthDto);
  }
}
