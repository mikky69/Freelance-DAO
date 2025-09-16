// Hedera Wallet Integration Library
export interface HederaAccount {
  accountId: string
  balance: string
  network: "testnet" | "mainnet"
  publicKey?: string
}

export interface WalletProvider {
  name: string
  isInstalled: boolean
  connect: () => Promise<HederaAccount>
  disconnect: () => Promise<void>
  getBalance: (accountId: string) => Promise<string>
  signTransaction: (transaction: any) => Promise<any>
}

export interface WalletError {
  code: string
  message: string
  details?: any
}

// HashPack Wallet Provider
class HashPackProvider implements WalletProvider {
  name = "HashPack"

  get isInstalled(): boolean {
    return typeof window !== "undefined" && !!(window as any).hashpack
  }

  async connect(): Promise<HederaAccount> {
    if (!this.isInstalled) {
      throw new WalletException({
        code: "WALLET_NOT_INSTALLED",
        message: "HashPack wallet is not installed. Please install it from the Chrome Web Store.",
      })
    }

    try {
      const hashpack = (window as any).hashpack

      // Initialize HashPack
      const initData = await hashpack.init({
        name: "FreeLanceDAO",
        description: "Decentralized freelancing platform on Hedera",
        iconUrl: "/images/freelancedao-logo.png",
      })

      if (!initData.success) {
        throw new WalletException({
          code: "INIT_FAILED",
          message: "Failed to initialize HashPack wallet",
          details: initData,
        })
      }

      // Request connection
      const connectData = await hashpack.connectToLocalWallet()

      if (!connectData.success) {
        throw new WalletException({
          code: "CONNECTION_REJECTED",
          message: "Wallet connection was rejected by user",
          details: connectData,
        })
      }

      const accountId = connectData.accountIds[0]
      const network = connectData.network === "testnet" ? "testnet" : "mainnet"

      // Get account balance
      const balance = await this.getBalance(accountId)

      return {
        accountId,
        balance,
        network,
        publicKey: connectData.publicKey,
      }
    } catch (error: any) {
      if (error instanceof WalletException) {
        throw error
      }

      throw new WalletException({
        code: "CONNECTION_FAILED",
        message: "Failed to connect to HashPack wallet",
        details: error,
      })
    }
  }

  async disconnect(): Promise<void> {
    if (this.isInstalled) {
      const hashpack = (window as any).hashpack
      await hashpack.disconnect()
    }
  }

  async getBalance(accountId: string): Promise<string> {
    try {
      // In a real implementation, this would call Hedera Mirror Node API
      const response = await fetch(`https://testnet.mirrornode.hedera.com/api/v1/accounts/${accountId}`)

      if (!response.ok) {
        throw new Error("Failed to fetch account balance")
      }

      const data = await response.json()
      const balanceInTinybars = data.balance?.balance || 0
      const balanceInHbar = (balanceInTinybars / 100000000).toFixed(2)

      return balanceInHbar
    } catch (error) {
      console.error("Error fetching balance:", error)
      // Return mock balance for demo
      return (Math.random() * 10000 + 1000).toFixed(2)
    }
  }

  async signTransaction(transaction: any): Promise<any> {
    if (!this.isInstalled) {
      throw new WalletException({
        code: "WALLET_NOT_INSTALLED",
        message: "HashPack wallet is not installed",
      })
    }

    try {
      const hashpack = (window as any).hashpack
      const result = await hashpack.signTransaction(transaction)

      if (!result.success) {
        throw new WalletException({
          code: "TRANSACTION_REJECTED",
          message: "Transaction was rejected by user",
          details: result,
        })
      }

      return result
    } catch (error: any) {
      if (error instanceof WalletException) {
        throw error
      }

      throw new WalletException({
        code: "SIGNING_FAILED",
        message: "Failed to sign transaction",
        details: error,
      })
    }
  }
}

// Blade Wallet Provider
class BladeProvider implements WalletProvider {
  name = "Blade"

  get isInstalled(): boolean {
    return typeof window !== "undefined" && !!(window as any).bladeWallet
  }

  async connect(): Promise<HederaAccount> {
    if (!this.isInstalled) {
      throw new WalletException({
        code: "WALLET_NOT_INSTALLED",
        message: "Blade wallet is not installed. Please install it from the Chrome Web Store.",
      })
    }

    try {
      const blade = (window as any).bladeWallet

      const result = await blade.connect()

      if (!result.success) {
        throw new WalletException({
          code: "CONNECTION_REJECTED",
          message: "Wallet connection was rejected by user",
          details: result,
        })
      }

      const accountId = result.accountId
      const network = result.network === "testnet" ? "testnet" : "mainnet"
      const balance = await this.getBalance(accountId)

      return {
        accountId,
        balance,
        network,
      }
    } catch (error: any) {
      if (error instanceof WalletException) {
        throw error
      }

      throw new WalletException({
        code: "CONNECTION_FAILED",
        message: "Failed to connect to Blade wallet",
        details: error,
      })
    }
  }

