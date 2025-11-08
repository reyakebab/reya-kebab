"use client";
import { createConfig, http, WagmiProvider } from "wagmi";
import { reya } from "./reya";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const queryClient = new QueryClient();
export const config = createConfig({ chains: [reya], transports: { [reya.id]: http() } });
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
