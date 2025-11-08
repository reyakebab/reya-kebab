"use client";
import { useState } from "react";
import { Address, createPublicClient, http } from "viem";
import { reya } from "../lib/reya";
import { ERC20 } from "../lib/abis";
import { useTokenList } from "../lib/tokenlist";

const client = createPublicClient({ chain: reya, transport: http() });

export function ImportTokenButton() {
  const { addToken } = useTokenList(); // using same keyspace for consistency
  const [open, setOpen] = useState(false);
  const [addr, setAddr] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  async function onImport() {
    try {
      setStatus("Fetching metadata...");
      const token = addr.trim() as Address;
      // fetch metadata
      const [symbol, decimals] = await Promise.all([
        client.readContract({ address: token, abi: ERC20, functionName: "symbol" }) as Promise<string>,
        client.readContract({ address: token, abi: ERC20, functionName: "decimals" }) as Promise<number>,
      ]);
      addToken({ address: token, symbol, decimals });
      setStatus(`Imported ${symbol} (${decimals})`);
      setTimeout(()=>{ setOpen(false); setStatus(""); setAddr(""); }, 600);
    } catch (e:any) {
      console.error(e);
      setStatus(e?.shortMessage || e?.message || "Import failed");
    }
  }

  return (
    <div style={{ display:'inline-block' }}>
      <button onClick={()=>setOpen(true)} style={{ padding:10, borderRadius:12, border:'1px solid #222', background:'rgba(255,255,255,0.06)' }}>Import Token</button>
      {open && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'grid', placeItems:'center', zIndex:50 }}>
          <div style={{ width:360, background:'#0b0b0b', border:'1px solid #222', borderRadius:16, padding:16 }}>
            <h3 style={{ fontSize:16, fontWeight:600, marginBottom:8 }}>Import Token</h3>
            <input placeholder="0x..." value={addr} onChange={(e)=>setAddr(e.target.value)} style={{ width:'100%', padding:10, borderRadius:10, background:'#111', border:'1px solid #222', color:'white' }} />
            <div style={{ display:'flex', gap:8, marginTop:12, justifyContent:'flex-end' }}>
              <button onClick={()=>setOpen(false)} style={{ padding:10, borderRadius:10, border:'1px solid #222' }}>Cancel</button>
              <button onClick={onImport} style={{ padding:10, borderRadius:10, border:'1px solid #222', background:'rgba(255,255,255,0.06)' }}>Import</button>
            </div>
            {status && <div style={{ marginTop:8, fontSize:12, opacity:0.85 }}>{status}</div>}
            <p style={{ marginTop:8, fontSize:12, opacity:0.7 }}>Warning: Anyone can deploy tokens. Double-check contract addresses.</p>
          </div>
        </div>
      )}
    </div>
  );
}
