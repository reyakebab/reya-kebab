'use client';
import { useState } from 'react';
import { ethers } from 'ethers';

export default function Connect(){
  const [addr,setAddr] = useState<string>('Connect');
  async function onClick(){
    try{
      const provider = new ethers.BrowserProvider((window as any).ethereum, { name:'reya', chainId:1729 });
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const a = await signer.getAddress();
      setAddr(a.slice(0,6)+'…'+a.slice(-4));
    }catch(e:any){ alert(e?.message || 'Failed to connect'); }
  }
  return <button onClick={onClick} style={{ padding:'10px 14px', borderRadius:12, border:'1px solid #222', background:'rgba(255,255,255,.06)', color:'#fff' }}>{addr}</button>
}