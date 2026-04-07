import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("PokemonNFT", function () {
  async function deployFixture() {
    const [owner, buyer, thirdParty] = await ethers.getSigners();
    const PokemonNFT = await ethers.getContractFactory("PokemonNFT");
    const nft = await PokemonNFT.deploy();
    await nft.waitForDeployment();

    const uri = "ipfs://QmPokemon1";
    const price = ethers.parseEther("0.1");

    return { nft, owner, buyer, thirdParty, uri, price };
  }

  async function mintedFixture() {
    const fixture = await deployFixture();
    const { nft, uri, price } = fixture;
    await nft.mintPokemon(uri, price);
    return fixture;
  }

  // ── Deployment ──────────────────────────────────────────────
  describe("Deployment", function () {
    it("sets correct name and symbol", async function () {
      const { nft } = await loadFixture(deployFixture);
      expect(await nft.name()).to.equal("PokemonNFT");
      expect(await nft.symbol()).to.equal("PKMN");
    });

    it("sets deployer as owner", async function () {
      const { nft, owner } = await loadFixture(deployFixture);
      expect(await nft.owner()).to.equal(owner.address);
    });

    it("initializes commission rate to 500 (5%)", async function () {
      const { nft } = await loadFixture(deployFixture);
      expect(await nft.commissionRate()).to.equal(500);
    });
  });

  // ── mintPokemon ─────────────────────────────────────────────
  describe("mintPokemon", function () {
    it("owner can mint and sets tokenURI, price, and forSale", async function () {
      const { nft, owner, uri, price } = await loadFixture(deployFixture);
      await nft.mintPokemon(uri, price);

      expect(await nft.ownerOf(0)).to.equal(owner.address);
      expect(await nft.tokenURI(0)).to.equal(uri);
      expect(await nft.tokenPrices(0)).to.equal(price);
      expect(await nft.tokenForSale(0)).to.be.true;
    });

    it("emits PokemonMinted event", async function () {
      const { nft, uri, price } = await loadFixture(deployFixture);
      await expect(nft.mintPokemon(uri, price))
        .to.emit(nft, "PokemonMinted")
        .withArgs(0, uri, price);
    });

    it("reverts when non-owner tries to mint", async function () {
      const { nft, buyer, uri, price } = await loadFixture(deployFixture);
      await expect(
        nft.connect(buyer).mintPokemon(uri, price)
      ).to.be.revertedWithCustomError(nft, "OwnableUnauthorizedAccount");
    });
  });

  // ── buyPokemon ──────────────────────────────────────────────
  describe("buyPokemon", function () {
    it("transfers NFT to buyer and emits event", async function () {
      const { nft, owner, buyer, price } = await loadFixture(mintedFixture);
      await expect(nft.connect(buyer).buyPokemon(0, { value: price }))
        .to.emit(nft, "PokemonPurchased")
        .withArgs(0, buyer.address, owner.address, price, price * 500n / 10000n);

      expect(await nft.ownerOf(0)).to.equal(buyer.address);
      expect(await nft.tokenForSale(0)).to.be.false;
    });

    it("all ETH stays in contract when seller is owner", async function () {
      const { nft, buyer, price } = await loadFixture(mintedFixture);

      const contractBalBefore = await ethers.provider.getBalance(await nft.getAddress());
      await nft.connect(buyer).buyPokemon(0, { value: price });
      const contractBalAfter = await ethers.provider.getBalance(await nft.getAddress());

      expect(contractBalAfter - contractBalBefore).to.equal(price);
    });

    it("reverts with insufficient ETH", async function () {
      const { nft, buyer } = await loadFixture(mintedFixture);
      await expect(
        nft.connect(buyer).buyPokemon(0, { value: ethers.parseEther("0.01") })
      ).to.be.revertedWith("Insufficient ETH sent");
    });

    it("reverts if not for sale", async function () {
      const { nft, buyer, price } = await loadFixture(mintedFixture);
      await nft.connect(buyer).buyPokemon(0, { value: price });
      await expect(
        nft.connect(buyer).buyPokemon(0, { value: price })
      ).to.be.revertedWith("Pokemon is not for sale");
    });

    it("reverts if buying own token", async function () {
      const { nft, price } = await loadFixture(mintedFixture);
      await expect(
        nft.buyPokemon(0, { value: price })
      ).to.be.revertedWith("Cannot buy your own Pokemon");
    });

    it("refunds excess ETH", async function () {
      const { nft, buyer, price } = await loadFixture(mintedFixture);
      const excess = ethers.parseEther("0.05");
      const totalSent = price + excess;

      const balBefore = await ethers.provider.getBalance(buyer.address);
      const tx = await nft.connect(buyer).buyPokemon(0, { value: totalSent });
      const receipt = await tx.wait();
      const gasCost = receipt!.gasUsed * receipt!.gasPrice;
      const balAfter = await ethers.provider.getBalance(buyer.address);

      // buyer should have paid exactly `price + gas`, not `price + excess + gas`
      expect(balBefore - balAfter).to.equal(price + gasCost);
    });
  });

  // ── Secondary sale (commission split) ───────────────────────
  describe("Secondary sale", function () {
    it("pays 95% to seller and keeps 5% commission on resale", async function () {
      const { nft, buyer, thirdParty, price } = await loadFixture(mintedFixture);

      // buyer purchases from owner
      await nft.connect(buyer).buyPokemon(0, { value: price });

      // buyer re-lists
      const resalePrice = ethers.parseEther("0.2");
      await nft.connect(buyer).listForSale(0, resalePrice);

      const commission = resalePrice * 500n / 10000n;
      const sellerProceeds = resalePrice - commission;

      const sellerBalBefore = await ethers.provider.getBalance(buyer.address);
      const contractAddr = await nft.getAddress();
      const contractBalBefore = await ethers.provider.getBalance(contractAddr);

      // thirdParty buys from buyer
      await nft.connect(thirdParty).buyPokemon(0, { value: resalePrice });

      const sellerBalAfter = await ethers.provider.getBalance(buyer.address);
      const contractBalAfter = await ethers.provider.getBalance(contractAddr);

      expect(sellerBalAfter - sellerBalBefore).to.equal(sellerProceeds);
      expect(contractBalAfter - contractBalBefore).to.equal(commission);
      expect(await nft.ownerOf(0)).to.equal(thirdParty.address);
    });
  });

  // ── listForSale ─────────────────────────────────────────────
  describe("listForSale", function () {
    it("token owner can list", async function () {
      const { nft, buyer, price } = await loadFixture(mintedFixture);
      await nft.connect(buyer).buyPokemon(0, { value: price });

      const newPrice = ethers.parseEther("0.5");
      await expect(nft.connect(buyer).listForSale(0, newPrice))
        .to.emit(nft, "PokemonListed")
        .withArgs(0, newPrice);

      expect(await nft.tokenForSale(0)).to.be.true;
      expect(await nft.tokenPrices(0)).to.equal(newPrice);
    });

    it("non-owner cannot list", async function () {
      const { nft, buyer } = await loadFixture(mintedFixture);
      await expect(
        nft.connect(buyer).listForSale(0, ethers.parseEther("1"))
      ).to.be.revertedWith("Not the token owner");
    });

    it("price must be > 0", async function () {
      const { nft } = await loadFixture(mintedFixture);
      await expect(nft.listForSale(0, 0)).to.be.revertedWith(
        "Price must be greater than 0"
      );
    });
  });

  // ── setCommissionRate ───────────────────────────────────────
  describe("setCommissionRate", function () {
    it("owner can set up to 10%", async function () {
      const { nft } = await loadFixture(deployFixture);
      await expect(nft.setCommissionRate(1000))
        .to.emit(nft, "CommissionRateUpdated")
        .withArgs(500, 1000);
      expect(await nft.commissionRate()).to.equal(1000);
    });

    it("reverts above 10%", async function () {
      const { nft } = await loadFixture(deployFixture);
      await expect(nft.setCommissionRate(1001)).to.be.revertedWith(
        "Commission rate cannot exceed 10%"
      );
    });

    it("non-owner cannot set", async function () {
      const { nft, buyer } = await loadFixture(deployFixture);
      await expect(
        nft.connect(buyer).setCommissionRate(100)
      ).to.be.revertedWithCustomError(nft, "OwnableUnauthorizedAccount");
    });
  });

  // ── withdrawFunds ───────────────────────────────────────────
  describe("withdrawFunds", function () {
    it("owner can withdraw", async function () {
      const { nft, owner, buyer, price } = await loadFixture(mintedFixture);
      await nft.connect(buyer).buyPokemon(0, { value: price });

      const ownerBalBefore = await ethers.provider.getBalance(owner.address);
      const contractBal = await ethers.provider.getBalance(await nft.getAddress());
      const tx = await nft.withdrawFunds();
      const receipt = await tx.wait();
      const gasCost = receipt!.gasUsed * receipt!.gasPrice;
      const ownerBalAfter = await ethers.provider.getBalance(owner.address);

      expect(ownerBalAfter - ownerBalBefore).to.equal(contractBal - gasCost);
    });

    it("reverts with zero balance", async function () {
      const { nft } = await loadFixture(deployFixture);
      await expect(nft.withdrawFunds()).to.be.revertedWith("No funds to withdraw");
    });

    it("non-owner cannot withdraw", async function () {
      const { nft, buyer } = await loadFixture(deployFixture);
      await expect(
        nft.connect(buyer).withdrawFunds()
      ).to.be.revertedWithCustomError(nft, "OwnableUnauthorizedAccount");
    });
  });

  // ── getTokensForSale ────────────────────────────────────────
  describe("getTokensForSale", function () {
    it("returns correct list after mint, buy, re-list", async function () {
      const { nft, buyer, uri, price } = await loadFixture(deployFixture);

      await nft.mintPokemon(uri, price);
      await nft.mintPokemon("ipfs://QmPokemon2", price);

      let forSale = await nft.getTokensForSale();
      expect(forSale.map(Number)).to.deep.equal([0, 1]);

      await nft.connect(buyer).buyPokemon(0, { value: price });
      forSale = await nft.getTokensForSale();
      expect(forSale.map(Number)).to.deep.equal([1]);

      await nft.connect(buyer).listForSale(0, price);
      forSale = await nft.getTokensForSale();
      expect(forSale.map(Number)).to.deep.equal([0, 1]);
    });
  });

  // ── getTokensByOwner ────────────────────────────────────────
  describe("getTokensByOwner", function () {
    it("returns correct tokens per address", async function () {
      const { nft, owner, buyer, uri, price } = await loadFixture(deployFixture);

      await nft.mintPokemon(uri, price);
      await nft.mintPokemon("ipfs://QmPokemon2", price);

      let ownerTokens = await nft.getTokensByOwner(owner.address);
      expect(ownerTokens.map(Number)).to.deep.equal([0, 1]);

      await nft.connect(buyer).buyPokemon(0, { value: price });

      ownerTokens = await nft.getTokensByOwner(owner.address);
      expect(ownerTokens.map(Number)).to.deep.equal([1]);

      const buyerTokens = await nft.getTokensByOwner(buyer.address);
      expect(buyerTokens.map(Number)).to.deep.equal([0]);
    });
  });

  // ── totalMinted ─────────────────────────────────────────────
  describe("totalMinted", function () {
    it("returns correct count", async function () {
      const { nft, uri, price } = await loadFixture(deployFixture);
      expect(await nft.totalMinted()).to.equal(0);

      await nft.mintPokemon(uri, price);
      expect(await nft.totalMinted()).to.equal(1);

      await nft.mintPokemon("ipfs://QmPokemon2", price);
      expect(await nft.totalMinted()).to.equal(2);
    });
  });
});
