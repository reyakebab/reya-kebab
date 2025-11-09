import { defineChain } from "viem";

const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 1729);

export const reya = defineChain({
  id: chainId,
  name: "Reya",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_REYA_RPC || "https://rpc.reya.network"] },
    public: { http: [process.env.NEXT_PUBLIC_REYA_RPC || "https://rpc.reya.network"] },
  },
});
