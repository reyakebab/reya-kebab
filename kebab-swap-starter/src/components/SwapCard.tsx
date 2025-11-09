"use client";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { TokenSelect } from "./TokenSelect";
import { SlippageControl } from "./SlippageControl";
import { PriceImpact } from "./PriceImpact";
import { quoteExactIn } from "@/lib/quote";
import { parseUnits, formatUnits } from "viem";

export function SwapCard() {
  const [tokenIn, setTokenIn] = useState<any>();
  const [tokenOut, setTokenOut] = useState<any>();
  const [amount, setAmount] = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const doQuote = async () => {
      try {
        if (!tokenIn?.address || !tokenOut?.address || !amount) { setQuote(null); return; }
        setLoading(true);
        const amtIn = parseUnits(amount, tokenIn.decimals || 18);
        const q = await quoteExactIn({
          tokenIn: tokenIn.address, tokenOut: tokenOut.address,
          amountIn: amtIn, slippageBps: Math.round(slippage*100),
          decimalsIn: tokenIn.decimals || 18, decimalsOut: tokenOut.decimals || 18
        });
        setQuote(q);
      } catch (e) {
        setQuote(null);
      } finally {
        setLoading(false);
      }
    };
    doQuote();
  }, [tokenIn, tokenOut, amount, slippage]);

  return (
    <motion.div className="card p-6 space-y-4" whileHover={{ scale: 1.01 }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/branding/kebab.png" alt="Kebab" width={28} height={28} className="rounded-xl" />
          <h2 className="text-xl font-semibold">Swap</h2>
        </div>
        <SlippageControl value={slippage} onChange={setSlippage} />
      </div>

      <div className="space-y-2">
        <label className="text-xs opacity-70">From</label>
        <TokenSelect value={tokenIn} onChange={setTokenIn} />
        <input className="input w-full mt-2" placeholder="0.0" value={amount} onChange={e=>setAmount(e.target.value)} />
      </div>
      <div className="space-y-2">
        <label className="text-xs opacity-70">To</label>
        <TokenSelect value={tokenOut} onChange={setTokenOut} />
      </div>

      <div className="text-sm opacity-80">
        {loading ? "Quoting…" : quote ? (
          <div className="space-y-1">
            <div>Route: {quote.route.toUpperCase()}</div>
            <div>Estimated out: {formatUnits(quote.amountOut, tokenOut?.decimals || 18)}</div>
            <div>Min received (slippage {slippage}%): {formatUnits(quote.minOut, tokenOut?.decimals || 18)}</div>
            <PriceImpact pct={quote.priceImpactPct} />
          </div>
        ) : <div>Enter an amount and tokens to see a quote.</div>}
      </div>

      <button className="btn w-full mt-2">Connect wallet to swap</button>
      <p className="text-xs opacity-60">Routing via Camelot (v3 → v2 fallback)</p>
    </motion.div>
  );
}
