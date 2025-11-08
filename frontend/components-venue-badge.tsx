'use client';
export function VenueBadge({ label }: { label: string }){
  const bg = label === 'Camelot' ? '#1e3a8a' : '#373737';
  return <span style={{ padding:'4px 8px', borderRadius:999, fontSize:12, background:bg, color:'#fff' }}>{label}</span>;
}