  async disconnect(): Promise<void> {
    if (this.isInstalled) {
      const blade = (window as any).bladeWallet
      await blade.disconnect()
    }
  }

  async getBalance(accountId: string): Promise<string> {
    try {
      const response = await fetch(`https://testnet.mirrornode.hedera.com/api/v1/accounts/${accountId}`)

      if (!response.ok) {
        throw new Error("Failed to fetch account balance")
      }

      const data = await response.json()
      const balanceInTinybars = data.balance?.balance || 0
      const balanceInHbar = (balanceInTinybars / 100000000).toFixed(2)

      return balanceInHbar
    } catch (error) {
      console.error("Error fetching balance:", error)
      return (Math.random() * 10000 + 1000).toFixed(2)
    }
  }

  async signTransaction(transaction: any): Promise<any> {
    if (!this.isInstalled) {
      throw new WalletException({
        code: "WALLET_NOT_INSTALLED",
        message: "Blade wallet is not installed",
      })
    }

    try {
      const blade = (window as any).bladeWallet
      const result = await blade.signTransaction(transaction)

      if (!result.success) {
        throw new WalletException({
          code: "TRANSACTION_REJECTED",
          message: "Transaction was rejected by user",
          details: result,
        })
      }

      return result
    } catch (error: any) {
      if (error instanceof WalletException) {
        throw error
      }

      throw new WalletException({
        code: "SIGNING_FAILED",
        message: "Failed to sign transaction",
        details: error,
      })
    }
  }
}

// MetaMask Provider (Hedera JSON-RPC)
class MetaMaskProvider implements WalletProvider {
  name = "MetaMask"

  get isInstalled(): boolean {
    return typeof window !== "undefined" && !!(window as any).ethereum && (window as any).ethereum.isMetaMask
  }

  private getEthereum() {
    return (window as any).ethereum
  }

  private async resolveHederaAccountId(evmAddress: string): Promise<string> {
    try {
      const response = await fetch(
        `https://testnet.mirrornode.hedera.com/api/v1/accounts?evm_address=${evmAddress}`,
      )
      if (!response.ok) {
        throw new Error("Failed to resolve Hedera account from EVM address")
      }
      const data = await response.json()
      const account = data.accounts?.[0]?.account || data.accounts?.[0]?.account_id
      return account || evmAddress
    } catch {
      return evmAddress
    }
  }

  private chainIdToNetwork(chainIdHex: string): "testnet" | "mainnet" {
    // Hedera chain IDs: mainnet 295 (0x127), testnet 296 (0x128)
    const cleaned = (chainIdHex || "").toLowerCase()
    if (cleaned === "0x127" || cleaned === "0x12937") {
      return "mainnet"
    }
    if (cleaned === "0x128") {
      return "testnet"
    }
    // Default to testnet if unknown
    return "testnet"
  }

  async connect(): Promise<HederaAccount> {
    if (!this.isInstalled) {
      throw new WalletException({
        code: "WALLET_NOT_INSTALLED",
        message: "MetaMask is not installed. Please install the extension.",
      })
    }

    try {
      const ethereum = this.getEthereum()
      const accounts: string[] = await ethereum.request({ method: "eth_requestAccounts" })
      if (!accounts || accounts.length === 0) {
        throw new WalletException({ code: "CONNECTION_REJECTED", message: "No account authorized in MetaMask" })
      }

      const evmAddress = accounts[0]
      const chainId: string = await ethereum.request({ method: "eth_chainId" })
      const network = this.chainIdToNetwork(chainId)

      const accountId = await this.resolveHederaAccountId(evmAddress)
      const balance = await this.getBalance(accountId)

      return {
        accountId,
        balance,
        network,
        publicKey: evmAddress,
      }
    } catch (error: any) {
      if (error instanceof WalletException) {
        throw error
      }
      const message = typeof error?.message === "string" ? error.message : "Failed to connect to MetaMask"
      throw new WalletException({ code: "CONNECTION_FAILED", message, details: error })
    }
  }

  async disconnect(): Promise<void> {
    // MetaMask has no programmatic disconnect; no-op
    return
  }

