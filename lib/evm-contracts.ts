import { BrowserProvider, Contract, JsonRpcProvider } from "ethers"
import EscrowJson from "@/hedera-frontend-abi/FreelanceDAOEscrowV2.json"
import DisputeJson from "@/hedera-frontend-abi/FreelanceDAODisputeV2.json"
import { HederaWalletManager } from "@/lib/hedera-wallet"

export const getReadonlyProvider = () => {
  const url = process.env.NEXT_PUBLIC_HEDERA_RPC || "https://testnet.hashio.io/api"
  return new JsonRpcProvider(url, { chainId: 296, name: "hedera_testnet" })
}

export const getEvmProviderFromWallet = async (walletManager: HederaWalletManager) => {
  const anyHwc = (walletManager as any)["hwc"]
  if (!anyHwc) return null
  const evm = anyHwc.getEthereumProvider?.() || anyHwc.getEvmProvider?.() || anyHwc.evmProvider || null
  if (!evm) return null
  return new BrowserProvider(evm)
}

export const getEscrowContract = (signerOrProvider: any) => {
  return new Contract(EscrowJson.address, EscrowJson.abi as any, signerOrProvider)
}

export const getDisputeContract = (signerOrProvider: any) => {
  return new Contract(DisputeJson.address, DisputeJson.abi as any, signerOrProvider)
}

