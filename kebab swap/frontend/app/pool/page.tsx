'use client';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { ADDR } from '../../lib/addresses';
import { IUniswapV2Factory, IUniswapV2Pair } from '../../lib/abis';

export default function Pools(){
  const [rows, setRows] = useState<string[]>([]);
  const [status, setStatus] = useState('');

  useEffect(()=>{ (async()=>{
    try{
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const f = new ethers.Contract(ADDR.FACTORY, IUniswapV2Factory, signer);
      const len = Number(await f.allPairsLength());
      const n = Math.min(len, 25);
      const lines: string[] = [];
      for (let i=0;i<n;i++){
        const p = await f.allPairs(i);
        const pc = new ethers.Contract(p, IUniswapV2Pair, signer);
        const [t0, t1] = [await pc.token0(), await pc.token1()];
        const [r0, r1] = await pc.getReserves();
        const short = (a:string)=> a.slice(0,6)+'…'+a.slice(-4);
        lines.push(`${short(p)} | ${short(t0)} / ${short(t1)} | R0 ${r0} | R1 ${r1}`);
      }
      setRows(lines); setStatus('');
    }catch(e:any){ setStatus(e?.message || 'Failed to load pairs'); }
  })(); }, []);

  return (
    <main style={{ display:'grid', gap:16 }}>
      <div style={{ border:'1px solid #222', borderRadius:16, padding:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
          <h2 style={{ margin:0 }}>Pools</h2>
          <span style={{ padding:'2px 6px', background:'#1e3a8a', borderRadius:999 }}>Camelot</span>
        </div>
        {rows.map((r,i)=>(<div key={i} style={{ borderBottom:'1px solid #222', padding:'6px 0', fontSize:12 }}>{r}</div>))}
        {status && <div style={{ fontSize:12, marginTop:8 }}>{status}</div>}
      </div>
    </main>
  );
}