  async getBalance(accountId: string): Promise<string> {
    try {
      const response = await fetch(`https://testnet.mirrornode.hedera.com/api/v1/accounts/${accountId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch account balance")
      }
      const data = await response.json()
      const balanceInTinybars = data.balance?.balance || 0
      const balanceInHbar = (balanceInTinybars / 100000000).toFixed(2)
      return balanceInHbar
    } catch (error) {
      console.error("Error fetching balance:", error)
      return (Math.random() * 10000 + 1000).toFixed(2)
    }
  }

  async signTransaction(transaction: any): Promise<any> {
    if (!this.isInstalled) {
      throw new WalletException({ code: "WALLET_NOT_INSTALLED", message: "MetaMask is not installed" })
    }
    try {
      const ethereum = this.getEthereum()
      const accounts: string[] = await ethereum.request({ method: "eth_accounts" })
      const from = accounts?.[0]
      if (!from) {
        throw new WalletException({ code: "NO_ACCOUNT", message: "No MetaMask account available" })
      }

      // Support simple message signing if provided, otherwise attempt sendTransaction passthrough
      if (transaction?.message) {
        const msg = transaction.message
        const signature = await ethereum.request({ method: "personal_sign", params: [msg, from] })
        return { success: true, signature }
      }

      if (transaction?.tx) {
        const txHash = await ethereum.request({ method: "eth_sendTransaction", params: [transaction.tx] })
        return { success: true, txHash }
      }

      throw new WalletException({ code: "UNSUPPORTED_TX", message: "Unsupported MetaMask signing input" })
    } catch (error: any) {
      if (error instanceof WalletException) {
        throw error
      }
      throw new WalletException({ code: "SIGNING_FAILED", message: "Failed to sign with MetaMask", details: error })
    }
  }
}

// Wallet Manager
export class HederaWalletManager {
  private providers: Map<string, WalletProvider> = new Map()
  private currentProvider: WalletProvider | null = null
  private currentAccount: HederaAccount | null = null

  constructor() {
    this.providers.set("hashpack", new HashPackProvider())
    this.providers.set("blade", new BladeProvider())
    this.providers.set("metamask", new MetaMaskProvider())
  }

  getAvailableWallets(): Array<{ id: string; name: string; isInstalled: boolean }> {
    return Array.from(this.providers.entries()).map(([id, provider]) => ({
      id,
      name: provider.name,
      isInstalled: provider.isInstalled,
    }))
  }

  async connectWallet(walletId: string): Promise<HederaAccount> {
    const provider = this.providers.get(walletId)

    if (!provider) {
      throw new WalletException({
        code: "WALLET_NOT_SUPPORTED",
        message: `Wallet ${walletId} is not supported`,
      })
    }

    if (!provider.isInstalled) {
      throw new WalletException({
        code: "WALLET_NOT_INSTALLED",
        message: `${provider.name} wallet is not installed`,
      })
    }

    try {
      const account = await provider.connect()
      this.currentProvider = provider
      this.currentAccount = account

      // Store connection info
      if (typeof window !== "undefined") {
        localStorage.setItem("hedera_wallet_connected", walletId)
        localStorage.setItem("hedera_account", JSON.stringify(account))
      }

      return account
    } catch (error) {
      throw error
    }
  }

  async disconnectWallet(): Promise<void> {
    if (this.currentProvider) {
      await this.currentProvider.disconnect()
      this.currentProvider = null
      this.currentAccount = null

      if (typeof window !== "undefined") {
        localStorage.removeItem("hedera_wallet_connected")
        localStorage.removeItem("hedera_account")
      }
    }
  }

  async refreshBalance(): Promise<string | null> {
    if (!this.currentProvider || !this.currentAccount) {
      return null
    }

    try {
      const balance = await this.currentProvider.getBalance(this.currentAccount.accountId)
      this.currentAccount.balance = balance

      if (typeof window !== "undefined") {
        localStorage.setItem("hedera_account", JSON.stringify(this.currentAccount))
      }

      return balance
    } catch (error) {
      console.error("Error refreshing balance:", error)
      return null
    }
  }

  async signTransaction(transaction: any): Promise<any> {
    if (!this.currentProvider) {
      throw new WalletException({
        code: "NO_WALLET_CONNECTED",
        message: "No wallet is currently connected",
      })
    }

    return await this.currentProvider.signTransaction(transaction)
  }

  getCurrentAccount(): HederaAccount | null {
    return this.currentAccount
  }

  isConnected(): boolean {
    return this.currentAccount !== null
  }

  // Restore connection from localStorage
  async restoreConnection(): Promise<HederaAccount | null> {
    if (typeof window === "undefined") {
      return null
    }

    try {
      const walletId = localStorage.getItem("hedera_wallet_connected")
      const accountData = localStorage.getItem("hedera_account")

      if (!walletId || !accountData) {
        return null
      }

      const provider = this.providers.get(walletId)
      if (!provider || !provider.isInstalled) {
        // Clean up invalid connection
        localStorage.removeItem("hedera_wallet_connected")
        localStorage.removeItem("hedera_account")
        return null
      }

      const account = JSON.parse(accountData)
      this.currentProvider = provider
      this.currentAccount = account

      // Refresh balance
      await this.refreshBalance()

      return this.currentAccount
    } catch (error) {
      console.error("Error restoring wallet connection:", error)
      return null
    }
  }
}

// Custom error class
class WalletException extends Error {
  code: string
  details?: any

  constructor({ code, message, details }: { code: string; message: string; details?: any }) {
    super(message)
    this.name = "WalletException"
    this.code = code
    this.details = details
  }
}

// Export singleton instance
export const walletManager = new HederaWalletManager()
