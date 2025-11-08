'use client';
import { useEffect, useState } from 'react';
export type TokenInfo = { address: `0x${string}`, symbol: string, decimals: number };
const DEFAULTS: TokenInfo[] = [
  { address: '0x6B48C2e6A32077ec17e8Ba0d98fFc676dfab1A30', symbol:'WETH', decimals:18 },
  { address: '0x49d753C5B7C6D23262d4259aC863FfE10aBD9F2a', symbol:'KEBAB', decimals:18 },
  { address: '0xa9F32a851B1800742e47725DA54a09A7Ef2556A3', symbol:'RUSD', decimals:6 }
];
function uniq(arr: TokenInfo[]) { const s = new Set<string>(); const out: TokenInfo[] = []; for (const t of arr){ const k=t.address.toLowerCase(); if(!s.has(k)){ s.add(k); out.push(t); } } return out; }
export function useTokenList(){
  const [tokens, setTokens] = useState<TokenInfo[]>(DEFAULTS);
  useEffect(()=>{ try{ const raw = localStorage.getItem('kebab.custom'); if(raw){ setTokens(uniq([...DEFAULTS, ...JSON.parse(raw)])); } }catch{} },[]);
  function addToken(t: TokenInfo){ try{ const raw = localStorage.getItem('kebab.custom'); const arr:TokenInfo[] = raw? JSON.parse(raw): []; const next = uniq([...arr, t]); localStorage.setItem('kebab.custom', JSON.stringify(next)); setTokens(uniq([...DEFAULTS, ...next])); }catch{} }
  return { tokens, addToken };
}