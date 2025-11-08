"use client";
import { useEffect, useState } from "react";
import { Address, createPublicClient, http } from "viem";
import { reya } from "../../lib/reya";
import { ADDRESSES } from "../../lib/addresses";
import { IUniswapV2Factory_more, IUniswapV2Pair, IUniswapV2Pair_more } from "../../lib/abis";
import { formatToken } from "../../lib/tokens";

const client = createPublicClient({ chain: reya, transport: http() });

type Row = { pair: Address, token0: Address, token1: Address, reserve0: string, reserve1: string, totalSupply: string };

export default function Pools() {
  const [rows, setRows] = useState<Row[]>([]);
  const [status, setStatus] = useState<string>("");

  useEffect(()=>{ (async()=>{
    try {
      setStatus("Loading pairs...");
      if (!ADDRESSES.FACTORY) { setStatus("Set NEXT_PUBLIC_FACTORY in .env.local"); return; }
      const len = await client.readContract({ address: ADDRESSES.FACTORY as Address, abi: IUniswapV2Factory_more, functionName: "allPairsLength" }) as bigint;
      const n = Number(len);
      const limit = Math.min(n, 50); // cap for MVP
      const out: Row[] = [];
      for (let i=0; i<limit; i++) {
        const pair = await client.readContract({ address: ADDRESSES.FACTORY as Address, abi: IUniswapV2Factory_more, functionName: "allPairs", args: [BigInt(i)] }) as Address;
        const [token0, token1] = await Promise.all([
          client.readContract({ address: pair, abi: IUniswapV2Pair, functionName: "token0" }) as Promise<Address>,
          client.readContract({ address: pair, abi: IUniswapV2Pair, functionName: "token1" }) as Promise<Address>,
        ]);
        const [r0, r1] = await client.readContract({ address: pair, abi: IUniswapV2Pair, functionName: "getReserves" }) as any;
        const totalSupply = await client.readContract({ address: pair, abi: IUniswapV2Pair_more, functionName: "totalSupply" }) as bigint;
        out.push({ pair, token0, token1, reserve0: String(r0), reserve1: String(r1), totalSupply: String(totalSupply) });
      }
      setRows(out);
      setStatus("");
    } catch(e:any) {
      console.error(e);
      setStatus("Failed to load pairs");
    }
  })(); }, []);

  return (
    <main style={{ display:'grid', gap:16 }}>
      <div style={{ border:'1px solid #222', borderRadius:16, padding:16 }}>
        <h2 style={{ fontSize:18, fontWeight:600, marginBottom:12 }}>Pools</h2>
        {status && <div style={{ fontSize:13, opacity:0.9 }}>{status}</div>}
        <div style={{ display:'grid', gap:8 }}>
          {rows.map((r)=> (
            <div key={r.pair} style={{ display:'grid', gridTemplateColumns:'2fr 2fr 1fr 1fr 2fr', gap:8, padding:'8px 0', borderBottom:'1px solid #222' }}>
              <div>Pair: {r.pair}</div>
              <div>Tokens: {formatToken(r.token0)} / {formatToken(r.token1)}</div>
              <div>R0: {r.reserve0}</div>
              <div>R1: {r.reserve1}</div>
              <div>Total LP: {r.totalSupply}</div>
            </div>
          ))}
          {rows.length === 0 && !status && <div>No pools found.</div>}
        </div>
        <div style={{ marginTop: 24 }}>
          <h3 style={{ fontSize:16, fontWeight:600, marginBottom:8 }}>Analytics (recent)</h3>
          <AnalyticsWidget />
        </div>
      </div>
    </main>
  );
}

function AnalyticsWidget(){
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(()=>{ (async()=>{ try { const r = await fetch('/api/analytics'); const j = await r.json(); setData(j);} catch(e:any){ setError(e?.message||'failed'); } })(); }, []);
  if (error) return <div style={{ fontSize:13, opacity:0.9 }}>Error: {error}</div>;
  if (!data) return <div style={{ fontSize:13, opacity:0.8 }}>Loading…</div>;
  return <pre style={{ whiteSpace:'pre-wrap', background:'#0b0b0b', padding:12, borderRadius:10, border:'1px solid #222' }}>{JSON.stringify(data, null, 2)}</pre>;
}
