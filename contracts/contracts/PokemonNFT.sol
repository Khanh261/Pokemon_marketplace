// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract PokemonNFT is ERC721URIStorage, Ownable, ReentrancyGuard {
    uint256 private _nextTokenId;
    
    mapping(uint256 => uint256) public tokenPrices;
    mapping(uint256 => bool) public tokenForSale;
    
    uint256 public commissionRate = 500; // 5% in basis points (500/10000)
    uint256 public totalCommissionEarned;
    
    event PokemonMinted(uint256 indexed tokenId, string tokenURI, uint256 price);
    event PokemonPurchased(uint256 indexed tokenId, address indexed buyer, address indexed seller, uint256 price, uint256 commission);
    event PokemonListed(uint256 indexed tokenId, uint256 price);
    event CommissionRateUpdated(uint256 oldRate, uint256 newRate);

    constructor() ERC721("PokemonNFT", "PKMN") Ownable(msg.sender) {}

    function mintPokemon(string memory uri, uint256 priceInWei) external onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);
        tokenPrices[tokenId] = priceInWei;
        tokenForSale[tokenId] = true;
        
        emit PokemonMinted(tokenId, uri, priceInWei);
        return tokenId;
    }

    function buyPokemon(uint256 tokenId) external payable nonReentrant {
        require(tokenForSale[tokenId], "Pokemon is not for sale");
        require(msg.value >= tokenPrices[tokenId], "Insufficient ETH sent");
        
        address seller = ownerOf(tokenId);
        require(seller != msg.sender, "Cannot buy your own Pokemon");
        
        uint256 price = tokenPrices[tokenId];
        uint256 commission = (price * commissionRate) / 10000;
        uint256 sellerProceeds = price - commission;
        
        totalCommissionEarned += commission;
        tokenForSale[tokenId] = false;
        
        _transfer(seller, msg.sender, tokenId);
        
        if (seller != owner()) {
            (bool sellerPaid, ) = payable(seller).call{value: sellerProceeds}("");
            require(sellerPaid, "Failed to pay seller");
        }
        
        uint256 excess = msg.value - price;
        if (excess > 0) {
            (bool refunded, ) = payable(msg.sender).call{value: excess}("");
            require(refunded, "Failed to refund excess");
        }
        
        emit PokemonPurchased(tokenId, msg.sender, seller, price, commission);
    }

    function listForSale(uint256 tokenId, uint256 priceInWei) external {
        require(ownerOf(tokenId) == msg.sender, "Not the token owner");
        require(priceInWei > 0, "Price must be greater than 0");
        
        tokenPrices[tokenId] = priceInWei;
        tokenForSale[tokenId] = true;
        
        emit PokemonListed(tokenId, priceInWei);
    }

    function setCommissionRate(uint256 newRate) external onlyOwner {
        require(newRate <= 1000, "Commission rate cannot exceed 10%");
        uint256 oldRate = commissionRate;
        commissionRate = newRate;
        emit CommissionRateUpdated(oldRate, newRate);
    }

    function withdrawFunds() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    function getTokensForSale() external view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < _nextTokenId; i++) {
            if (tokenForSale[i]) count++;
        }
        
        uint256[] memory result = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < _nextTokenId; i++) {
            if (tokenForSale[i]) {
                result[index] = i;
                index++;
            }
        }
        return result;
    }

    function getTokensByOwner(address ownerAddr) external view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < _nextTokenId; i++) {
            if (_ownerOf(i) == ownerAddr) count++;
        }
        
        uint256[] memory result = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < _nextTokenId; i++) {
            if (_ownerOf(i) == ownerAddr) {
                result[index] = i;
                index++;
            }
        }
        return result;
    }

    function totalMinted() external view returns (uint256) {
        return _nextTokenId;
    }
}
