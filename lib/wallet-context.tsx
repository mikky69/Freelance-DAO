"use client"

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react"
import {
  getWalletManager,
  HederaWalletManager,
  HederaAccount,
  WalletException,
} from "@/lib/hedera-wallet"
import { toast } from "sonner"

interface WalletContextType {
  walletManager: HederaWalletManager | null
  account: HederaAccount | null
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  refreshBalance: () => Promise<void>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletManager, setWalletManager] = useState<HederaWalletManager | null>(
    null
  )
  const [account, setAccount] = useState<HederaAccount | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      try {
        const manager = await getWalletManager()
        setWalletManager(manager)

        // Subscribe to account changes
        const unsubscribe = manager.subscribe(
          (newAccount: HederaAccount | null) => {
            setAccount(newAccount)
          }
        )

        // Restore existing connection
        await manager.restoreConnection()

        return () => unsubscribe()
      } catch (e) {
        console.error("Failed to initialize wallet manager:", e)
        setError("Could not initialize the wallet manager.")
      }
    }
    init()
  }, [])

  const connect = useCallback(async () => {
    if (!walletManager) {
      setError("Wallet manager is not available.")
      toast.error("Wallet is not ready, please refresh.")
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      await walletManager.connectWallet()
      toast.success("HashPack wallet connected successfully!")
    } catch (e: any) {
      const walletError = e as WalletException
      let errorMessage = walletError.message

      if (walletError.code === "CONNECTION_REJECTED") {
        errorMessage =
          "Connection was rejected. Please try again and approve the connection in HashPack."
      }

      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsConnecting(false)
    }
  }, [walletManager])

  const disconnect = useCallback(async () => {
    if (!walletManager) return
    try {
      await walletManager.disconnectWallet()
      toast.info("Wallet disconnected.")
    } catch (e) {
      console.error("Failed to disconnect wallet:", e)
      toast.error("Failed to disconnect wallet.")
    }
  }, [walletManager])

  const refreshBalance = useCallback(async () => {
    if (!walletManager) return
    try {
      await walletManager.refreshBalance()
      toast.success("Balance updated.")
    } catch (e) {
      console.error("Failed to refresh balance:", e)
      toast.error("Failed to refresh balance.")
    }
  }, [walletManager])

  const isConnected = !!account

  return (
    <WalletContext.Provider
      value={{
        walletManager,
        account,
        isConnected,
        isConnecting,
        error,
        connect,
        disconnect,
        refreshBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}