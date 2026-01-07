import { defineChain } from "viem"
import { http, createConfig } from "wagmi"

const HEDERA_RPC = process.env.NEXT_PUBLIC_HEDERA_RPC || "https://testnet.hashio.io/api"

export const hederaTestnet = defineChain({
  id: 296,
  name: "Hedera Testnet",
  nativeCurrency: { name: "HBAR", symbol: "HBAR", decimals: 18 },
  rpcUrls: {
    default: { http: [HEDERA_RPC] },
    public: { http: [HEDERA_RPC] },
  },
})

export const wagmiConfig = createConfig({
  chains: [hederaTestnet],
  transports: {
    [hederaTestnet.id]: http(HEDERA_RPC),
  },
})

