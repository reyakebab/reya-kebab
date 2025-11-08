import { ethers } from "hardhat";

async function main() {
  const factoryAddr = process.env.FACTORY!;
  const feeTo = process.env.FEE_TO!;
  if (!factoryAddr || !feeTo) throw new Error("FACTORY or FEE_TO missing");

  const factory = await ethers.getContractAt("UniswapV2Factory", factoryAddr);
  const tx = await factory.setFeeTo(feeTo);
  await tx.wait();
  console.log("feeTo set to", feeTo);
}

main().catch((e) => { console.error(e); process.exit(1); });
