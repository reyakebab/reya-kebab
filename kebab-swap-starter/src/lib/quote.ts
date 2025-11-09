"use client";
import { Address, PublicClient, encodeAbiParameters, parseUnits, formatUnits, getAddress } from "viem";
import { publicClient } from "@/lib/contracts";
import { CAM } from "@/config/camelot";

const routerV2Abi = (await import("@/../../abi/camelotRouterV2.json")).default.abi as any;
const quoterV3Abi = (await import("@/../../abi/quoterV3.json")).default.abi as any;
const factoryV2Abi = (await import("@/../../abi/camelotFactoryV2.json")).default.abi as any;
const pairV2Abi = (await import("@/../../abi/pairV2.json")).default.abi as any;

export type QuoteResult = {
  route: "v2" | "v3";
  amountOut: bigint;
  minOut: bigint;
  priceImpactPct?: number; // undefined if not computable
};

export async function quoteExactIn({
  tokenIn, tokenOut, amountIn, slippageBps, decimalsIn, decimalsOut
}: { tokenIn: Address, tokenOut: Address, amountIn: bigint, slippageBps: number, decimalsIn: number, decimalsOut: number }): Promise<QuoteResult> {
  // Try v3 first
  try {
    if (CAM.QUOTER_V3) {
      const [amountOut] = await publicClient.readContract({
        address: CAM.QUOTER_V3,
        abi: quoterV3Abi,
        functionName: "quoteExactInputSingle",
        // Algebra uses (tokenIn, tokenOut, amountIn, limitSqrtPrice)
        args: [{ tokenIn, tokenOut, amountIn, limitSqrtPrice: 0 }]
      }) as any;
      const minOut = amountOut - (amountOut * BigInt(slippageBps) / 10000n);
      return { route: "v3", amountOut, minOut };
    }
  } catch (e) {
    // fall through to v2
  }
  // Fallback v2 single hop
  const outArr = await publicClient.readContract({
    address: CAM.ROUTER_V2,
    abi: routerV2Abi,
    functionName: "getAmountsOut",
    args: [amountIn, [tokenIn, tokenOut]]
  }) as bigint[];
  const amountOut = outArr[outArr.length - 1];
  const minOut = amountOut - (amountOut * BigInt(slippageBps) / 10000n);

  // Estimate price impact for single hop: compare mid price vs execution price
  let priceImpactPct: number | undefined = undefined;
  try {
    // get pair & reserves
    const pair = await publicClient.readContract({
      address: CAM.FACTORY_V2,
      abi: factoryV2Abi,
      functionName: "getPair",
      args: [tokenIn, tokenOut]
    }) as Address;
    if (pair && pair != "0x0000000000000000000000000000000000000000") {
      const [token0, token1] = await Promise.all([
        publicClient.readContract({ address: pair, abi: pairV2Abi, functionName: "token0", args: [] }) as Promise<Address>,
        publicClient.readContract({ address: pair, abi: pairV2Abi, functionName: "token1", args: [] }) as Promise<Address>,
      ]);
      const res = await publicClient.readContract({ address: pair, abi: pairV2Abi, functionName: "getReserves", args: [] }) as any;
      const r0 = BigInt(res[0]); const r1 = BigInt(res[1]);
      // map reserves to in/out order
      const [rIn, rOut] = (getAddress(tokenIn) === getAddress(token0)) ? [r0, r1] : [r1, r0];
      // mid price = rOut/rIn ; execution price approx = amountOut/amountIn
      const mid = Number(rOut) / Number(rIn);
      const exec = Number(amountOut) / Number(amountIn);
      if (mid > 0) priceImpactPct = Math.max(0, (1 - (exec / mid)) * 100);
    }
  } catch {}
  return { route: "v2", amountOut, minOut, priceImpactPct };
}
