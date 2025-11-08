import Link from 'next/link';
export default function Page(){
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
          Fast, simple swaps and pool creation on Reya Network. 0.30% fees, Camelot v2 liquidity.
        </p>
        <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
          <Link href="/swap" style={{ padding:'12px 16px', borderRadius:12, background:'white', color:'black', fontWeight:600 }}>Launch App</Link>
          <Link href="/add"  style={{ padding:'12px 16px', borderRadius:12, border:'1px solid #333' }}>Create Pool</Link>
          <Link href="/pool" style={{ padding:'12px 16px', borderRadius:12, border:'1px solid #333' }}>Explore Pools</Link>
        </div>
      </section>
    </main>
  );
}