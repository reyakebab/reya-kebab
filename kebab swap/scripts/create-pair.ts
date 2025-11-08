import { ethers } from "hardhat";

async function main() {
  const factoryAddr = process.env.FACTORY!;
  const tokenA = process.env.TOKEN_A!;
  const tokenB = process.env.TOKEN_B!;
  if (!factoryAddr || !tokenA || !tokenB) throw new Error("FACTORY/TOKEN_A/TOKEN_B missing");

  const [a, b] = (await Promise.all([
    ethers.getAddress(tokenA),
    ethers.getAddress(tokenB)
  ])).sort((x, y) => x.toLowerCase() < y.toLowerCase() ? -1 : 1);

  const factory = await ethers.getContractAt("UniswapV2Factory", factoryAddr);
  const tx = await factory.createPair(a, b);
  const receipt = await tx.wait();

  console.log("createPair tx:", receipt?.hash);
  const pair = await factory.getPair(a, b);
  console.log("Pair:", pair);
}

main().catch((e) => { console.error(e); process.exit(1); });
