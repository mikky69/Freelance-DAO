"use client"

import React, { ReactNode } from "react"
import { PrivyProvider } from "@privy-io/react-auth"
import { createConfig, WagmiProvider } from "@privy-io/wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { hederaTestnet, hederaPreviewnet, hedera } from "wagmi/chains"
import { http } from "wagmi"

// Create wagmi config with Hedera chains
const wagmiConfig = createConfig({
  chains: [hederaTestnet, hederaPreviewnet, hedera],
  transports: {
    [hederaTestnet.id]: http(),
    [hederaPreviewnet.id]: http(),
    [hedera.id]: http(),
  },
})

// Create query client for TanStack Query
const queryClient = new QueryClient()

interface PrivyHederaProviderProps {
  children: ReactNode
}

const PrivyHederaProvider: React.FC<PrivyHederaProviderProps> = ({ children }) => {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID

  if (!appId) {
    throw new Error("NEXT_PUBLIC_PRIVY_APP_ID is not set in environment variables")
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        // Set Hedera Testnet as default chain
        defaultChain: hederaTestnet,
        // Supported chains for the app
        supportedChains: [hederaTestnet, hederaPreviewnet, hedera],
        // Appearance configuration
        appearance: {
          theme: "dark",
          accentColor: "#AE16A7",
          logo: "/images/freelancedao-logo.png",
          showWalletLoginFirst: false,
        },
        // Login methods - email and wallet
        loginMethods: ["email", "wallet"],
        // Embedded wallet configuration (v3.x requires nested under ethereum/solana)
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
          showWalletUIs: true,
        },
        // External wallet configuration
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

export default PrivyHederaProvider
