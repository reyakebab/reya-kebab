"use client";
import { useState } from "react";
import { CAM } from "@/config/camelot";
import { publicClient, walletClient, erc20Abi, ensureApproval } from "@/lib/contracts";
import { parseUnits, getAddress } from "viem";

export default function CreatePage() {
  const [tokenA, setTokenA] = useState<string>("");
  const [tokenB, setTokenB] = useState<string>("");
  const [amountA, setAmountA] = useState<string>("");
  const [amountB, setAmountB] = useState<string>("");
  const [mode, setMode] = useState<"v2"|"v3">("v2");

  async function createV2() {
    if (!walletClient) return alert("Connect wallet");
    const [account] = await walletClient.getAddresses();
    // Optional: call factory.getPair then factory.createPair if zero address
    // Then router.addLiquidity
    const amtA = parseUnits(amountA || "0", 18);
    const amtB = parseUnits(amountB || "0", 18);
    await ensureApproval(getAddress(tokenA) as `0x${string}`, account, CAM.ROUTER_V2, amtA);
    await ensureApproval(getAddress(tokenB) as `0x${string}`, account, CAM.ROUTER_V2, amtB);
    const routerAbi = (await import("@/../../abi/camelotRouterV2.json")).default.abi;
    const deadline = BigInt(Math.floor(Date.now()/1000) + 1200);
    const hash = await walletClient!.writeContract({
      address: CAM.ROUTER_V2,
      abi: routerAbi as any,
      functionName: "addLiquidity",
      args: [getAddress(tokenA), getAddress(tokenB), amtA, amtB, amtA*95n/100n, amtB*95n/100n, account, deadline]
    });
    alert(`Submitted: ${hash}`);
  }

  async function createV3() {
    if (!walletClient) return alert("Connect wallet");
    const [account] = await walletClient.getAddresses();
    const pmAbi = (await import("@/../../abi/nonfungiblePositionManager.json")).default.abi;
    const amtA = parseUnits(amountA || "0", 18);
    const amtB = parseUnits(amountB || "0", 18);
    await ensureApproval(getAddress(tokenA) as `0x${string}`, account, CAM.POSITION_MANAGER_V3, amtA);
    await ensureApproval(getAddress(tokenB) as `0x${string}`, account, CAM.POSITION_MANAGER_V3, amtB);
    const deadline = BigInt(Math.floor(Date.now()/1000) + 1200);
    // For demo: use wide ticks [-887220, 887220] equivalent in Algebra (int24). Replace with UI tick calc.
    const tickLower = -887220; const tickUpper = 887220;
    const hash = await walletClient!.writeContract({
      address: CAM.POSITION_MANAGER_V3,
      abi: pmAbi as any,
      functionName: "mint",
      args: [{
        token0: getAddress(tokenA), token1: getAddress(tokenB),
        tickLower, tickUpper,
        amount0Desired: amtA, amount1Desired: amtB,
        amount0Min: amtA*95n/100n, amount1Min: amtB*95n/100n,
        recipient: account, deadline
      }]
    });
    alert(`Submitted: ${hash}`);
  }

  return (
    <div className="py-8">
      <div className="card p-6 space-y-4">
        <h2 className="text-xl font-semibold">Create Pool / Provide Liquidity</h2>
        <div className="flex gap-2">
          <button className={`tab ${mode==='v2' ? 'tab-active' : ''}`} onClick={()=>setMode('v2')}>v2 (pairs)</button>
          <button className={`tab ${mode==='v3' ? 'tab-active' : ''}`} onClick={()=>setMode('v3')}>v3 (concentrated)</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input className="input" placeholder="Token A address (0x...)" value={tokenA} onChange={e=>setTokenA(e.target.value)} />
          <input className="input" placeholder="Token B address (0x...)" value={tokenB} onChange={e=>setTokenB(e.target.value)} />
          <input className="input" placeholder="Amount A" value={amountA} onChange={e=>setAmountA(e.target.value)} />
          <input className="input" placeholder="Amount B" value={amountB} onChange={e=>setAmountB(e.target.value)} />
        </div>
        {mode === "v2" ? (
          <button className="btn w-full" onClick={createV2}>Create/Add Liquidity (v2)</button>
        ) : (
          <button className="btn w-full" onClick={createV3}>Create/Mint Position (v3)</button>
        )}
        <p className="text-xs opacity-60">Uses env-configured Camelot addresses. Slippage hard-coded to 5% for MVP.</p>
      </div>
    </div>
  );
}
