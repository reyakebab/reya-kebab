"use client";
import { useState } from "react";
import { CAM } from "@/config/camelot";
import { walletClient } from "@/lib/contracts";
import { parseUnits, getAddress } from "viem";

export default function LiquidityPage() {
  const [tokenA, setTokenA] = useState<string>("");
  const [tokenB, setTokenB] = useState<string>("");
  const [liquidity, setLiquidity] = useState<string>("");
  const [tokenId, setTokenId] = useState<string>("");

  async function removeV2() {
    if (!walletClient) return alert("Connect wallet");
    const routerAbi = (await import("@/../../abi/camelotRouterV2.json")).default.abi;
    const [account] = await walletClient.getAddresses();
    const liq = parseUnits(liquidity || "0", 18);
    const deadline = BigInt(Math.floor(Date.now()/1000) + 1200);
    const hash = await walletClient.writeContract({
      address: CAM.ROUTER_V2,
      abi: routerAbi as any,
      functionName: "removeLiquidity",
      args: [getAddress(tokenA), getAddress(tokenB), liq, liq*95n/100n, liq*95n/100n, account, deadline]
    });
    alert(`Submitted: ${hash}`);
  }

  async function collectV3() {
    if (!walletClient) return alert("Connect wallet");
    const pmAbi = (await import("@/../../abi/nonfungiblePositionManager.json")).default.abi;
    const [account] = await walletClient.getAddresses();
    const hash = await walletClient.writeContract({
      address: CAM.POSITION_MANAGER_V3,
      abi: pmAbi as any,
      functionName: "collect",
      args: [{ tokenId: BigInt(tokenId), recipient: account, amount0Max: 2n**128n-1n, amount1Max: 2n**128n-1n }]
    });
    alert(`Submitted: ${hash}`);
  }

  return (
    <div className="py-8">
      <div className="card p-6 space-y-4">
        <h2 className="text-xl font-semibold">Manage Liquidity</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input className="input" placeholder="Token A address (v2 remove)" value={tokenA} onChange={e=>setTokenA(e.target.value)} />
          <input className="input" placeholder="Token B address (v2 remove)" value={tokenB} onChange={e=>setTokenB(e.target.value)} />
          <input className="input" placeholder="LP amount (v2)" value={liquidity} onChange={e=>setLiquidity(e.target.value)} />
        </div>
        <button className="btn w-full" onClick={removeV2}>Remove Liquidity (v2)</button>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
          <input className="input" placeholder="v3 Position tokenId" value={tokenId} onChange={e=>setTokenId(e.target.value)} />
        </div>
        <button className="btn w-full" onClick={collectV3}>Collect Fees (v3)</button>
        <p className="text-xs opacity-60">This is a minimal MVP surface; add tick editors, slippage controls, and analytics next.</p>
      </div>
    </div>
  );
}
