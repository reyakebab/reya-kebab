import "@/styles/globals.css";
import type { Metadata } from "next";
import { Providers } from "@/lib/providers";

export const metadata: Metadata = {
  title: "KebabSwap | Reya DEX",
  description: "Swap and provide liquidity on Reya via Camelot.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <Providers>
          <header className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <img src="/branding/kebab.png" alt="KebabSwap" width={36} height={36} className="rounded-2xl" />
              <span className="font-semibold text-lg tracking-wide">KebabSwap</span>
            </div>
            <div id="rk-connect" />
          </header>
          <main className="px-4 md:px-0 max-w-3xl mx-auto">{children}</main>
          <footer className="opacity-60 text-xs px-6 py-8 text-center">
            Built on Reya • Routes via Camelot • © {new Date().getFullYear()} KebabSwap
          </footer>
        </Providers>
      </body>
    </html>
  );
}
