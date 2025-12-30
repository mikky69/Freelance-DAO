// lib/hedera-wallet.ts
import { Transaction } from "@hashgraph/sdk"
import { Buffer } from "buffer"

export interface HederaAccount {
  accountId: string
  balance: string
  network: "testnet" | "mainnet"
  publicKey?: string
}

export interface WalletError {
  code: string
  message: string
  details?: any
}

const MIRROR_NODES = {
  testnet: [
    "https://testnet.mirrornode.hedera.com",
    "https://testnet.mirror.hashgraph.com",
  ],
  mainnet: [
    "https://mainnet.mirrornode.hedera.com",
    "https://mainnet.mirror.hashgraph.com",
  ],
}

export class HederaWalletManager {
  private hwc: any | null = null
  private currentAccount: HederaAccount | null = null
  private listeners: Set<(account: HederaAccount | null) => void> = new Set()
  private isInitialized = false

  constructor() {
    // Constructor is now lighter. Initialization is deferred.
  }

  private async initialize() {
    if (this.isInitialized || typeof window === "undefined") {
      return
    }

    try {
      // Dynamically import the library to prevent server-side issues
      const module = await import("@hashgraph/hedera-wallet-connect")

      // Attempt to resolve the constructor from various export patterns
      let HederaWalletConnect = (module as any).HederaWalletConnect || module.default

      // If what we found is an object (not a class constructor) and has the named property, drill down
      if (HederaWalletConnect && typeof HederaWalletConnect !== 'function') {
         if ((HederaWalletConnect as any).HederaWalletConnect) {
           HederaWalletConnect = (HederaWalletConnect as any).HederaWalletConnect
         }
      }

      if (typeof HederaWalletConnect !== 'function') {
        console.error("Failed to resolve HederaWalletConnect constructor. Module dump:", module)
        throw new Error("HederaWalletConnect library could not be loaded correctly.")
      }

      const metadata = {
        name: "FreeLanceDAO",
        description: "Decentralized freelancing platform on Hedera",
        url: window.location.origin,
        icons: [`${window.location.origin}/hedera-logo.jpg`],
      }

      this.hwc = new (HederaWalletConnect as any)(
        metadata,
        "2e492f645cd4fe55e1347cdd0714c02d",
        "testnet"
      )

      // Subscribe to events
      this.hwc.on("connect", (payload: any) => {
        this.handleConnection(payload)
      })

      this.hwc.on("disconnect", () => {
        this.handleDisconnection()
      })

      this.hwc.on("session_update", (payload: any) => {
        this.handleConnection(payload)
      })

      await this.hwc.init()
      this.isInitialized = true
      console.log("✅ Hedera Wallet Connect Initialized")
    } catch (error) {
      console.error("❌ Failed to initialize Hedera Wallet Connect", error)
    }
  }

  private async handleConnection(payload: any) {
    const accountIds = this.hwc?.getAccountIds()
    if (!accountIds || accountIds.length === 0) return

    let accountId = accountIds[0]

    // Handle CAIP-10 format if present (e.g., hedera:testnet:0.0.123)
    if (accountId.includes(":")) {
      accountId = accountId.split(":").pop()!
    }

    if (this.currentAccount?.accountId === accountId) return

    console.log("✅ Wallet connected:", accountId)

    const balance = await this.getBalance(accountId)
    this.currentAccount = {
      accountId,
      balance,
      network: "testnet",
    }

    localStorage.setItem("hedera_account", JSON.stringify(this.currentAccount))
    this.emitChange()
  }

  private handleDisconnection() {
    if (!this.currentAccount) return
    console.log("🔌 Wallet disconnected")
    this.currentAccount = null
    localStorage.removeItem("hedera_account")
    this.emitChange()
  }

