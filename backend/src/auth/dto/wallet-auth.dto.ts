import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WalletAuthDto {
  @ApiProperty({ example: '0x0466408257b63D3E50C00BACF2cfF4bcD11aD33D' })
  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @ApiProperty({ example: '0xabcdef...' })
  @IsString()
  @IsNotEmpty()
  signature: string;

  @ApiProperty({ example: 'Sign in to Pokemon NFT Marketplace: 1234567890' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional({ example: 'Ash Ketchum' })
  @IsOptional()
  @IsString()
  name?: string;
}
