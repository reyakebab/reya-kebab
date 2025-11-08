"use client";
import { useState } from "react";

export function Settings({ onChange }: { onChange: (p: { slippageBps: number, deadlineMins: number }) => void }) {
  const [slip, setSlip] = useState(50); // 0.50%
  const [dl, setDl] = useState(20);
  return (
    <div style={{ display:'flex', gap:12, alignItems:'center' }}>
      <label style={{ display:'flex', gap:6, alignItems:'center' }}>
        <span style={{ opacity:0.8, fontSize:12 }}>Slippage</span>
        <input type="number" min={1} max={1000} value={slip} onChange={(e)=>{const v=Number(e.target.value); setSlip(v); onChange({ slippageBps: v, deadlineMins: dl});}} style={{ width:80, padding:6, borderRadius:8, background:'#111', border:'1px solid #222', color:'white' }}/>
        <span style={{ opacity:0.6, fontSize:12 }}>bps</span>
      </label>
      <label style={{ display:'flex', gap:6, alignItems:'center' }}>
        <span style={{ opacity:0.8, fontSize:12 }}>Deadline</span>
        <input type="number" min={1} max={180} value={dl} onChange={(e)=>{const v=Number(e.target.value); setDl(v); onChange({ slippageBps: slip, deadlineMins: v});}} style={{ width:80, padding:6, borderRadius:8, background:'#111', border:'1px solid #222', color:'white' }}/>
        <span style={{ opacity:0.6, fontSize:12 }}>min</span>
      </label>
    </div>
  );
}
