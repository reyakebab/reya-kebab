"use client";
export function PriceImpact({ pct }: { pct?: number }) {
  if (pct === undefined) return <p className="text-xs opacity-60">Price impact: estimating…</p>;
  const sev = pct >= 15 ? "DANGER" : pct >= 5 ? "HIGH" : pct >= 1 ? "MED" : "LOW";
  return (
    <div className="text-xs">
      <span>Price impact: {pct.toFixed(2)}% </span>
      <span className="opacity-70">({sev})</span>
    </div>
  );
}
