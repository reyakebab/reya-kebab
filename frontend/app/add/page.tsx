'use client';
import { useEffect, useMemo, useState } from 'react';
import { ethers } from 'ethers';
import { ADDR } from '../../lib/addresses';
import { IUniswapV2Router02_more, ERC20 } from '../../lib/abis';
import { useTokenList } from '../../lib/tokenlist';
import { ImportTokenButton } from '../../components-import-token';

export default function Add(){
  const { tokens } = useTokenList();
  const [tokenA, setTokenA] = useState<string>(ADDR.WETH);
  const [tokenB, setTokenB] = useState<string>(ADDR.KEBAB);
  const [amountA, setAmountA] = useState('0');
  const [amountB, setAmountB] = useState('0');
  const [decA, setDecA] = useState(18);
  const [decB, setDecB] = useState(18);
  const [status, setStatus] = useState('');

  const isEthPair = useMemo(()=> tokenA.toLowerCase() === ADDR.WETH.toLowerCase() || tokenB.toLowerCase() === ADDR.WETH.toLowerCase(), [tokenA, tokenB]);

  useEffect(()=>{ (async()=>{
    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    const dec = async (t:string)=> t.toLowerCase()===ADDR.WETH.toLowerCase()? 18 : await new ethers.Contract(t, ERC20, signer).decimals();
    try{ const [a,b] = await Promise.all([dec(tokenA), dec(tokenB)]); setDecA(Number(a)); setDecB(Number(b)); }catch{}
  })(); }, [tokenA, tokenB]);

  async function onAdd(){
    setStatus('Preparing…');
    try{
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const me = await signer.getAddress();
      const r = new ethers.Contract(ADDR.ROUTER, IUniswapV2Router02_more, signer);
      const amtA = ethers.parseUnits(amountA || '0', decA);
      const amtB = ethers.parseUnits(amountB || '0', decB);
      const minA = amtA - (amtA*5n)/1000n;
      const minB = amtB - (amtB*5n)/1000n;
      const deadline = BigInt(Math.floor(Date.now()/1000 + 1200));

      if (isEthPair){
        const token = tokenA.toLowerCase()===ADDR.WETH.toLowerCase()? tokenB : tokenA;
        const tokenAmt = tokenA.toLowerCase()===ADDR.WETH.toLowerCase()? amtB : amtA;
        const tokenMin = tokenA.toLowerCase()===ADDR.WETH.toLowerCase()? minB : minA;
        const ethAmt = tokenA.toLowerCase()===ADDR.WETH.toLowerCase()? amtA : amtB;
        const ethMin = tokenA.toLowerCase()===ADDR.WETH.toLowerCase()? minA : minB;
        const erc = new ethers.Contract(token, ERC20, signer);
        await (await erc.approve(ADDR.ROUTER, tokenAmt)).wait();
        const tx = await r.addLiquidityETH(token, tokenAmt, tokenMin, ethMin, me, deadline, { value: ethAmt });
        setStatus('Adding (ETH–Token)…'); await tx.wait();
      } else {
        const ercA = new ethers.Contract(tokenA, ERC20, signer);
        const ercB = new ethers.Contract(tokenB, ERC20, signer);
        await (await ercA.approve(ADDR.ROUTER, amtA)).wait();
        await (await ercB.approve(ADDR.ROUTER, amtB)).wait();
        const tx = await r.addLiquidity(tokenA, tokenB, amtA, amtB, minA, minB, me, deadline);
        setStatus('Adding (Token–Token)…'); await tx.wait();
      }
      setStatus('Liquidity added!');
    }catch(e:any){ setStatus(e?.message || 'Add failed'); }
  }

  return (
    <main style={{ display:'grid', gap:16 }}>
      <div style={{ border:'1px solid #222', borderRadius:16, padding:16 }}>
        <h2 style={{ margin:'0 0 12px 0' }}>Create Pool / Add Liquidity</h2>
        <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:8 }}>
          <span style={{ fontSize:13, opacity:.8 }}>Venue:</span> <span style={{ padding:'2px 6px', background:'#1e3a8a', borderRadius:999 }}>Camelot</span>
          <div style={{ marginLeft:'auto' }}><ImportTokenButton /></div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <div>
            <div style={{ fontSize:12, opacity:.8 }}>Token A</div>
            <select value={tokenA} onChange={e=>setTokenA(e.target.value)}>
              {tokens.map(t => <option key={t.address} value={t.address}>{t.symbol} ({t.decimals})</option>)}
            </select>
            <input value={amountA} onChange={e=>setAmountA(e.target.value)} placeholder="0.0" />
          </div>
          <div>
            <div style={{ fontSize:12, opacity:.8 }}>Token B</div>
            <select value={tokenB} onChange={e=>setTokenB(e.target.value)}>
              {tokens.map(t => <option key={t.address} value={t.address}>{t.symbol} ({t.decimals})</option>)}
            </select>
            <input value={amountB} onChange={e=>setAmountB(e.target.value)} placeholder="0.0" />
          </div>
        </div>
        <div style={{ marginTop:12 }}>
          <button onClick={onAdd} style={{ width:'100%', padding:'12px 16px', borderRadius:12, background:'#fff', color:'#000', fontWeight:600 }}>Create / Add</button>
        </div>
        {status && <div style={{ fontSize:12, marginTop:8 }}>{status}</div>}
      </div>
    </main>
  );
}
