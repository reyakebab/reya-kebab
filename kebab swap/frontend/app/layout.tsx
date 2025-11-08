import './globals.css';
import Link from 'next/link';
import Connect from '../components-connect';
export const metadata = {
  title: 'Kebab Swap — Reya DEX',
  description: 'Sushi-style AMM on Reya.',
};
export default function RootLayout({ children }: { children: React.ReactNode }){
  return (
    <html lang="en"><body>
      <header style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px', borderBottom:'1px solid #1d1d1d' }}>
        <Link href="/" style={{ display:'flex', alignItems:'center', gap:10 }}>
          <img src="/branding/kebab.png" width={28} height={28} alt="Kebab" />
          <b>Kebab Swap</b>
        </Link>
        <nav style={{ display:'flex', gap:12, marginLeft:12 }}>
          <Link href="/swap">Swap</Link>
          <Link href="/add">Create Pool</Link>
          <Link href="/remove">Remove</Link>
          <Link href="/pool">Pools</Link>
        </nav>
        <div style={{ marginLeft:'auto' }}><Connect /></div>
      </header>
      <main style={{ maxWidth:820, margin:'0 auto', padding:16 }}>{children}</main>
    </body></html>
  );
}