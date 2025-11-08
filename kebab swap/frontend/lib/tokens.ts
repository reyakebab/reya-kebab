import { Address } from "viem";
import { ADDRESSES } from "./addresses";

export type TokenMeta = { address: Address, symbol: string, decimals: number };

export const KNOWN: Record<string, TokenMeta> = {
  [ADDRESSES.WETH.toLowerCase()]: { address: ADDRESSES.WETH as Address, symbol: "WETH", decimals: 18 },
  [ADDRESSES.KEBAB.toLowerCase()]: { address: ADDRESSES.KEBAB as Address, symbol: "KEBAB", decimals: 18 },
  [ADDRESSES.RUSD?.toLowerCase?.() || ""]: { address: ADDRESSES.RUSD as Address, symbol: "RUSD", decimals: 6 },
};

export function formatToken(addr: Address, fallback: string = "TOKEN") {
  const k = KNOWN[addr.toLowerCase()];
  return k?.symbol || fallback;
}
