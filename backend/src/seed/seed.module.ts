import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { Pokemon } from '../pokemon/pokemon.entity';
import { User } from '../auth/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pokemon, User])],
  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule {}
