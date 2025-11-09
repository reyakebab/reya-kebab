"use client";
import { useEffect, useState } from "react";
type Token = { address: string; symbol: string; decimals: number; name?: string; logoURI?: string };

export function TokenSelect({ value, onChange }: { value?: Token; onChange: (t: Token)=>void }) {
  const [tokens, setTokens] = useState<Token[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/tokenlist/reya.json");
        const list = await res.json();
        const custom = JSON.parse(localStorage.getItem("kebab.tokens.custom[1729]") || "[]");
        setTokens([...(list.tokens||[]), ...custom]);
      } catch {}
    }
    load();
  }, []);

  return (
    <button className="input w-full flex items-center justify-between" onClick={() => {
      const addr = prompt("Paste token address (0x...)");
      if (!addr) return;
      const t: Token = { address: addr, symbol: "UNKNOWN", decimals: 18 };
      const current = JSON.parse(localStorage.getItem("kebab.tokens.custom[1729]") || "[]");
      const merged = [...current, t];
      localStorage.setItem("kebab.tokens.custom[1729]", JSON.stringify(merged));
      onChange(t);
    }}>
      <span>{value?.symbol || "Select / Import Token"}</span>
      <span className="opacity-70 text-xs">Unverified allowed</span>
    </button>
  );
}
