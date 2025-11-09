"use client";
export function SlippageControl({ value, onChange }: { value: number; onChange: (n: number)=>void }) {
  const options = [0.1, 0.5, 1];
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs opacity-70">Slippage</span>
      {options.map(o => (
        <button key={o} className={`tab ${value===o ? 'tab-active': ''}`} onClick={()=>onChange(o)}>{o}%</button>
      ))}
      <input
        className="input w-24 ml-2 text-right"
        value={value}
        onChange={(e)=>onChange(Number(e.target.value)||0)}
      />
    </div>
  );
}
