import { ethers } from "hardhat";

// Adds liquidity for tokenA/tokenB assuming the pair exists.
// Approves router for both tokens and calls addLiquidity.
async function main() {
  const routerAddr = process.env.ROUTER!;
  const tokenA = process.env.TOKEN_A!;
  const tokenB = process.env.TOKEN_B!;
  const amountADesired = process.env.AMOUNT_A!; // units in token decimals
  const amountBDesired = process.env.AMOUNT_B!;
  const slippageBps = parseInt(process.env.SLIPPAGE_BPS || "50"); // 0.50% default
  const deadlineMins = parseInt(process.env.DEADLINE_MINS || "20");

  if (!routerAddr || !tokenA || !tokenB || !amountADesired || !amountBDesired) {
    throw new Error("Missing env: ROUTER/TOKEN_A/TOKEN_B/AMOUNT_A/AMOUNT_B");
  }

  const [signer] = await ethers.getSigners();
  const erc20 = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)"
  ];
  const router = await ethers.getContractAt([
    "function addLiquidity(address,address,uint256,uint256,uint256,uint256,address,uint256) returns (uint256,uint256,uint256)"
  ], routerAddr);

  const a = await ethers.getContractAt(erc20, tokenA);
  const b = await ethers.getContractAt(erc20, tokenB);

  const decA = await a.decimals();
  const decB = await b.decimals();

  const A = ethers.parseUnits(amountADesired, decA);
  const B = ethers.parseUnits(amountBDesired, decB);

  const minA = A - (A * BigInt(slippageBps)) / BigInt(10000);
  const minB = B - (B * BigInt(slippageBps)) / BigInt(10000);
  const deadline = Math.floor(Date.now()/1000) + deadlineMins*60;

  console.log("Approving router...");
  await (await a.approve(routerAddr, A)).wait();
  await (await b.approve(routerAddr, B)).wait();

  console.log("Adding liquidity...");
  const tx = await router.addLiquidity(tokenA, tokenB, A, B, minA, minB, signer.address, deadline);
  const rcpt = await tx.wait();
  console.log("addLiquidity tx:", rcpt?.hash);
}

main().catch((e)=>{ console.error(e); process.exit(1); });
