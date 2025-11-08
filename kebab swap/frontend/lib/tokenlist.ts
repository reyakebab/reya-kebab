"use client";
import { useEffect, useState } from "react";
import { Address } from "viem";

export type TokenInfo = { address: Address, symbol: string, decimals: number };

function uniqByAddress(arr: TokenInfo[]): TokenInfo[] {
  const seen = new Set<string>();
  const out: TokenInfo[] = [];
  for (const t of arr) {
    const k = t.address.toLowerCase();
    if (!seen.has(k)) { seen.add(k); out.push(t); }
  }
  return out;
}

export function useTokenList() {
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  useEffect(()=>{
    (async()=>{
      try {
        const r = await fetch("/kebab.tokenlist.json");
        const j = await r.json();
        const defaults: TokenInfo[] = (j.tokens || []).map((t:any)=>({ address: t.address, symbol: t.symbol, decimals: t.decimals }));
        const customRaw = localStorage.getItem("kebab.customTokens");
        const custom: TokenInfo[] = customRaw ? JSON.parse(customRaw) : [];
        setTokens(uniqByAddress([...defaults, ...custom]));
      } catch(e){
        // fallback to custom only
        const customRaw = localStorage.getItem("kebab.customTokens");
        const custom: TokenInfo[] = customRaw ? JSON.parse(customRaw) : [];
        setTokens(custom);
      }
    })();
  }, []);

  function addToken(t: TokenInfo) {
    const customRaw = localStorage.getItem("kebab.customTokens");
    const custom: TokenInfo[] = customRaw ? JSON.parse(customRaw) : [];
    const next = uniqByAddress([...custom, t]);
    localStorage.setItem("kebab.customTokens", JSON.stringify(next));
    setTokens(prev => uniqByAddress([...prev, t]));
  }

  return { tokens, addToken };
}
