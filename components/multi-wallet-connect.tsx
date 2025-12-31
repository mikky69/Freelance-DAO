"use client"

import { HashpackConnect } from "@/components/HashpackConnect"
import { HederaAccount } from "@/lib/hedera-wallet"

interface MultiWalletConnectProps {
  onConnectionChange?: (connected: boolean, account?: HederaAccount) => void
}

export function MultiWalletConnect({ onConnectionChange }: MultiWalletConnectProps) {
  return <HashpackConnect onConnectionChange={onConnectionChange} />
}