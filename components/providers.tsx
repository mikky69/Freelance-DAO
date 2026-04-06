"use client"

import { useState } from "react"
import { RainbowKitProvider, getDefaultConfig, darkTheme } from "@rainbow-me/rainbowkit"
import { WagmiProvider } from "wagmi"
import { baseSepolia } from "wagmi/chains"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import "@rainbow-me/rainbowkit/styles.css"

const config = getDefaultConfig({
  appName: "FreeLanceDAO",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "b1a34d3fce3a5e0f1234567890abcdef",
  chains: [baseSepolia],
})

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#AE16A7",
            accentColorForeground: "white",
            borderRadius: "large",
            fontStack: "system",
          })}
          initialChain={baseSepolia}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}