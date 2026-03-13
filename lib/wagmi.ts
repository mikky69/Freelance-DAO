import { baseSepolia } from "viem/chains"
import { http, createConfig } from "wagmi"

const BASE_SEPOLIA_RPC = process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC || "https://sepolia.base.org"

export const wagmiConfig = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(BASE_SEPOLIA_RPC),
  },
})