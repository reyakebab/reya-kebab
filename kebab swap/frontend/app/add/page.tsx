"use client";
import { useMemo, useState } from "react";
import { Address, encodeFunctionData, parseUnits, createPublicClient, http } from "viem";
import { useAccount, useWalletClient } from "wagmi";
import { reya } from "../../lib/reya";
import { ADDRESSES } from "../../lib/addresses";
import { IUniswapV2Router02 } from "../../lib/abis";

const WETH = ADDRESSES.WETH as Address;
const RUSD = ADDRESSES.RUSD as Address;

const client = createPublicClient({ chain: reya, transport: http() });
export default function Add() {
  const { tokens } = useTokenList();
  const { address, isConnected } = useAccount();
  const { data: wallet } = useWalletClient({ chainId: reya.id });
  const [tokenA, setTokenA] = useState<Address>(WETH);
  const [tokenB, setTokenB] = useState<Address>(ADDRESSES.KEBAB as Address);
  const [amountA, setAmountA] = useState("0");
  const [amountB, setAmountB] = useState("0");
  const [decA, setDecA] = useState<number>(18);
  const [decB, setDecB] = useState<number>(18);
  const [amountB, setAmountB] = useState("0");
  const [status, setStatus] = useState("");

  const isEthPair = useMemo(()=> tokenA === WETH || tokenB === WETH, [tokenA, tokenB]);

  useEffect(()=>{(async()=>{ try { const dA = tokenA===WETH?18:await client.readContract({ address: tokenA, abi: ERC20, functionName: 'decimals' }) as number; const dB = tokenB===WETH?18:await client.readContract({ address: tokenB, abi: ERC20, functionName: 'decimals' }) as number; setDecA(dA); setDecB(dB);} catch(e){} })();}, [tokenA, tokenB]);

  async function onCreatePool() {
    if (!isConnected || !wallet) { setStatus("Connect wallet first"); return; }
    if (!ADDRESSES.ROUTER) { setStatus("Router address not set"); return; }

    try {
      setStatus("Preparing tx...");
      const deadline = BigInt(Math.floor(Date.now()/1000 + 20*60));
      const amtA = parseUnits(amountA || "0", decA);
      const amtB = parseUnits(amountB || "0", decB);
      const minA = (amtA * 995n) / 1000n; // 0.5% slippage
      const minB = (amtB * 995n) / 1000n;

      if (isEthPair) {
        // If tokenA is WETH, then (ETH, token) = (ETH, tokenB); else ETH with tokenA
        const token = tokenA === WETH ? tokenB : tokenA;
        const tokenAmount = tokenA === WETH ? amtB : amtA;
        const tokenMin = tokenA === WETH ? minB : minA;
        const ethAmount = tokenA === WETH ? amtA : amtB;

        // Approve token to router
        const erc20Approve = {
          to: token,
          data: "0x095ea7b3" + ADDRESSES.ROUTER.replace("0x","").rjust(64,"0") + hexBigInt(tokenAmount).rjust(64,"0")
        };
        await wallet.sendTransaction({ to: erc20Approve.to, data: erc20Approve.data });

        // addLiquidityETH(address token,uint amountTokenDesired,uint amountTokenMin,uint amountETHMin,address to,uint deadline)
        const data = encodeFunctionData({
          abi: IUniswapV2Router02,
          functionName: "addLiquidityETH",
          args: [token, tokenAmount, tokenMin, tokenMin, address as Address, deadline]
        } as any);
        await wallet.sendTransaction({ to: ADDRESSES.ROUTER as Address, data, value: ethAmount });
      } else {
        // Approve both tokens
        const approve = async (token: Address, amount: bigint) => {
          const data = "0x095ea7b3" + ADDRESSES.ROUTER.replace("0x","").padStart(64,"0") + amount.toString(16).padStart(64,"0");
          await wallet.sendTransaction({ to: token, data });
        };
        await approve(tokenA, amtA);
        await approve(tokenB, amtB);

        // addLiquidity(address,address,uint,uint,uint,uint,address,uint)
        const data = encodeFunctionData({
          abi: IUniswapV2Router02,
          functionName: "addLiquidity",
          args: [tokenA, tokenB, amtA, amtB, minA, minB, address as Address, deadline]
        });
        await wallet.sendTransaction({ to: ADDRESSES.ROUTER as Address, data });
      }

      setStatus("Submitted! Check wallet/ explorer.");
    } catch (e:any) {
      console.error(e);
      setStatus(e?.shortMessage || e?.message || "Tx failed");
    }
  }

  return (
    <main style={{ display:'grid', gap:16 }}>
      <div style={{ border:'1px solid #222', borderRadius:16, padding:16 }}>
        <h2 style={{ fontSize:18, fontWeight:600, marginBottom:12 }}>Create Pool / Add Liquidity</h2>
        <div style={{ display:'grid', gap:12 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <select value={tokenA} onChange={(e)=>setTokenA(e.target.value as Address)} style={{ padding:12, borderRadius:12, background:'#111', border:'1px solid #222', color:'white' }}>
              <option value={WETH}>WETH</option>
              <option value={RUSD}>RUSD</option>
              <option value={ADDRESSES.KEBAB as Address}>KEBAB</option>
              <option value={RUSD}>RUSD</option>
            </select>
            <select value={tokenB} onChange={(e)=>setTokenB(e.target.value as Address)} style={{ padding:12, borderRadius:12, background:'#111', border:'1px solid #222', color:'white' }}>
              <option value={ADDRESSES.KEBAB as Address}>KEBAB</option>
              <option value={RUSD}>RUSD</option>
              <option value={WETH}>WETH</option>
              <option value={RUSD}>RUSD</option>
            </select>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <input placeholder="Amount A" value={amountA} onChange={(e)=>setAmountA(e.target.value)} style={{ padding:12, borderRadius:12, background:'#111', border:'1px solid #222', color:'white' }} />
            <input placeholder="Amount B" value={amountB} onChange={(e)=>setAmountB(e.target.value)} style={{ padding:12, borderRadius:12, background:'#111', border:'1px solid #222', color:'white' }} />
          </div>
          {!isConnected && <div style={{ fontSize:12, opacity:0.8 }}>Connect your wallet to proceed.</div>}
          <button onClick={onCreatePool} style={{ padding:12, borderRadius:12, background:'rgba(255,255,255,0.06)', border:'1px solid #222' }}>
            Create Pool / Add Liquidity
          </button>
          {status && <div style={{ fontSize:13, opacity:0.9 }}>{status}</div>}
          <p style={{ fontSize:12, opacity:0.7 }}>Tip: Creating the pool happens automatically when you add liquidity for a new pair.</p>
        </div>
      </div>
    </main>
  );
}

// helper for approvals
function hexBigInt(v: bigint) {
  return v.toString(16);
}
