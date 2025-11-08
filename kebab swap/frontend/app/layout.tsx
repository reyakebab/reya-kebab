import { Providers } from "../lib/wagmi";
import { ConnectButton as _Connect } from "../components-connect";
export const metadata = {
  title: "Kebab Swap — Reya DEX",
  description: "Sushi-style AMM on Reya. Swap tokens and create liquidity pools.",
  icons: { icon: "/icon.png", apple: "/apple-icon.png" },
  openGraph: { title: "Kebab Swap — Reya DEX", description: "Fast swaps & pools on Reya.", images: ["/opengraph-image.png"] }
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: 'black', color: 'white' }}>
        <Providers>
          <div style={{ maxWidth: 960, margin: '0 auto', padding: 16 }}>
            <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <img src="/branding/kebab.png" alt="Kebab" width={40} height={40} />
              <h1 style={{ fontSize: 24, fontWeight: 600 }}>Kebab Swap</h1>
            <div style={{ marginLeft: 'auto' }}><_Connect /></div></header>
            {children}
            <footer style={{ marginTop: 48, opacity: 0.7, fontSize: 14 }}>Reya • chainId 1729</footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
