"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Wallet,
  Send,
  Download,
  ExternalLink,
  Copy,
  QrCode,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Activity,
} from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { HederaWalletConnect } from "@/components/hedera-wallet-connect"
import { walletManager, type HederaAccount } from "@/lib/hedera-wallet"
import { ProtectedRoute } from "@/components/protected-route"

export default function WalletPage() {
  const [account, setAccount] = useState<HederaAccount | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [sendAmount, setSendAmount] = useState("")
  const [recipientAddress, setRecipientAddress] = useState("")
  const [memo, setMemo] = useState("")
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    // Check if wallet is already connected
    const currentAccount = walletManager.getCurrentAccount()
    if (currentAccount) {
      setAccount(currentAccount)
    }
  }, [])

  const handleConnectionChange = (connected: boolean, connectedAccount?: HederaAccount) => {
    if (connected && connectedAccount) {
      setAccount(connectedAccount)
    } else {
      setAccount(null)
    }
  }

  const refreshBalance = async () => {
    if (!account) return

    setIsRefreshing(true)
    try {
      const newBalance = await walletManager.refreshBalance()
      if (newBalance) {
        setAccount({ ...account, balance: newBalance })
        toast.success("Balance updated")
      }
    } catch (error) {
      toast.error("Failed to refresh balance")
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleSendHBAR = async () => {
    if (!account || !sendAmount || !recipientAddress) {
      toast.error("Please fill in all required fields")
      return
    }

    const amount = Number.parseFloat(sendAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    const balance = Number.parseFloat(account.balance)
    if (amount > balance) {
      toast.error("Insufficient balance")
      return
    }

    setIsSending(true)
    try {
      // In a real implementation, this would create and sign a transaction
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast.success(`Successfully sent ${amount} HBAR to ${recipientAddress}`)
      setSendAmount("")
      setRecipientAddress("")
      setMemo("")

      // Refresh balance after sending
      await refreshBalance()
    } catch (error) {
      toast.error("Failed to send HBAR. Please try again.")
    } finally {
      setIsSending(false)
    }
  }

  const copyAddress = () => {
    if (account?.accountId) {
      navigator.clipboard.writeText(account.accountId)
      toast.success("Account ID copied to clipboard")
    }
  }

  const transactions = [
    {
      id: "TXN-001",
      type: "Received",
      amount: "+3,500 HBAR",
      from: "TechStartup Inc.",
      description: "Payment for E-commerce Website Development",
      date: "Dec 10, 2024",
      status: "Confirmed",
      txHash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
    },
    {
      id: "TXN-002",
      type: "Sent",
      amount: "-50 HBAR",
      to: "Platform Fee",
      description: "FreeLanceDAO service fee",
      date: "Dec 10, 2024",
      status: "Confirmed",
      txHash: "0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c",
    },
    {
      id: "TXN-003",
      type: "Received",
      amount: "+2,200 HBAR",
      from: "DesignCorp",
      description: "Payment for Mobile App UI Design",
      date: "Dec 8, 2024",
      status: "Confirmed",
      txHash: "0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d",
    },
    {
      id: "TXN-004",
      type: "Pending",
      amount: "+1,800 HBAR",
      from: "CryptoLabs",
      description: "Escrow release pending approval",
      date: "Dec 12, 2024",
      status: "Pending",
      txHash: "0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e",
    },
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
                <p className="text-slate-600">Manage your HBAR and view transaction history</p>
              </div>
              <div className="flex items-center space-x-3">
                {account ? (
                  <Badge className="bg-green-100 text-green-700">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Wallet Connected
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Wallet Not Connected
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {!account ? (
            /* Wallet Connection */
            <div className="max-w-2xl mx-auto">
              <HederaWalletConnect onConnectionChange={handleConnectionChange} />
            </div>
          ) : (
            /* Wallet Dashboard */
            <div className="space-y-8">
              {/* Balance Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Wallet className="w-5 h-5 mr-2 text-blue-500" />
                        Wallet Balance
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={refreshBalance}
                        disabled={isRefreshing}
                        className="hover:bg-blue-50"
                      >
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                      </Button>
                    </CardTitle>
                    <CardDescription>Your current HBAR balance and wallet information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-slate-800 mb-2">{account.balance} HBAR</div>
                        <div className="text-lg text-slate-600">
                          ≈ ${(Number.parseFloat(account.balance) * 0.1).toFixed(2)} USD
                        </div>
                      </div>

                      <div className="flex items-center justify-center space-x-2 text-sm text-slate-600">
                        <span>Account ID:</span>
                        <code className="bg-slate-100 px-2 py-1 rounded font-mono">{account.accountId}</code>
                        <Button variant="ghost" size="sm" onClick={copyAddress}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="flex justify-center space-x-4 pt-4">
                        <Button className="bg-green-500 hover:bg-green-600">
                          <Download className="w-4 h-4 mr-2" />
                          Receive
                        </Button>
                        <Button variant="outline">
                          <Send className="w-4 h-4 mr-2" />
                          Send
                        </Button>
                        <Button variant="outline">
                          <QrCode className="w-4 h-4 mr-2" />
                          QR Code
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">+5,700</div>
                      <div className="text-sm text-green-700">HBAR This Month</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">3</div>
                      <div className="text-sm text-blue-700">Active Escrows</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">47</div>
                      <div className="text-sm text-purple-700">Total Transactions</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Wallet Actions */}
              <Tabs defaultValue="transactions" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="transactions">Transactions</TabsTrigger>
                  <TabsTrigger value="send">Send HBAR</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="transactions" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Activity className="w-5 h-5 mr-2" />
                        Transaction History
                      </CardTitle>
                      <CardDescription>Your recent HBAR transactions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {transactions.map((tx) => (
                          <div
                            key={tx.id}
                            className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                          >
                            <div className="flex items-center space-x-4">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  tx.type === "Received"
                                    ? "bg-green-100"
                                    : tx.type === "Sent"
                                      ? "bg-red-100"
                                      : "bg-yellow-100"
                                }`}
                              >
                                {tx.type === "Received" ? (
                                  <ArrowDownLeft className="w-5 h-5 text-green-600" />
                                ) : tx.type === "Sent" ? (
                                  <ArrowUpRight className="w-5 h-5 text-red-600" />
                                ) : (
                                  <Clock className="w-5 h-5 text-yellow-600" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-medium text-slate-800">{tx.description}</h4>
                                <div className="flex items-center space-x-2 text-sm text-slate-600">
                                  <span>{tx.type === "Received" ? `From: ${tx.from}` : `To: ${tx.to}`}</span>
                                  <span>•</span>
                                  <span>{tx.date}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div
                                className={`font-semibold ${
                                  tx.type === "Received"
                                    ? "text-green-600"
                                    : tx.type === "Sent"
                                      ? "text-red-600"
                                      : "text-yellow-600"
                                }`}
                              >
                                {tx.amount}
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge
                                  className={
                                    tx.status === "Confirmed"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-yellow-100 text-yellow-700"
                                  }
                                >
                                  {tx.status}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    window.open(`https://hashscan.io/testnet/transaction/${tx.txHash}`, "_blank")
                                  }
                                >
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

                <TabsContent value="send" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Send HBAR</CardTitle>
                      <CardDescription>Transfer HBAR to another wallet</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="recipient">Recipient Account ID</Label>
                        <Input
                          id="recipient"
                          placeholder="0.0.123456"
                          value={recipientAddress}
                          onChange={(e) => setRecipientAddress(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="amount">Amount (HBAR)</Label>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="0.00"
                          value={sendAmount}
                          onChange={(e) => setSendAmount(e.target.value)}
                        />
                        <p className="text-sm text-slate-500">Available balance: {account.balance} HBAR</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="memo">Memo (Optional)</Label>
                        <Input
                          id="memo"
                          placeholder="Payment description"
                          value={memo}
                          onChange={(e) => setMemo(e.target.value)}
                        />
                      </div>

                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Transaction fees are approximately 0.0001 HBAR. Please verify the recipient account ID before
                          sending.
                        </AlertDescription>
                      </Alert>

                      <Button
                        className="w-full bg-blue-500 hover:bg-blue-600"
                        onClick={handleSendHBAR}
                        disabled={isSending || !sendAmount || !recipientAddress}
                      >
                        {isSending ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Send HBAR
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="settings" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Wallet Settings</CardTitle>
                      <CardDescription>Manage your wallet preferences and security</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                          <div>
                            <h4 className="font-medium text-slate-800">Network</h4>
                            <p className="text-sm text-slate-600">Currently connected to {account.network}</p>
                          </div>
                          <Badge
                            className={
                              account.network === "testnet"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-green-100 text-green-700"
                            }
                          >
                            {account.network}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                          <div>
                            <h4 className="font-medium text-slate-800">Transaction notifications</h4>
                            <p className="text-sm text-slate-600">Get notified of incoming and outgoing transactions</p>
                          </div>
                          <Button variant="outline" size="sm">
                            Enable
                          </Button>
                        </div>

                        <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                          <div>
                            <h4 className="font-medium text-slate-800">Export transaction history</h4>
                            <p className="text-sm text-slate-600">Download your transaction history for tax purposes</p>
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-1" />
                            Export
                          </Button>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-200">
                        <HederaWalletConnect onConnectionChange={handleConnectionChange} />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
