'use client';
import { useState } from 'react';
import { ethers } from 'ethers';
import { useTokenList } from './lib/tokenlist';

export function ImportTokenButton(){
  const { addToken } = useTokenList();
  const [open, setOpen] = useState(false);
  const [addr, setAddr] = useState('');
  const [status, setStatus] = useState('');

  async function onImport(){
    try{
      setStatus('Fetching…');
      // connect provider on demand
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const ERC20 = [
        { type:'function', name:'symbol', stateMutability:'view', inputs:[], outputs:[{type:'string'}] },
        { type:'function', name:'decimals', stateMutability:'view', inputs:[], outputs:[{type:'uint8'}] }
      ] as const;
      const c = new ethers.Contract(addr, ERC20, signer);
      const [sym, dec] = await Promise.all([c.symbol(), c.decimals()]);
      addToken({ address: addr as `0x${string}`, symbol: sym, decimals: Number(dec) });
      setStatus(`Imported ${sym} (${dec})`);
      setTimeout(()=>{ setOpen(false); setStatus(''); setAddr(''); }, 500);
    }catch(e:any){ setStatus(e?.message || 'Import failed'); }
  }

  return (
    <div>
      <button onClick={()=>setOpen(true)} style={{ padding:10, borderRadius:12, border:'1px solid #222', background:'rgba(255,255,255,0.06)' }}>Import Token</button>
      {open && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)', display:'grid', placeItems:'center' }}>
          <div style={{ width:360, background:'#0b0b0b', border:'1px solid #222', borderRadius:16, padding:16 }}>
            <h3 style={{ marginTop:0 }}>Import Token</h3>
            <input placeholder="0x..." value={addr} onChange={e=>setAddr(e.target.value)} style={{ width:'100%', padding:10, borderRadius:10, background:'#111', border:'1px solid #222', color:'#fff' }} />
            <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:12 }}>
              <button onClick={()=>setOpen(false)} style={{ padding:10, borderRadius:10, border:'1px solid #222' }}>Cancel</button>
              <button onClick={onImport} style={{ padding:10, borderRadius:10, border:'1px solid #222', background:'rgba(255,255,255,0.06)' }}>Import</button>
            </div>
            {status && <div style={{ marginTop:8, fontSize:12, opacity:.85 }}>{status}</div>}
            <p style={{ marginTop:8, fontSize:12, opacity:.7 }}>Warning: Double-check contract addresses.</p>
          </div>
        </div>
      )}
    </div>
  );
}