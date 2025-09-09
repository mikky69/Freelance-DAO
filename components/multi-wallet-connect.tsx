"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Wallet,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Shield,
  Zap,
  DollarSign,
  Copy,
  UnplugIcon as Disconnect,
  Loader2,
  Sparkles,
  TrendingUp,
  RefreshCw,
  AlertTriangle,
  Download,
} from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { walletManager, type HederaAccount, type WalletError } from "@/lib/hedera-wallet"

interface MultiWalletConnectProps {
  onConnectionChange?: (connected: boolean, account?: HederaAccount, walletType?: 'hedera' | 'solana') => void
  showDialog?: boolean
}

type WalletType = 'hedera' | 'solana'

interface SolanaAccount {
  publicKey: string
  balance: string
  network: string
}

export function MultiWalletConnect({ onConnectionChange, showDialog = true }: MultiWalletConnectProps) {
  const [account, setAccount] = useState<HederaAccount | SolanaAccount | null>(null)
  const [walletType, setWalletType] = useState<WalletType | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showWalletDialog, setShowWalletDialog] = useState(false)
  const [showHederaWallets, setShowHederaWallets] = useState(false)
  const [showSolanaWallets, setShowSolanaWallets] = useState(false)
  const [availableHederaWallets, setAvailableHederaWallets] = useState<Array<{ id: string; name: string; isInstalled: boolean }>>([])
  const [connectionError, setConnectionError] = useState<string | null>(null)

  useEffect(() => {
    // Get available Hedera wallets
    const hederaWallets = walletManager.getAvailableWallets()
    setAvailableHederaWallets(hederaWallets)

    // Try to restore previous connection
    restoreConnection()
  }, [])

  const restoreConnection = async () => {
    try {
      const restoredAccount = await walletManager.restoreConnection()
      if (restoredAccount) {
        setAccount(restoredAccount)
        setWalletType('hedera')
        onConnectionChange?.(true, restoredAccount, 'hedera')
        toast.success("Wallet connection restored")
      }
    } catch (error) {
      console.error("Failed to restore wallet connection:", error)
    }
  }

  const connectHederaWallet = async (walletId: string, walletName: string) => {
    setIsConnecting(true)
    setConnectionError(null)

    try {
      const connectedAccount = await walletManager.connectWallet(walletId)
      setAccount(connectedAccount)
      setWalletType('hedera')
      onConnectionChange?.(true, connectedAccount, 'hedera')
      toast.success(`${walletName} wallet connected successfully!`)
      setShowWalletDialog(false)
      setShowHederaWallets(false)
    } catch (error: any) {
      const walletError = error as WalletError
      let errorMessage = walletError.message

      switch (walletError.code) {
        case "WALLET_NOT_INSTALLED":
          errorMessage = `${walletName} is not installed. Please install it and refresh the page.`
          break
        case "CONNECTION_REJECTED":
          errorMessage = "Connection was rejected. Please try again and approve the connection."
          break
        case "INIT_FAILED":
          errorMessage = "Failed to initialize wallet. Please refresh the page and try again."
          break
        default:
          errorMessage = `Failed to connect ${walletName}. ${walletError.message}`
      }

      setConnectionError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsConnecting(false)
    }
  }

  const connectSolanaWallet = async (walletName: string) => {
    setIsConnecting(true)
    setConnectionError(null)

    try {
      // Check if Solana wallet is available
      if (typeof window !== 'undefined' && (window as any).solana) {
        const solana = (window as any).solana
        
        if (solana.isPhantom) {
          const response = await solana.connect()
          const publicKey = response.publicKey.toString()
          
          // Mock balance for now - in real implementation, you'd fetch from Solana network
          const mockAccount: SolanaAccount = {
            publicKey,
            balance: "0.00",
            network: "devnet"
          }
          
          setAccount(mockAccount)
          setWalletType('solana')
          onConnectionChange?.(true, mockAccount as any, 'solana')
          toast.success(`${walletName} wallet connected successfully!`)
          setShowWalletDialog(false)
          setShowSolanaWallets(false)
        } else {
          throw new Error("Phantom wallet not detected")
        }
      } else {
        throw new Error("Solana wallet not installed")
      }
    } catch (error: any) {
      let errorMessage = "Failed to connect Solana wallet"
      
      if (error.message.includes("not installed") || error.message.includes("not detected")) {
        errorMessage = `${walletName} is not installed. Please install it and refresh the page.`
      } else if (error.code === 4001) {
        errorMessage = "Connection was rejected. Please try again and approve the connection."
      } else {
        errorMessage = `Failed to connect ${walletName}. ${error.message}`
      }

      setConnectionError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = async () => {
    try {
      if (walletType === 'hedera') {
        await walletManager.disconnectWallet()
      } else if (walletType === 'solana' && typeof window !== 'undefined' && (window as any).solana) {
        await (window as any).solana.disconnect()
      }
      
      setAccount(null)
      setWalletType(null)
      onConnectionChange?.(false)
      toast.success("Wallet disconnected")
    } catch (error) {
      toast.error("Failed to disconnect wallet")
    }
  }

  const refreshBalance = async () => {
    if (!account || !walletType) return

    setIsRefreshing(true)
    try {
      if (walletType === 'hedera') {
        const newBalance = await walletManager.refreshBalance()
        if (newBalance) {
          setAccount({ ...account, balance: newBalance })
          toast.success("Balance updated")
        }
      } else if (walletType === 'solana') {
        // In real implementation, fetch Solana balance here
        toast.success("Balance updated")
      }
    } catch (error) {
      toast.error("Failed to refresh balance")
    } finally {
      setIsRefreshing(false)
    }
  }

  const copyAddress = () => {
    if (walletType === 'hedera' && (account as HederaAccount)?.accountId) {
      navigator.clipboard.writeText((account as HederaAccount).accountId)
      toast.success("Account ID copied to clipboard")
    } else if (walletType === 'solana' && (account as SolanaAccount)?.publicKey) {
      navigator.clipboard.writeText((account as SolanaAccount).publicKey)
      toast.success("Public key copied to clipboard")
    }
  }

  const getHederaWalletConfig = (walletId: string) => {
    const configs = {
      hashpack: {
        name: "HashPack",
        description: "The most popular Hedera wallet",
        icon: "🔐",
        recommended: true,
        gradient: "from-purple-500 to-purple-600",
        installUrl: "https://chrome.google.com/webstore/detail/hashpack/gjagmgiddbbciopjhllkdnddhcglnemk",
      },
      blade: {
        name: "Blade Wallet",
        description: "User-friendly with DeFi features",
        icon: "⚡",
        recommended: false,
        gradient: "from-blue-500 to-blue-600",
        installUrl: "https://chrome.google.com/webstore/detail/blade-hedera-web3-digital/abogmiocnneedmmepnohnhlijcjpcifd",
      },
      kabila: {
        name: "Kabila Wallet",
        description: "Enterprise-grade security",
        icon: "🛡️",
        recommended: false,
        gradient: "from-green-500 to-green-600",
        installUrl: "#",
      },
    }
    return configs[walletId as keyof typeof configs]
  }

  const getSolanaWallets = () => {
    return [
      {
        id: "phantom",
        name: "Phantom",
        description: "The most popular Solana wallet",
        icon: "👻",
        recommended: true,
        gradient: "from-purple-500 to-indigo-600",
        installUrl: "https://phantom.app/",
        isInstalled: typeof window !== 'undefined' && !!(window as any).solana?.isPhantom
      },
      {
        id: "solflare",
        name: "Solflare",
        description: "Secure Solana wallet",
        icon: "🔥",
        recommended: false,
        gradient: "from-orange-500 to-red-600",
        installUrl: "https://solflare.com/",
        isInstalled: false // Add detection logic for Solflare
      }
    ]
  }

  if (account) {
    const isHedera = walletType === 'hedera'
    const displayBalance = isHedera ? `${account.balance} HBAR` : `${account.balance} SOL`
    const displayAddress = isHedera ? (account as HederaAccount).accountId : (account as SolanaAccount).publicKey
    
    return (
      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div className="absolute inset-0 animate-ping">
                  <CheckCircle className="w-5 h-5 text-green-400 opacity-75" />
                </div>
              </div>
              <span className="text-green-800">{isHedera ? 'Hedera' : 'Solana'} Wallet Connected</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-100 text-green-700 animate-pulse">
                <Sparkles className="w-3 h-3 mr-1" />
                {account.network}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshBalance}
                disabled={isRefreshing}
                className="hover:bg-green-100"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white/70 backdrop-blur-sm p-4 rounded-lg border border-green-200/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600 font-medium">
                {isHedera ? 'Account ID:' : 'Public Key:'}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyAddress}
                className="hover:bg-green-100 transition-colors duration-200"
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
            <div className="font-mono text-sm text-slate-800 break-all bg-slate-50 p-2 rounded border">
              {displayAddress}
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 rounded-lg text-white">
            <div className="text-sm opacity-90 mb-1">Balance:</div>
            <div className="text-2xl font-bold flex items-center">
              {displayBalance}
              <TrendingUp className="w-5 h-5 ml-2 animate-bounce" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-blue-50 rounded-lg text-center group hover:bg-blue-100 transition-colors duration-200">
              <Shield className="w-6 h-6 text-blue-500 mx-auto mb-1 group-hover:scale-110 transition-transform duration-200" />
              <div className="text-xs text-blue-700 font-medium">Secure</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg text-center group hover:bg-green-100 transition-colors duration-200">
              <Zap className="w-6 h-6 text-green-500 mx-auto mb-1 group-hover:scale-110 transition-transform duration-200" />
              <div className="text-xs text-green-700 font-medium">Fast</div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg text-center group hover:bg-purple-100 transition-colors duration-200">
              <DollarSign className="w-6 h-6 text-purple-500 mx-auto mb-1 group-hover:scale-110 transition-transform duration-200" />
              <div className="text-xs text-purple-700 font-medium">Low Cost</div>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={disconnectWallet}
            className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200 bg-transparent"
          >
            <Disconnect className="w-4 h-4 mr-2" />
            Disconnect Wallet
          </Button>
        </CardContent>
      </Card>
    )
  }

  const walletSelectionContent = (
    <>
      {connectionError && (
        <Alert className="mb-4 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-800">{connectionError}</AlertDescription>
        </Alert>
      )}

      {!showHederaWallets && !showSolanaWallets && (
        <div className="space-y-3">
          {/* Hedera Wallet Option */}
          <Card
            className="cursor-pointer transition-all duration-300 border-slate-200 hover:shadow-lg hover:scale-105 hover:border-purple-300"
            onClick={() => setShowHederaWallets(true)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                    🌐
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-800">Hedera Wallet</span>
                      {/* <Badge className="bg-green-100 text-green-700 text-xs animate-pulse">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Recommended
                      </Badge> */}
                    </div>
                    <p className="text-sm text-slate-600">Fast, secure, and eco-friendly</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-purple-500 transition-colors duration-200" />
              </div>
            </CardContent>
          </Card>

          {/* Solana Wallet Option */}
          <Card
            className="cursor-pointer transition-all duration-300 border-slate-200 hover:shadow-lg hover:scale-105 hover:border-indigo-300"
            onClick={() => setShowSolanaWallets(true)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                    ☀️
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-800">Solana Wallet</span>
                    </div>
                    <p className="text-sm text-slate-600">High-speed blockchain network</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors duration-200" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Hedera Wallets List */}
      {showHederaWallets && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Hedera Wallets</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHederaWallets(false)}
              className="text-slate-500 hover:text-slate-700"
            >
              ← Back
            </Button>
          </div>
          {availableHederaWallets.map((wallet) => {
            const config = getHederaWalletConfig(wallet.id)
            if (!config) return null

            return (
              <Card
                key={wallet.id}
                className={`cursor-pointer transition-all duration-300 border-slate-200 ${
                  wallet.isInstalled
                    ? "hover:shadow-lg hover:scale-105 hover:border-blue-300"
                    : "opacity-60 cursor-not-allowed"
                }`}
                onClick={() => {
                  if (wallet.isInstalled) {
                    connectHederaWallet(wallet.id, config.name)
                  }
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 bg-gradient-to-r ${config.gradient} rounded-xl flex items-center justify-center text-2xl shadow-lg`}>
                        {config.icon}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-slate-800">{config.name}</span>
                          {/* {config.recommended && (
                            <Badge className="bg-green-100 text-green-700 text-xs animate-pulse">
                              <Sparkles className="w-3 h-3 mr-1" />
                              Recommended
                            </Badge>
                          )} */}
                          {!wallet.isInstalled && (
                            <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs">
                              Not Installed
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-600">{config.description}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-center space-y-2">
                      {isConnecting ? (
                        <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                      ) : wallet.isInstalled ? (
                        <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors duration-200" />
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(config.installUrl, "_blank")
                          }}
                          className="text-xs"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Solana Wallets List */}
      {showSolanaWallets && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Solana Wallets</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSolanaWallets(false)}
              className="text-slate-500 hover:text-slate-700"
            >
              ← Back
            </Button>
          </div>
          {getSolanaWallets().map((wallet) => (
            <Card
              key={wallet.id}
              className={`cursor-pointer transition-all duration-300 border-slate-200 ${
                wallet.isInstalled
                  ? "hover:shadow-lg hover:scale-105 hover:border-purple-300"
                  : "opacity-60 cursor-not-allowed"
              }`}
              onClick={() => {
                if (wallet.isInstalled) {
                  connectSolanaWallet(wallet.name)
                }
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 bg-gradient-to-r ${wallet.gradient} rounded-xl flex items-center justify-center text-2xl shadow-lg`}>
                      {wallet.icon}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-800">{wallet.name}</span>
                        {wallet.recommended && (
                          <Badge className="bg-green-100 text-green-700 text-xs animate-pulse">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Recommended
                          </Badge>
                        )}
                        {!wallet.isInstalled && (
                          <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs">
                            Not Installed
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">{wallet.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    {isConnecting ? (
                      <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
                    ) : wallet.isInstalled ? (
                      <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-purple-500 transition-colors duration-200" />
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(wallet.installUrl, "_blank")
                        }}
                        className="text-xs"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Install
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="text-center pt-4 border-t border-slate-200">
        <p className="text-sm text-slate-600 mb-3">New to crypto wallets?</p>
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 bg-transparent"
            onClick={() => window.open("https://docs.hedera.com/hedera/getting-started/introduction", "_blank")}
          >
            <ExternalLink className="w-3 h-3 mr-2" />
            Learn About Wallets
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-500 hover:text-blue-600 transition-colors duration-200"
            onClick={() => window.open("https://hedera.com/wallets", "_blank")}
          >
            View all supported wallets
            <ExternalLink className="w-3 h-3 ml-2" />
          </Button>
        </div>
      </div>
    </>
  )

  if (showDialog) {
    return (
      <div>
        {connectionError && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-800">{connectionError}</AlertDescription>
          </Alert>
        )}

        <Dialog open={showWalletDialog} onOpenChange={setShowWalletDialog}>
          <DialogTrigger asChild>
            <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg transform transition-all duration-200 hover:scale-105">
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-blue-500" />
                <span>Choose Wallet Type</span>
              </DialogTitle>
              <DialogDescription>Select your preferred blockchain wallet</DialogDescription>
            </DialogHeader>
            {walletSelectionContent}
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div>
      {connectionError && (
        <Alert className="mb-4 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-800">{connectionError}</AlertDescription>
        </Alert>
      )}
      {walletSelectionContent}
    </div>
  )
}