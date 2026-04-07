import { Contract, JsonRpcProvider, type Signer } from 'ethers';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
const SEPOLIA_RPC = 'https://eth-sepolia.g.alchemy.com/v2/oASe85QlU-2dPl2OzxeqB';

export const POKEMON_NFT_ABI = [
  'constructor()',
  'function approve(address to, uint256 tokenId)',
  'function balanceOf(address owner) view returns (uint256)',
  'function buyPokemon(uint256 tokenId) payable',
  'function commissionRate() view returns (uint256)',
  'function getApproved(uint256 tokenId) view returns (address)',
  'function getTokensByOwner(address ownerAddr) view returns (uint256[])',
  'function getTokensForSale() view returns (uint256[])',
  'function isApprovedForAll(address owner, address operator) view returns (bool)',
  'function listForSale(uint256 tokenId, uint256 priceInWei)',
  'function mintPokemon(string uri, uint256 priceInWei) returns (uint256)',
  'function name() view returns (string)',
  'function owner() view returns (address)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function safeTransferFrom(address from, address to, uint256 tokenId)',
  'function safeTransferFrom(address from, address to, uint256 tokenId, bytes data)',
  'function setApprovalForAll(address operator, bool approved)',
  'function setCommissionRate(uint256 newRate)',
  'function symbol() view returns (string)',
  'function tokenForSale(uint256) view returns (bool)',
  'function tokenPrices(uint256) view returns (uint256)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function totalCommissionEarned() view returns (uint256)',
  'function totalMinted() view returns (uint256)',
  'function transferFrom(address from, address to, uint256 tokenId)',
  'function transferOwnership(address newOwner)',
  'function withdrawFunds()',
  'event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)',
  'event ApprovalForAll(address indexed owner, address indexed operator, bool approved)',
  'event CommissionRateUpdated(uint256 oldRate, uint256 newRate)',
  'event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)',
  'event PokemonListed(uint256 indexed tokenId, uint256 price)',
  'event PokemonMinted(uint256 indexed tokenId, string tokenURI, uint256 price)',
  'event PokemonPurchased(uint256 indexed tokenId, address indexed buyer, address indexed seller, uint256 price, uint256 commission)',
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
] as const;

export function getContract(signer: Signer): Contract {
  return new Contract(CONTRACT_ADDRESS, POKEMON_NFT_ABI, signer);
}

export function getReadOnlyContract(): Contract {
  const provider = new JsonRpcProvider(SEPOLIA_RPC);
  return new Contract(CONTRACT_ADDRESS, POKEMON_NFT_ABI, provider);
}