  async connectWallet(): Promise<HederaAccount> {
    await this.initialize()
    if (!this.hwc) {
      throw new WalletException({
        code: "INIT_FAILED",
        message: "Wallet Connect is not initialized. Please refresh the page.",
      })
    }

    try {
      await this.hwc.connect()
      // Wait for connection to be established via events
      // But connect() usually resolves when session is settled
      const accountIds = this.hwc.getAccountIds()
      if (accountIds.length > 0) {
        await this.handleConnection({}) // Trigger update
        return this.currentAccount!
      }
      throw new Error("No accounts found after connection")
    } catch (error) {
      console.error("❌ Wallet connection failed", error)
      throw new WalletException({
        code: "CONNECTION_REJECTED",
        message: "User rejected or failed to connect.",
      })
    }
  }

  async disconnectWallet(): Promise<void> {
    if (this.hwc) {
      await this.hwc.disconnect()
    }
  }

  subscribe(listener: (account: HederaAccount | null) => void) {
    this.listeners.add(listener)
    // Immediately notify the new listener with the current state
    listener(this.currentAccount ? { ...this.currentAccount } : null)
    return () => this.listeners.delete(listener)
  }

  private emitChange() {
    this.listeners.forEach((listener) => {
      listener(this.currentAccount ? { ...this.currentAccount } : null)
    })
  }

  async getBalance(accountId: string): Promise<string> {
    for (const mirrorUrl of MIRROR_NODES.testnet) {
      try {
        const response = await fetch(
          `${mirrorUrl}/api/v1/accounts/${accountId}`
        )
        if (!response.ok) continue
        const data = await response.json()
        const balanceInTinybars = data.balance?.balance || 0
        return (balanceInTinybars / 100_000_000).toFixed(2)
      } catch (error) {
        console.warn(`Error with mirror node ${mirrorUrl}:`, error)
        continue
      }
    }
    console.error("All mirror nodes failed to fetch balance")
    return "0.00"
  }

  async refreshBalance(): Promise<void> {
    if (!this.currentAccount) return

    const balance = await this.getBalance(this.currentAccount.accountId)
    this.currentAccount.balance = balance
    localStorage.setItem("hedera_account", JSON.stringify(this.currentAccount))
    this.emitChange()
  }

  getCurrentAccount(): HederaAccount | null {
    return this.currentAccount
  }

  async restoreConnection(): Promise<void> {
    await this.initialize()
    const accountIds = this.hwc?.getAccountIds()
    if (accountIds && accountIds.length > 0) {
      await this.handleConnection({})
      console.log("✅ Wallet connection restored")
    } else {
        // also check local storage as a fallback
        const storedAccount = localStorage.getItem("hedera_account")
        if (storedAccount) {
            try {
                const parsed = JSON.parse(storedAccount);
                // a bit of validation
                if(parsed.accountId) {
                    this.currentAccount = parsed;
                    this.emitChange();
                    console.log("✅ Wallet connection restored from Local Storage")
                }
            }
            catch(e){
                localStorage.removeItem("hedera_account");
            }
        }
    }
  }

  async signTransaction(transaction: any): Promise<any> {
    if (!this.hwc || !this.currentAccount) {
      throw new WalletException({
        code: "NO_WALLET_CONNECTED",
        message: "No wallet is currently connected",
      })
    }

    try {
      // transaction is expected to be Uint8Array or Buffer
      const tx = Transaction.fromBytes(transaction)
      return await this.hwc.signAndExecuteTransaction(tx)
    } catch (error: any) {
      throw new WalletException({
        code: "SIGNING_FAILED",
        message: "Failed to sign transaction",
        details: error,
      })
    }
  }
}

export class WalletException extends Error {
  code: string
  details?: any

  constructor({
    code,
    message,
    details,
  }: {
    code: string
    message: string
    details?: any
  }) {
    super(message)
    this.name = "WalletException"
    this.code = code
    this.details = details
  }
}

let walletManagerInstance: HederaWalletManager | null = null

export const getWalletManager = (): Promise<HederaWalletManager> => {
  return new Promise(resolve => {
    if (typeof window === "undefined") {
      resolve(new HederaWalletManager())
      return
    }

    if (!walletManagerInstance) {
      walletManagerInstance = new HederaWalletManager()
    }
    
    // The initialization is now lazy, so we can resolve the instance immediately.
    resolve(walletManagerInstance)
  })
}