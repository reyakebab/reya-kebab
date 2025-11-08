"use client";
import { useEffect, useMemo, useState } from "react";
import { Address, createPublicClient, encodeFunctionData, formatUnits, http, parseUnits } from "viem";
import { useAccount, useWalletClient } from "wagmi";
import { reya } from "../../lib/reya";
import { ADDRESSES } from "../../lib/addresses";
import { ERC20, ERC20_more, IUniswapV2Factory, IUniswapV2Pair, IUniswapV2Pair_more, IUniswapV2Router02_more } from "../../lib/abis";
import { Settings } from "../../components-settings";

const client = createPublicClient({ chain: reya, transport: http() });
const WETH = ADDRESSES.WETH as Address;

async function getDecimals(token: Address) {
  if (token.toLowerCase() === WETH.toLowerCase()) return 18;
  try { return await client.readContract({ address: token, abi: ERC20, functionName: "decimals" }) as number; } catch { return 18; }
}

export default function Remove() {
  const { address, isConnected } = useAccount();
  const { data: wallet } = useWalletClient({ chainId: reya.id });

  const [token, setToken] = useState<Address>(ADDRESSES.KEBAB as Address);
  const [lp, setLp] = useState<Address | null>(null);
  const [lpBalance, setLpBalance] = useState<bigint>(0n);
  const [lpDecimals, setLpDecimals] = useState<number>(18);
  const [decToken, setDecToken] = useState<number>(18);
  const [reserves, setReserves] = useState<[bigint,bigint] | null>(null);
  const [pct, setPct] = useState<number>(100);
  const [status, setStatus] = useState<string>("");
  const [slippageBps, setSlippageBps] = useState(50);
  const [deadlineMins, setDeadlineMins] = useState(20);

  // Resolve pair and balances
  useEffect(()=>{ (async()=>{
    try {
      setStatus("Resolving pair...");
      const pair = await client.readContract({
        address: ADDRESSES.FACTORY as Address,
        abi: IUniswapV2Factory,
        functionName: "getPair",
        args: [token, WETH]
      }) as Address;
      if (pair === "0x0000000000000000000000000000000000000000") { setLp(null); setStatus("Pair not found. Create it on /add."); return; }
      setLp(pair);
      const [r0, r1] = await client.readContract({ address: pair, abi: IUniswapV2Pair, functionName: "getReserves" }) as any;
      const token0 = await client.readContract({ address: pair, abi: IUniswapV2Pair, functionName: "token0" }) as Address;
      const rs = token.toLowerCase() === token0.toLowerCase() ? [r0, r1] : [r1, r0];
      setReserves([rs[0], rs[1]] as [bigint,bigint]);
      const bal = await client.readContract({ address: pair, abi: ERC20_more, functionName: "balanceOf", args: [address as Address] }) as bigint;
      setLpBalance(bal);
      // LP decimals are 18 in v2; but read for safety
      const d = await client.readContract({ address: pair, abi: ERC20, functionName: "decimals" }) as number;
      setLpDecimals(d);
      setDecToken(await getDecimals(token));
      setStatus("");
    } catch(e:any) { console.error(e); setStatus("Failed to resolve pair/balances"); }
  })(); }, [token, address]);

  const lpToRemove = useMemo(()=> (lpBalance * BigInt(pct)) / 100n, [lpBalance, pct]);

  async function ensureApproval(tokenAddr: Address, spender: Address, amount: bigint) {
    if (!wallet || !address) return;
    const allowance = await client.readContract({ address: tokenAddr, abi: ERC20, functionName: "allowance", args: [address, spender] }) as bigint;
    if (allowance >= amount) return;
    const data = encodeFunctionData({ abi: ERC20, functionName: "approve", args: [spender, amount] });
    await wallet.sendTransaction({ to: tokenAddr, data });
  }

  async function onRemove() {
    try {
      if (!isConnected || !wallet) { setStatus("Connect wallet"); return; }
      if (!ADDRESSES.ROUTER) { setStatus("Router address not set"); return; }
      if (!lp || lpToRemove === 0n) { setStatus("Nothing to remove"); return; }

      setStatus("Calculating min amounts...");
      // Rough min amounts from reserves proportional to liquidity share
      // amountToken = lpToRemove / totalSupply * reserveToken; same for ETH
      const totalSupply = await client.readContract({ address: lp, abi: IUniswapV2Pair_more, functionName: "totalSupply" }) as bigint;
      const token0 = await client.readContract({ address: lp, abi: IUniswapV2Pair, functionName: "token0" }) as Address;
      const [r0, r1] = await client.readContract({ address: lp, abi: IUniswapV2Pair, functionName: "getReserves" }) as any;
      const [reserveToken, reserveETH] = token.toLowerCase() === token0.toLowerCase() ? [r0, r1] : [r1, r0];

      const estToken = (lpToRemove * reserveToken) / totalSupply;
      const estETH = (lpToRemove * reserveETH) / totalSupply;
      const minToken = estToken - (estToken * BigInt(slippageBps)) / BigInt(10000);
      const minETH = estETH - (estETH * BigInt(slippageBps)) / BigInt(10000);

      setStatus("Approving LP...");
      await ensureApproval(lp, ADDRESSES.ROUTER as Address, lpToRemove);

      setStatus("Submitting removeLiquidityETH...");
      const deadline = BigInt(Math.floor(Date.now()/1000 + deadlineMins*60));
      const data = encodeFunctionData({
        abi: IUniswapV2Router02_more,
        functionName: "removeLiquidityETH",
        args: [token, lpToRemove, minToken, minETH, address as Address, deadline]
      });
      await wallet.sendTransaction({ to: ADDRESSES.ROUTER as Address, data });
      setStatus("Remove submitted! Check wallet/explorer.");
    } catch(e:any) {
      console.error(e);
      setStatus(e?.shortMessage || e?.message || "Remove failed");
    }
  }

  return (
    <main style={{ display:'grid', gap:16 }}>
      <div style={{ border:'1px solid #222', borderRadius:16, padding:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
          <h2 style={{ fontSize:18, fontWeight:600 }}>Remove Liquidity (WETH–Token)</h2>
          <div style={{ marginLeft:'auto' }}>
            <Settings onChange={({ slippageBps, deadlineMins }) => { /* @ts-ignore */ 0; }} />
          </div>
        </div>
        <div style={{ display:'grid', gap:12 }}>
          <label>Token
            <select value={token} onChange={(e)=>setToken(e.target.value as Address)} style={{ marginLeft:8, padding:8, borderRadius:10, background:'#111', border:'1px solid #222', color:'white' }}>
              <option value={ADDRESSES.KEBAB as Address}>KEBAB</option>
              <option value={ADDRESSES.RUSD as Address}>RUSD</option>
            </select>
          </label>
          <div style={{ fontSize:13, opacity:0.8 }}>
            LP balance: {formatUnits(lpBalance, lpDecimals)} | Pair: {lp ?? "—"}
          </div>
          <label>Remove %
            <input type="range" min="1" max="100" value={pct} onChange={(e)=>setPct(parseInt(e.target.value))} style={{ width: '100%' }} />
            <span> {pct}%</span>
          </label>
          <button onClick={onRemove} style={{ padding:12, borderRadius:12, background:'rgba(255,255,255,0.06)', border:'1px solid #222' }}>
            {isConnected ? "Remove Liquidity" : "Connect to Remove"}
          </button>
          {status && <div style={{ fontSize:13, opacity:0.9 }}>{status}</div>}
        </div>
      </div>
    </main>
  );
}
