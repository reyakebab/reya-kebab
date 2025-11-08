import { defineChain } from "viem";
export const reya = /*#__PURE__*/ defineChain({
  id: 1729,
  name: "Reya",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.reya.network"] } },
  blockExplorers: { default: { name: "Reya Explorer", url: "https://explorer.reya.network" } },
  testnet: false
});
