import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PokemonRarity {
  COMMON = 'Common',
  UNCOMMON = 'Uncommon',
  RARE = 'Rare',
  LEGENDARY = 'Legendary',
}

export interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
}

@Entity('pokemon')
export class Pokemon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column()
  type: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ default: 0 })
  stockQuantity: number;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column('simple-array', { nullable: true })
  abilities: string[];

  @Column('jsonb', { nullable: true })
  stats: PokemonStats;

  @Column({
    type: 'enum',
    enum: PokemonRarity,
    default: PokemonRarity.COMMON,
  })
  rarity: PokemonRarity;

  @Column({ nullable: true })
  category: string;

  // Web3 NFT fields
  @Column({ nullable: true, type: 'int' })
  tokenId: number;

  @Column({ default: '0.001' })
  priceEth: string;

  @Column({ nullable: true })
  ownerAddress: string;

  @Column({ default: false })
  isMinted: boolean;

  @Column({ default: true })
  isForSale: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
