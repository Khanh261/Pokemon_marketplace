import { render, screen } from '@testing-library/react';
import PokemonCard from '@/components/PokemonCard';
import { Pokemon, PokemonRarity } from '@/lib/types';

jest.mock('next/link', () => ({ children, href }: any) => <a href={href}>{children}</a>);
jest.mock('next/image', () => ({ src, alt }: any) => <img src={src} alt={alt} />);

const mockPokemon: Pokemon = {
  id: 'test-id',
  name: 'Pikachu',
  type: 'Electric',
  price: 9.99,
  rarity: PokemonRarity.COMMON,
  stockQuantity: 50,
  priceEth: '0.001',
  isMinted: false,
  isForSale: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('PokemonCard', () => {
  it('renders pokemon name', () => {
    render(<PokemonCard pokemon={mockPokemon} />);
    expect(screen.getByText('Pikachu')).toBeInTheDocument();
  });

  it('renders pokemon price', () => {
    render(<PokemonCard pokemon={mockPokemon} />);
    expect(screen.getByText('$9.99')).toBeInTheDocument();
  });

  it('renders pokemon type', () => {
    render(<PokemonCard pokemon={mockPokemon} />);
    expect(screen.getByText('Electric')).toBeInTheDocument();
  });

  it('renders in stock label when stock > 0', () => {
    render(<PokemonCard pokemon={mockPokemon} />);
    expect(screen.getByText('50 in stock')).toBeInTheDocument();
  });

  it('renders out of stock when stockQuantity is 0', () => {
    render(<PokemonCard pokemon={{ ...mockPokemon, stockQuantity: 0 }} />);
    expect(screen.getByText('Out of stock')).toBeInTheDocument();
  });

  it('renders correct link', () => {
    render(<PokemonCard pokemon={mockPokemon} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/pokemon/test-id');
  });
});
