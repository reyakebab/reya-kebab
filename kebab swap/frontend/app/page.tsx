import Link from "next/link";

export default function Page() {
  return (
    <main style={{ display:'grid', gap:24 }}>
      <section style={{ display:'grid', gap:16, padding:24, border:'1px solid #222', borderRadius:16, background:'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))' }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <img src="/branding/kebab.png" alt="Kebab" width={56} height={56} style={{ borderRadius:12 }} />
          <div>
            <h2 style={{ fontSize:28, fontWeight:700, margin:0 }}>Kebab Swap</h2>
            <div style={{ opacity:0.8 }}>Sushi-style AMM on Reya • ETH native</div>
          </div>
        </div>
        <p style={{ lineHeight:1.6, opacity:0.9, margin:0 }}>
          Fast, simple swaps and pool creation on Reya Network. 0.30% fees with 0.05% to the Kebab treasury.
        </p>
        <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
          <Link href="/swap" style={{ padding:'12px 16px', borderRadius:12, background:'white', color:'black', fontWeight:600 }}>Launch App</Link>
          <Link href="/add"  style={{ padding:'12px 16px', borderRadius:12, border:'1px solid #333' }}>Create Pool</Link>
          <Link href="/pool" style={{ padding:'12px 16px', borderRadius:12, border:'1px solid #333' }}>Explore Pools</Link>
        </div>
      </section>

      <section style={{ display:'grid', gap:16 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:16 }}>
          <div style={{ padding:16, border:'1px solid #222', borderRadius:16, background:'#0b0b0b' }}>
            <h3 style={{ margin:'0 0 8px 0', fontSize:18 }}>Swap</h3>
            <p style={{ margin:0, opacity:0.8 }}>Trade tokens with instant quotes and slippage control.</p>
          </div>
          <div style={{ padding:16, border:'1px solid #222', borderRadius:16, background:'#0b0b0b' }}>
            <h3 style={{ margin:'0 0 8px 0', fontSize:18 }}>Pools</h3>
            <p style={{ margin:0, opacity:0.8 }}>Create and manage v2-style liquidity pools.</p>
          </div>
          <div style={{ padding:16, border:'1px solid #222', borderRadius:16, background:'#0b0b0b' }}>
            <h3 style={{ margin:'0 0 8px 0', fontSize:18 }}>Import Tokens</h3>
            <p style={{ margin:0, opacity:0.8 }}>One-click token import with symbol and decimals auto-detected.</p>
          </div>
          <div style={{ padding:16, border:'1px solid #222', borderRadius:16, background:'#0b0b0b' }}>
            <h3 style={{ margin:'0 0 8px 0', fontSize:18 }}>ETH Native</h3>
            <p style={{ margin:0, opacity:0.8 }}>Reya uses ETH for gas; WETH is supported out of the box.</p>
          </div>
        </div>
      </section>

      <section style={{ padding:16, border:'1px solid #222', borderRadius:16 }}>
        <h3 style={{ margin:'0 0 8px 0', fontSize:18 }}>Docs & Setup</h3>
        <ul style={{ margin:0, paddingLeft:18, opacity:0.9, lineHeight:1.6 }}>
          <li>Set <code>NEXT_PUBLIC_FACTORY</code> and <code>NEXT_PUBLIC_ROUTER</code> in <code>.env.local</code>.</li>
          <li>Connect your wallet and switch to Reya (chainId 1729).</li>
          <li>Create your first pool at <Link href="/add">/add</Link> and start swapping.</li>
        </ul>
      </section>

      <section style={{ textAlign:'center', opacity:0.7, fontSize:13 }}>
        © {new Date().getFullYear()} Kebab Swap • Built on Uniswap v2 patterns
      </section>
    </main>
  );
}
