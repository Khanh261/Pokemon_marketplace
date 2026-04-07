import { ethers, run } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("Deploying PokemonNFT...");
  
  const PokemonNFT = await ethers.getContractFactory("PokemonNFT");
  const pokemonNFT = await PokemonNFT.deploy();
  await pokemonNFT.waitForDeployment();
  
  const address = await pokemonNFT.getAddress();
  console.log(`PokemonNFT deployed to: ${address}`);
  
  // Save deployed address
  const deployedData = {
    address,
    network: "sepolia",
    deployedAt: new Date().toISOString(),
  };
  
  fs.writeFileSync(
    path.join(__dirname, "../deployed-address.json"),
    JSON.stringify(deployedData, null, 2)
  );
  
  console.log("Address saved to deployed-address.json");
  
  // Wait for block confirmations before verifying
  console.log("Waiting for block confirmations...");
  const deployTx = pokemonNFT.deploymentTransaction();
  if (deployTx) {
    await deployTx.wait(5);
  }
  
  // Verify on Etherscan
  try {
    await run("verify:verify", {
      address,
      constructorArguments: [],
    });
    console.log("Contract verified on Etherscan!");
  } catch (error: any) {
    console.log("Verification failed:", error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
