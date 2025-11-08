'use client';
import { useState } from 'react';
export function Settings({ onChange }: { onChange: (p:{ slippageBps:number, deadlineMins:number })=>void }){
  const [slip, setSlip] = useState(50); const [dl, setDl] = useState(20);
  return (
    <div style={{ display:'flex', gap:12, alignItems:'center' }}>
      <label>Slippage <input type="number" min={1} max={1000} value={slip} onChange={e=>{const v=Number(e.target.value); setSlip(v); onChange({ slippageBps:v, deadlineMins:dl });}} style={{ width:80, padding:6, borderRadius:8, background:'#111', border:'1px solid #222', color:'#fff', marginLeft:6 }} /> bps</label>
      <label>Deadline <input type="number" min={1} max={180} value={dl} onChange={e=>{const v=Number(e.target.value); setDl(v); onChange({ slippageBps:slip, deadlineMins:v });}} style={{ width:80, padding:6, borderRadius:8, background:'#111', border:'1px solid #222', color:'#fff', marginLeft:6 }} /> min</label>
    </div>
  );
}