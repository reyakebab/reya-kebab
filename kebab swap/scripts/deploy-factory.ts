import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const feeToSetter = process.env.FEE_TO!;
  if (!feeToSetter) throw new Error("FEE_TO env var not set");

  console.log("Deployer:", deployer.address);
  console.log("feeToSetter:", feeToSetter);

  const Factory = await ethers.getContractFactory("UniswapV2Factory");
  const factory = await Factory.deploy(feeToSetter);
  await factory.waitForDeployment();

  console.log("Factory deployed to:", await factory.getAddress());
  console.log("INIT_CODE_PAIR_HASH:", await factory.INIT_CODE_PAIR_HASH());
}

main().catch((e) => { console.error(e); process.exit(1); });
