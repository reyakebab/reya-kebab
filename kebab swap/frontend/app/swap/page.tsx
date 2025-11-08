"use client";
import { useEffect, useMemo, useState } from "react";
import { Address, formatUnits, parseUnits, createPublicClient, http, encodeFunctionData } from "viem";
import { useAccount, useWalletClient } from "wagmi";
import { reya } from "../../lib/reya";
import { ADDRESSES } from "../../lib/addresses";
import { ERC20, IUniswapV2Factory, IUniswapV2Pair, IUniswapV2Router02, IUniswapV2Router02_more } from "../../lib/abis";
import { useTokenList } from "../../lib/tokenlist";
import { ImportTokenButton } from "../../components-import-token";
import { Settings } from "../../components-settings";

const WETH = ADDRESSES.WETH as Address;
const KEBAB = ADDRESSES.KEBAB as Address;
const RUSD = ADDRESSES.RUSD as Address;
const client = createPublicClient({ chain: reya, transport: http() });

async function getDecimals(token: Address) {
  if (token.toLowerCase() === WETH.toLowerCase()) return 18;
  try {
    return await client.readContract({ address: token, abi: ERC20, functionName: "decimals" }) as number;
  } catch { return 18; }
}

export default function Swap() {
  const { address, isConnected } = useAccount();
  const { data: wallet } = useWalletClient({ chainId: reya.id });

  const [amountIn, setAmountIn] = useState("1");
  const [tokenIn, setTokenIn] = useState<Address>(WETH);
  const [tokenOut, setTokenOut] = useState<Address>(KEBAB);
  const [decIn, setDecIn] = useState<number>(18);
  const [decOut, setDecOut] = useState<number>(18);

  const [quote, setQuote] = useState<string>("-");
  const [status, setStatus] = useState<string>("");
  const [slippageBps, setSlippageBps] = useState(50);
  const [deadlineMins, setDeadlineMins] = useState(20);

  const { tokens } = useTokenList();
  const path = useMemo(()=>[tokenIn, tokenOut], [tokenIn, tokenOut]);

  useEffect(() => { (async () => {
    setDecIn(await getDecimals(tokenIn));
    setDecOut(await getDecimals(tokenOut));
  })(); }, [tokenIn, tokenOut]);

  useEffect(() => { (async () => {
    try {
      const amt = parseUnits(amountIn || "0", decIn);
      if (amt === 0n) { setQuote("-"); return; }

      if (ADDRESSES.ROUTER) {
        const amounts = await client.readContract({
          address: ADDRESSES.ROUTER as Address,
          abi: IUniswapV2Router02,
          functionName: "getAmountsOut",
          args: [amt, path]
        });
        setQuote(formatUnits(amounts[1], decOut));
        return;
      }
      if (!ADDRESSES.FACTORY) { setQuote("?"); return; }
      const pairAddr = await client.readContract({
        address: ADDRESSES.FACTORY as Address,
        abi: IUniswapV2Factory,
        functionName: "getPair",
        args: [path[0], path[1]]
      }) as Address;
      if (pairAddr === "0x0000000000000000000000000000000000000000") { setQuote("No pair"); return; }
      const [r0, r1] = await client.readContract({ address: pairAddr, abi: IUniswapV2Pair, functionName: "getReserves" }) as any;
      const token0 = await client.readContract({ address: pairAddr, abi: IUniswapV2Pair, functionName: "token0" }) as Address;
      const [reserveIn, reserveOut] = tokenIn.toLowerCase() === token0.toLowerCase() ? [r0, r1] : [r1, r0];
      const amountInWithFee = amt * 997n / 1000n;
      const numerator = amountInWithFee * reserveOut;
      const denominator = reserveIn + amountInWithFee;
      const amountOut = numerator / denominator;
      setQuote(formatUnits(amountOut, decOut));
    } catch (e) {
      setQuote("—");
      console.error(e);
    }
  })(); }, [amountIn, path, decIn, decOut]);

  async function ensureApproval(token: Address, spender: Address, amount: bigint) {
    if (!wallet || !address) return;
    const allowance = await client.readContract({ address: token, abi: ERC20, functionName: "allowance", args: [address, spender] }) as bigint;
    if (allowance >= amount) return;
    const data = encodeFunctionData({ abi: ERC20, functionName: "approve", args: [spender, amount] });
    await wallet.sendTransaction({ to: token, data });
  }

  async function onSwap() {
    try {
      if (!isConnected || !wallet) { setStatus("Connect wallet"); return; }
      if (!ADDRESSES.ROUTER) { setStatus("Router address not set"); return; }

      const amtIn = parseUnits(amountIn || "0", decIn);
      const deadline = BigInt(Math.floor(Date.now()/1000 + deadlineMins*60));

      const amounts = await client.readContract({
        address: ADDRESSES.ROUTER as Address,
        abi: IUniswapV2Router02,
        functionName: "getAmountsOut",
        args: [amtIn, path]
      });
      const out = amounts[1] as bigint;
      const minOut = out - (out * BigInt(slippageBps)) / BigInt(10000);

      if (tokenIn === WETH) {
        const data = encodeFunctionData({
          abi: IUniswapV2Router02_more,
          functionName: "swapExactETHForTokens",
          args: [minOut, path, address as Address, deadline]
        });
        await wallet.sendTransaction({ to: ADDRESSES.ROUTER as Address, data, value: amtIn });
      } else if (tokenOut === WETH) {
        await ensureApproval(tokenIn, ADDRESSES.ROUTER as Address, amtIn);
        const data = encodeFunctionData({
          abi: IUniswapV2Router02_more,
          functionName: "swapExactTokensForETH",
          args: [amtIn, minOut, path, address as Address, deadline]
        });
        await wallet.sendTransaction({ to: ADDRESSES.ROUTER as Address, data });
      } else {
        await ensureApproval(tokenIn, ADDRESSES.ROUTER as Address, amtIn);
        const data = encodeFunctionData({
          abi: IUniswapV2Router02,
          functionName: "swapExactTokensForTokens",
          args: [amtIn, minOut, path, address as Address, deadline]
        });
        await wallet.sendTransaction({ to: ADDRESSES.ROUTER as Address, data });
      }
      setStatus("Swap sent! Check wallet/ explorer.");
    } catch (e:any) {
      console.error(e);
      setStatus(e?.shortMessage || e?.message || "Swap failed");
    }
  }

  return (
    <main style={{ display: 'grid', gap: 16 }}>
      <div style={{ border: '1px solid #222', borderRadius: 16, padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <img src="/branding/kebab.png" alt="Kebab" width={28} height={28} />
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>Swap</h2>
          <div style={{ marginLeft:'auto' }}>
            <Settings onChange={({ slippageBps, deadlineMins }) => { /* @ts-ignore */ setSlippageBps(slippageBps); /* @ts-ignore */ setDeadlineMins(deadlineMins); }} />
          </div>
        </div>
        <div style={{ display: 'grid', gap: 12 }}>
          <label>
            <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>Amount In</div>
            <input value={amountIn} onChange={(e)=>setAmountIn(e.target.value)} placeholder="0.0"
              style={{ width: '100%', padding: 12, borderRadius: 12, background: '#111', border: '1px solid #222', color: 'white' }}/>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <select value={tokenIn} onChange={(e)=>setTokenIn(e.target.value as Address)} style={{ padding: 12, borderRadius: 12, background: '#111', border: '1px solid #222', color: 'white' }}>
              {tokens.map(t => <option key={t.address} value={t.address as Address}>{t.symbol} ({t.decimals})</option>)}
            </select>
            <select value={tokenOut} onChange={(e)=>setTokenOut(e.target.value as Address)} style={{ padding: 12, borderRadius: 12, background: '#111', border: '1px solid #222', color: 'white' }}>
              {tokens.map(t => <option key={t.address} value={t.address as Address}>{t.symbol} ({t.decimals})</option>)}
            </select>
          </div>
          <div style={{ fontSize: 14, opacity: 0.8 }}>Quote (est.): {quote}</div>
          <button onClick={onSwap} style={{ padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid #222' }}>
            {isConnected ? "Swap" : "Connect & Swap"}
          </button>
          {status && <div style={{ fontSize: 13, opacity: 0.9 }}>{status}</div>}
        </div>
      </div>
    </main>
  );
}
