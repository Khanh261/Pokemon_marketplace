import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PokemonService } from './pokemon.service';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { PokemonQueryDto } from './dto/pokemon-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/user.entity';

@ApiTags('pokemon')
@Controller('pokemon')
export class PokemonController {
  constructor(private readonly pokemonService: PokemonService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new Pokemon (Admin only)' })
  @ApiResponse({ status: 201, description: 'Pokemon created successfully' })
  create(@Body() createPokemonDto: CreatePokemonDto) {
    return this.pokemonService.create(createPokemonDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all Pokemon with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Returns paginated Pokemon list' })
  findAll(@Query() query: PokemonQueryDto) {
    return this.pokemonService.findAll(query);
  }

  @Get('contract/stats')
  @ApiOperation({ summary: 'Get contract statistics' })
  getContractStats() {
    return this.pokemonService.getContractStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single Pokemon by ID' })
  @ApiResponse({ status: 200, description: 'Returns the Pokemon' })
  @ApiResponse({ status: 404, description: 'Pokemon not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.pokemonService.findOne(id);
  }

  @Get(':id/metadata')
  @ApiOperation({ summary: 'Get ERC-721 metadata JSON for a Pokemon' })
  @ApiResponse({ status: 200, description: 'Returns ERC-721 compliant metadata' })
  getMetadata(@Param('id', ParseUUIDPipe) id: string) {
    return this.pokemonService.getMetadata(id);
  }

  @Post(':id/mint')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mint a Pokemon as NFT on-chain (Admin only)' })
  @ApiResponse({ status: 200, description: 'Pokemon minted as NFT' })
  mintPokemon(@Param('id', ParseUUIDPipe) id: string) {
    return this.pokemonService.mintPokemon(id);
  }

  @Post(':id/purchase')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirm NFT purchase after blockchain transaction' })
  confirmPurchase(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { txHash: string; buyerAddress: string },
  ) {
    return this.pokemonService.confirmPurchase(id, body.txHash, body.buyerAddress);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a Pokemon (Admin only)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePokemonDto: UpdatePokemonDto,
  ) {
    return this.pokemonService.update(id, updatePokemonDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a Pokemon (Admin only)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.pokemonService.remove(id);
  }
}
