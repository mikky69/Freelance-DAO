"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Wallet, ExternalLink, Copy, AlertCircle, CheckCircle,
  Clock, ArrowUpRight, ArrowDownLeft, RefreshCw, Activity, Shield,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { ProtectedRoute } from "@/components/protected-route"
import { useAccount, useBalance, useDisconnect } from "wagmi"

export default function WalletPage() {
  const { address, isConnected, chain } = useAccount()
  const { data: balanceData, refetch, isRefetching } = useBalance({ address })
  const { disconnect } = useDisconnect()
  const [copying, setCopying] = useState(false)

  const copyAddress = async () => {
    if (!address) return
    setCopying(true)
    await navigator.clipboard.writeText(address)
    toast.success("Address copied to clipboard")
    setTimeout(() => setCopying(false), 1500)
  }

  const refreshBalance = async () => {
    await refetch()
    toast.success("Balance updated")
  }

  const shortAddress = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : ""
  const balanceFormatted = balanceData
    ? `${Number(balanceData.formatted).toFixed(6)} ${balanceData.symbol}`
    : "—"

  // Placeholder transactions — replace with real indexer/subgraph data when available
  const transactions = [
    { type: "Received", amount: "+0.35 ETH", from: "TechStartup Inc.", description: "Escrow release — E-commerce project", date: "Mar 10, 2025", status: "Confirmed", txHash: "0x1a2b3c4d" },
    { type: "Sent", amount: "-0.005 ETH", to: "Platform Fee", description: "FreeLanceDAO service fee", date: "Mar 10, 2025", status: "Confirmed", txHash: "0x2b3c4d5e" },
    { type: "Pending", amount: "+0.18 ETH", from: "DesignCorp", description: "Escrow release pending approval", date: "Mar 12, 2025", status: "Pending", txHash: "0x3c4d5e6f" },
  ]

  return (
    <ProtectedRoute requireAuth={true} requireCompleteProfile={true}>
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-200">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Wallet</h1>
                <p className="text-slate-600">Manage your ETH and view transaction history</p>
              </div>
              <div className="flex items-center space-x-3">
                {isConnected ? (
                  <Badge className="bg-green-100 text-green-700">
                    <CheckCircle className="w-4 h-4 mr-1" />Wallet Connected
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                    <AlertCircle className="w-4 h-4 mr-1" />Not Connected
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {!isConnected ? (
            <div className="max-w-lg mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Wallet className="w-5 h-5 mr-2 text-blue-500" />Connect Your Wallet
                  </CardTitle>
                  <CardDescription>
                    Use the connect button in the navigation bar to connect MetaMask, Coinbase Wallet, or any WalletConnect-compatible wallet.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      FreeLanceDAO runs on Base Sepolia. Make sure your wallet is set to the correct network.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Balance Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Wallet className="w-5 h-5 mr-2 text-blue-500" />Wallet Balance
                      </div>
                      <Button variant="ghost" size="sm" onClick={refreshBalance} disabled={isRefetching}>
                        <RefreshCw className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`} />
                      </Button>
                    </CardTitle>
                    <CardDescription>Your current ETH balance on Base Sepolia</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-slate-800 mb-2">{balanceFormatted}</div>
                        <div className="text-sm text-slate-500">{chain?.name ?? "Base Sepolia"}</div>
                      </div>
                      <div className="flex items-center justify-center space-x-2 text-sm text-slate-600">
                        <span>Address:</span>
                        <code className="bg-slate-100 px-2 py-1 rounded font-mono text-xs">{shortAddress}</code>
                        <Button variant="ghost" size="sm" onClick={copyAddress} disabled={copying}>
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => window.open(`https://sepolia.basescan.org/address/${address}`, "_blank")}>
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex justify-center pt-2">
                        <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => disconnect()}>
                          Disconnect Wallet
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Quick Stats</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">3</div>
                      <div className="text-sm text-blue-700">Active Escrows</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">Base Sepolia</div>
                      <div className="text-sm text-purple-700">Network</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">84532</div>
                      <div className="text-sm text-green-700">Chain ID</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Transactions */}
              <Tabs defaultValue="transactions" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="transactions">Transactions</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="transactions" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Activity className="w-5 h-5 mr-2" />Transaction History
                      </CardTitle>
                      <CardDescription>Recent on-chain activity</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {transactions.map((tx, i) => (
                          <div key={i} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                            <div className="flex items-center space-x-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === "Received" ? "bg-green-100" : tx.type === "Sent" ? "bg-red-100" : "bg-yellow-100"}`}>
                                {tx.type === "Received" ? <ArrowDownLeft className="w-5 h-5 text-green-600" /> : tx.type === "Sent" ? <ArrowUpRight className="w-5 h-5 text-red-600" /> : <Clock className="w-5 h-5 text-yellow-600" />}
                              </div>
                              <div>
                                <h4 className="font-medium text-slate-800">{tx.description}</h4>
                                <div className="flex items-center space-x-2 text-sm text-slate-600">
                                  <span>{tx.type === "Received" ? `From: ${tx.from}` : `To: ${tx.to}`}</span>
                                  <span>•</span><span>{tx.date}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`font-semibold ${tx.type === "Received" ? "text-green-600" : tx.type === "Sent" ? "text-red-600" : "text-yellow-600"}`}>{tx.amount}</div>
                              <div className="flex items-center space-x-2">
                                <Badge className={tx.status === "Confirmed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>{tx.status}</Badge>
                                <Button variant="ghost" size="sm" onClick={() => window.open(`https://sepolia.basescan.org/tx/${tx.txHash}`, "_blank")}>
                                  <ExternalLink className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="settings" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Wallet Settings</CardTitle>
                      <CardDescription>Manage your wallet preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                        <div>
                          <h4 className="font-medium text-slate-800">Network</h4>
                          <p className="text-sm text-slate-600">Connected to {chain?.name ?? "Base Sepolia"}</p>
                        </div>
                        <Badge className="bg-orange-100 text-orange-700">Testnet</Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                        <div>
                          <h4 className="font-medium text-slate-800">Full Address</h4>
                          <code className="text-xs text-slate-600 font-mono">{address}</code>
                        </div>
                        <Button variant="outline" size="sm" onClick={copyAddress}>
                          <Copy className="w-4 h-4 mr-1" />Copy
                        </Button>
                      </div>
                      <div className="pt-2">
                        <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50" onClick={() => disconnect()}>
                          Disconnect Wallet
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}