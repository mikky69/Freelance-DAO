import { BrowserProvider, Contract, JsonRpcProvider } from "ethers"
import EscrowDeployment from "@/base-smart-contracts/deployments/baseSepolia/FreelanceDAOEscrowV2.json"
import DisputeDeployment from "@/base-smart-contracts/deployments/baseSepolia/FreelanceDAODisputeV2.json"

export const getReadonlyProvider = () => {
  const url = process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC || "https://sepolia.base.org"
  return new JsonRpcProvider(url, { chainId: 84532, name: "base-sepolia" })
}

export const getEscrowContract = (signerOrProvider: any) => {
  return new Contract(EscrowDeployment.address, EscrowDeployment.abi as any, signerOrProvider)
}

export const getDisputeContract = (signerOrProvider: any) => {
  return new Contract(DisputeDeployment.address, DisputeDeployment.abi as any, signerOrProvider)
}