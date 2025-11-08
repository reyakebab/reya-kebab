'use client';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { ADDR } from '../../lib/addresses';
import { IUniswapV2Factory, IUniswapV2Pair, ERC20, IUniswapV2Router02_more } from '../../lib/abis';
import { useTokenList } from '../../lib/tokenlist';

export default function Remove(){
  const { tokens } = useTokenList();
  const [token, setToken] = useState<string>(ADDR.KEBAB);
  const [pct, setPct] = useState<number>(25);
  const [status, setStatus] = useState('');

  async function onRemove(){
    setStatus('Preparing…');
    try{
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner(); const me = await signer.getAddress();
      const f = new ethers.Contract(ADDR.FACTORY, IUniswapV2Factory, signer);
      const pair = await f.getPair(token, ADDR.WETH);
      if (pair === ethers.ZeroAddress) throw new Error('Pair not found. Create at Add tab.');
      const lp = new ethers.Contract(pair, ERC20, signer);
      const bal = await lp.balanceOf(me);
      const liq = (bal * BigInt(Math.max(1, Math.min(100, pct)))) / 100n;
      if (liq === 0n) throw new Error('LP balance too low.');
      await (await lp.approve(ADDR.ROUTER, liq)).wait();

      const p = new ethers.Contract(pair, IUniswapV2Pair, signer);
      const [r0, r1] = await p.getReserves(); const t0 = await p.token0();
      const [resT, resE] = token.toLowerCase() === t0.toLowerCase() ? [r0, r1] : [r1, r0];
      const ts = await p.totalSupply();
      const estT = (liq * resT) / ts, estE = (liq * resE) / ts;
      const minT = estT - (estT*1n)/100n, minE = estE - (estE*1n)/100n;

      const r = new ethers.Contract(ADDR.ROUTER, IUniswapV2Router02_more, signer);
      const tx = await r.removeLiquidityETH(token, liq, minT, minE, me, BigInt(Math.floor(Date.now()/1000 + 1200)));
      setStatus('Removing…'); await tx.wait();
      setStatus('Removed! Tokens + ETH returned.');
    }catch(e:any){ setStatus(e?.message || 'Remove failed'); }
  }

  return (
    <main style={{ display:'grid', gap:16 }}>
      <div style={{ border:'1px solid #222', borderRadius:16, padding:16 }}>
        <h2 style={{ margin:'0 0 12px 0' }}>Remove Liquidity (WETH–Token)</h2>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <div>
            <div style={{ fontSize:12, opacity:.8 }}>Token</div>
            <select value={token} onChange={e=>setToken(e.target.value)}>
              {tokens.map(t => <option key={t.address} value={t.address}>{t.symbol} ({t.decimals})</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize:12, opacity:.8 }}>% to Remove</div>
            <input type="number" min={1} max={100} value={pct} onChange={e=>setPct(Number(e.target.value))} />
          </div>
        </div>
        <div style={{ marginTop:12 }}>
          <button onClick={onRemove} style={{ width:'100%', padding:'12px 16px', borderRadius:12, background:'#fff', color:'#000', fontWeight:600 }}>Remove</button>
        </div>
        {status && <div style={{ fontSize:12, marginTop:8 }}>{status}</div>}
      </div>
    </main>
  );
}
