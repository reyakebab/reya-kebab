import { ethers } from "hardhat";

// Swaps exact tokens for tokens along a simple 2-token path [tokenIn, tokenOut]
async function main() {
  const routerAddr = process.env.ROUTER!;
  const tokenIn = process.env.TOKEN_IN!;
  const tokenOut = process.env.TOKEN_OUT!;
  const amountInStr = process.env.AMOUNT_IN!;
  const slippageBps = parseInt(process.env.SLIPPAGE_BPS || "50"); // 0.50%
  const deadlineMins = parseInt(process.env.DEADLINE_MINS || "20");

  if (!routerAddr || !tokenIn || !tokenOut || !amountInStr) {
    throw new Error("Missing env: ROUTER/TOKEN_IN/TOKEN_OUT/AMOUNT_IN");
  }

  const [signer] = await ethers.getSigners();
  const erc20 = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)"
  ];

  const router = await ethers.getContractAt([
    "function getAmountsOut(uint256 amountIn, address[] calldata path) view returns (uint256[])",
    "function swapExactTokensForTokens(uint256,uint256,address[] calldata,address,uint256) returns (uint256[])"
  ], routerAddr);

  const token = await ethers.getContractAt(erc20, tokenIn);
  const decIn = await token.decimals();
  const amountIn = ethers.parseUnits(amountInStr, decIn);

  const path = [tokenIn, tokenOut];
  const amounts = await router.getAmountsOut(amountIn, path);
  const minOut = amounts[1] - (amounts[1] * BigInt(slippageBps)) / BigInt(10000);
  const deadline = Math.floor(Date.now()/1000) + deadlineMins*60;

  console.log("Approving router...");
  await (await token.approve(routerAddr, amountIn)).wait();

  console.log("Swapping...");
  const tx = await router.swapExactTokensForTokens(amountIn, minOut, path, signer.address, deadline);
  const rcpt = await tx.wait();
  console.log("swap tx:", rcpt?.hash);
}

main().catch((e)=>{ console.error(e); process.exit(1); });
