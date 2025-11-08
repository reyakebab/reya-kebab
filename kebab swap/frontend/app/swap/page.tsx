'use client';
import { useEffect, useMemo, useState } from 'react';
import { ethers } from 'ethers';
import { ADDR } from '../../lib/addresses';
import { IUniswapV2Router02, IUniswapV2Router02_more, ERC20 } from '../../lib/abis';
import { useTokenList } from '../../lib/tokenlist';

export default function Swap(){
  const { tokens } = useTokenList();
  const [amountIn, setAmountIn] = useState('1');
  const [tokenIn, setTokenIn] = useState<string>(ADDR.WETH);
  const [tokenOut, setTokenOut] = useState<string>(ADDR.KEBAB);
  const [decIn, setDecIn] = useState(18);
  const [decOut, setDecOut] = useState(18);
  const [quote, setQuote] = useState('-');
  const [status, setStatus] = useState('');
  const [slip, setSlip] = useState(50);
  const [deadlineMins, setDeadlineMins] = useState(20);

  const path = useMemo(()=>[tokenIn, tokenOut], [tokenIn, tokenOut]);

  async function getDecimals(token:string){
    if (token.toLowerCase() === ADDR.WETH.toLowerCase()) return 18;
    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    const c = new ethers.Contract(token, ERC20, signer);
    try { return await c.decimals() as number; } catch { return 18; }
  }

  useEffect(()=>{ (async()=>{
    setDecIn(await getDecimals(tokenIn));
    setDecOut(await getDecimals(tokenOut));
  })(); }, [tokenIn, tokenOut]);

  async function onQuote(){
    try{
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const r = new ethers.Contract(ADDR.ROUTER, [...IUniswapV2Router02, ...IUniswapV2Router02_more], signer);
      const amt = ethers.parseUnits(amountIn || '0', decIn);
      const amounts = await r.getAmountsOut(amt, path);
      setQuote(ethers.formatUnits(amounts[1], decOut));
    }catch(e:any){
      setQuote('-');
      alert(e?.message || 'Quote failed');
    }
  }

  async function onSwap(){
    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    const me = await signer.getAddress();
    setStatus('Preparing swap…');
    try{
      const r = new ethers.Contract(ADDR.ROUTER, [...IUniswapV2Router02, ...IUniswapV2Router02_more], signer);
      const amtIn = ethers.parseUnits(amountIn || '0', decIn);
      const amounts = await r.getAmountsOut(amtIn, path);
      const out = amounts[1]; const minOut = out - (out * BigInt(slip)) / 10000n;
      const deadline = BigInt(Math.floor(Date.now()/1000 + deadlineMins*60));

      if (tokenIn.toLowerCase() === ADDR.WETH.toLowerCase()){
        const tx = await r.swapExactETHForTokens(minOut, path, me, deadline, { value: amtIn });
        setStatus('Sending (ETH→Token)…'); await tx.wait();
      } else if (tokenOut.toLowerCase() === ADDR.WETH.toLowerCase()){
        const erc = new ethers.Contract(tokenIn, ERC20, signer);
        await (await erc.approve(ADDR.ROUTER, amtIn)).wait();
        const tx = await r.swapExactTokensForETH(amtIn, minOut, path, me, deadline);
        setStatus('Sending (Token→ETH)…'); await tx.wait();
      } else {
        const erc = new ethers.Contract(tokenIn, ERC20, signer);
        await (await erc.approve(ADDR.ROUTER, amtIn)).wait();
        const tx = await r.swapExactTokensForTokens(amtIn, minOut, path, me, deadline);
        setStatus('Sending (Token→Token)…'); await tx.wait();
      }
      setStatus('Swap submitted!');
    }catch(e:any){
      setStatus(e?.message || 'Swap failed');
    }
  }

  return (
    <main style={{ display:'grid', gap:16 }}>
      <div style={{ border:'1px solid #222', borderRadius:16, padding:16 }}>
        <h2 style={{ margin:'0 0 12px 0' }}>Swap</h2>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <div>
            <div style={{ fontSize:12, opacity:.8 }}>From</div>
            <select value={tokenIn} onChange={e=>setTokenIn(e.target.value)}>
              {tokens.map(t => <option key={t.address} value={t.address}>{t.symbol} ({t.decimals})</option>)}
            </select>
            <input value={amountIn} onChange={e=>setAmountIn(e.target.value)} placeholder="0.0" />
          </div>
          <div>
            <div style={{ fontSize:12, opacity:.8 }}>To</div>
            <select value={tokenOut} onChange={e=>setTokenOut(e.target.value)}>
              {tokens.map(t => <option key={t.address} value={t.address}>{t.symbol} ({t.decimals})</option>)}
            </select>
            <div style={{ display:'flex', gap:8 }}>
              <input value={quote} placeholder="Estimated" disabled />
              <button onClick={onQuote} style={{ padding:'10px 14px', borderRadius:12, border:'1px solid #222', background:'rgba(255,255,255,.06)', color:'#fff' }}>Quote</button>
            </div>
          </div>
        </div>
        <div style={{ display:'flex', gap:12, fontSize:12, opacity:.8, marginTop:6 }}>
          <label>Slippage <input type="number" min={1} max={1000} value={slip} onChange={e=>setSlip(Number(e.target.value))} style={{ width:80, marginLeft:6 }} /> bps</label>
          <label>Deadline <input type="number" min={1} max={180} value={deadlineMins} onChange={e=>setDeadlineMins(Number(e.target.value))} style={{ width:80, marginLeft:6 }} /> min</label>
          <div>Route: <span style={{ padding:'2px 6px', background:'#1e3a8a', borderRadius:999 }}>Camelot</span></div>
        </div>
        <div style={{ marginTop:12 }}>
          <button onClick={onSwap} style={{ width:'100%', padding:'12px 16px', borderRadius:12, background:'#fff', color:'#000', fontWeight:600 }}>Swap</button>
        </div>
        {status && <div style={{ fontSize:12, marginTop:8 }}>{status}</div>}
      </div>
    </main>
  );
}
