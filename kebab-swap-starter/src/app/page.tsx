import Link from "next/link";

export default function Home() {
  return (
    <div className="py-16 space-y-6">
      <div className="card p-8 text-center space-y-4">
        <img src="/branding/kebab.png" alt="Kebab" width={64} height={64} className="mx-auto rounded-2xl" />
        <h1 className="text-2xl font-semibold">KebabSwap on Reya</h1>
        <p className="opacity-70">Swap tokens and create liquidity pools via Camelot.</p>
        <div className="flex items-center justify-center gap-3">
          <Link className="btn inline-block" href="/swap">Launch App</Link>
          <Link className="btn inline-block" href="/create">Create Pool</Link>
        </div>
      </div>
    </div>
  );
}
