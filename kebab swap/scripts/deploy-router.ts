import { ethers } from "hardhat";

async function main() {
  const factory = process.env.FACTORY!;
  const WETH = process.env.WETH!;
  if (!factory || !WETH) throw new Error("FACTORY or WETH env var missing");

  const Router = await ethers.getContractFactory("UniswapV2Router02");
  const router = await Router.deploy(factory, WETH);
  await router.waitForDeployment();

  console.log("Router deployed to:", await router.getAddress());
}

main().catch((e) => { console.error(e); process.exit(1); });
