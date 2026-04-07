import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsArray,
  IsObject,
  Min,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PokemonRarity } from '../pokemon.entity';
import type { PokemonStats } from '../pokemon.entity';

export class CreatePokemonDto {
  @ApiProperty({ example: 'Pikachu' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Electric' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ example: 9.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 'https://example.com/pikachu.png' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stockQuantity?: number;

  @ApiPropertyOptional({ example: 'The Electric Mouse Pokemon' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: ['Static', 'Lightning Rod'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  abilities?: string[];

  @ApiPropertyOptional({ example: { hp: 35, attack: 55, defense: 40, speed: 90 } })
  @IsOptional()
  @IsObject()
  stats?: PokemonStats;

  @ApiPropertyOptional({ enum: PokemonRarity, example: PokemonRarity.COMMON })
  @IsOptional()
  @IsEnum(PokemonRarity)
  rarity?: PokemonRarity;

  @ApiPropertyOptional({ example: 'Mouse Pokemon' })
  @IsOptional()
  @IsString()
  category?: string;
}
