"use client";
import { WagmiProvider, createConfig, http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme, ConnectButton } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { reya } from "@/config/chain";

const rpcUrl = process.env.NEXT_PUBLIC_REYA_RPC || "https://rpc.reya.network";

const wagmiConfig = createConfig({
  chains: [reya],
  transports: { [reya.id]: http(rpcUrl) },
  multiInjectedProviderDiscovery: true,
  ssr: true,
});

const qc = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={qc}>
        <RainbowKitProvider
          modalSize="compact"
          theme={darkTheme({ accentColor: "#ffffff", borderRadius: "large" })}
        >
          <div className="px-4 py-2 flex justify-end"><ConnectButton /></div>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
