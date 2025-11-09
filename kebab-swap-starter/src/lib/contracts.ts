"use client";
import { createWalletClient, createPublicClient, custom, http, parseAbiItem, encodePacked, getAddress } from "viem";
import { reya } from "@/config/chain";
import { CAM } from "@/config/camelot";

export const publicClient = createPublicClient({
  chain: reya,
  transport: http(process.env.NEXT_PUBLIC_REYA_RPC || "https://rpc.reya.network"),
});

export const walletClient = typeof window !== "undefined" && (window as any).ethereum
  ? createWalletClient({ chain: reya, transport: custom((window as any).ethereum) })
  : null;

// Minimal ERC20 ABI
export const erc20Abi = [
  { type: "function", stateMutability: "view", name: "decimals", inputs: [], outputs: [{ type: "uint8", name: "" }]},
  { type: "function", stateMutability: "view", name: "symbol", inputs: [], outputs: [{ type: "string", name: "" }]},
  { type: "function", stateMutability: "view", name: "name", inputs: [], outputs: [{ type: "string", name: "" }]},
  { type: "function", stateMutability: "view", name: "allowance", inputs: [{name:"owner",type:"address"},{name:"spender",type:"address"}], outputs: [{type:"uint256",name:""}]},
  { type: "function", stateMutability: "nonpayable", name: "approve", inputs: [{name:"spender",type:"address"},{name:"amount",type:"uint256"}], outputs: [{type:"bool",name:""}]},
  { type: "function", stateMutability: "view", name: "balanceOf", inputs: [{name:"owner",type:"address"}], outputs: [{type:"uint256",name:""}]}
] as const;

// Approve helper (exact amount)
export async function ensureApproval(token: `0x${string}`, owner: `0x${string}`, spender: `0x${string}`, amount: bigint) {
  const allowance = await publicClient.readContract({ address: token, abi: erc20Abi, functionName: "allowance", args: [owner, spender] });
  if (allowance >= amount) return;
  if (!walletClient) throw new Error("No wallet");
  const hash = await walletClient.writeContract({
    address: token, abi: erc20Abi, functionName: "approve", args: [spender, amount]
  });
  return hash;
}
