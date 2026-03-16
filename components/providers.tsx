"use client"

import { useState } from "react"
import { PrivyProvider } from "@privy-io/react-auth"
import { WagmiProvider } from "@privy-io/wagmi"
import { createConfig, http } from "wagmi"
import { baseSepolia } from "wagmi/chains"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const wagmiConfig = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC || "https://sepolia.base.org"),
  },
})

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
      config={{
        defaultChain: baseSepolia,
        supportedChains: [baseSepolia],
        appearance: {
          theme: "dark",
          accentColor: "#AE16A7",
          logo: "/images/freelancedao-logo.png",
          showWalletLoginFirst: false,
        },
        loginMethods: ["email", "wallet"],
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
          showWalletUIs: true,
        },
        externalWallets: {
          coinbaseWallet: {},
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          {children}
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  )
}