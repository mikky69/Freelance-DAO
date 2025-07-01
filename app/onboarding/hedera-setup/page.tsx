"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowRight,
  ArrowLeft,
  Wallet,
  Shield,
  CheckCircle,
  ExternalLink,
  Zap,
  DollarSign,
  AlertCircle,
  Download,
  Smartphone,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function HederaSetupPage() {
  const router = useRouter()
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)

  const walletOptions = [
    {
      id: "hashpack",
      name: "HashPack",
      description: "The most popular Hedera wallet with great security",
      icon: "🔐",
      recommended: true,
      features: ["Browser Extension", "Mobile App", "Hardware Wallet Support"],
    },
    {
      id: "blade",
      name: "Blade Wallet",
      description: "User-friendly wallet with built-in DeFi features",
      icon: "⚡",
      recommended: false,
      features: ["Browser Extension", "DeFi Integration", "NFT Support"],
    },
    {
      id: "kabila",
      name: "Kabila Wallet",
      description: "Secure wallet with advanced features",
      icon: "🛡️",
      recommended: false,
      features: ["Multi-signature", "Advanced Security", "Enterprise Features"],
    },
  ]

  const connectWallet = async (walletId: string) => {
    setIsConnecting(true)
    setSelectedWallet(walletId)

    // Simulate wallet connection
    setTimeout(() => {
      setIsConnected(true)
      setWalletAddress("0.0.123456")
      setIsConnecting(false)
    }, 2000)
  }

  const handleContinue = () => {
    // Save wallet connection status
    localStorage.setItem("walletConnected", isConnected.toString())
    if (isConnected) {
      localStorage.setItem("walletAddress", walletAddress)
    }
    router.push("/onboarding/complete")
  }

  const skipForNow = () => {
    localStorage.setItem("walletConnected", "false")
    router.push("/onboarding/complete")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Getting Started</span>
              <span className="text-sm text-slate-500">Step 5 of 5</span>
            </div>
            <Progress value={100} className="h-2" />
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Connect Your Hedera Wallet</h1>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Connect your Hedera wallet to receive payments securely and instantly. Don't have a wallet? We'll help you
              set one up.
            </p>
          </div>

          {!isConnected ? (
            <>
              {/* Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="text-center">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-2">Secure Payments</h3>
                    <p className="text-sm text-slate-600">
                      Smart contracts ensure you always get paid for completed work
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Zap className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-2">Instant Transfers</h3>
                    <p className="text-sm text-slate-600">
                      Receive payments in seconds, not days, with Hedera's fast network
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <DollarSign className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-2">Low Fees</h3>
                    <p className="text-sm text-slate-600">
                      Pay minimal transaction fees, typically under $0.01 per transaction
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Wallet Options */}
              <div className="space-y-4 mb-8">
                <h2 className="text-xl font-semibold text-slate-800 text-center mb-6">Choose Your Wallet</h2>

                {walletOptions.map((wallet) => (
                  <Card
                    key={wallet.id}
                    className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      selectedWallet === wallet.id && isConnecting
                        ? "ring-2 ring-blue-500 shadow-lg"
                        : "hover:shadow-md"
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-3xl">{wallet.icon}</div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold text-slate-800">{wallet.name}</h3>
                              {wallet.recommended && (
                                <Badge className="bg-green-100 text-green-700 text-xs">Recommended</Badge>
                              )}
                            </div>
                            <p className="text-slate-600 text-sm mb-2">{wallet.description}</p>
                            <div className="flex flex-wrap gap-2">
                              {wallet.features.map((feature, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <Button
                            onClick={() => connectWallet(wallet.id)}
                            disabled={isConnecting}
                            className="bg-blue-500 hover:bg-blue-600"
                          >
                            {isConnecting && selectedWallet === wallet.id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Connecting...
                              </>
                            ) : (
                              "Connect"
                            )}
                          </Button>
                          <Button variant="outline" size="sm">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Learn More
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Don't have a wallet */}
              <Card className="mb-8">
                <CardContent className="p-6">
                  <div className="text-center">
                    <Smartphone className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                    <h3 className="font-semibold text-slate-800 mb-2">Don't have a Hedera wallet?</h3>
                    <p className="text-slate-600 mb-4">
                      No problem! We recommend HashPack for beginners. It's free, secure, and easy to use.
                    </p>
                    <div className="flex justify-center space-x-4">
                      <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Download HashPack
                      </Button>
                      <Button variant="outline">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Setup Guide
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Skip Option */}
              <Alert className="mb-8">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Want to explore first?</strong> You can skip wallet setup for now and connect later when
                  you're ready to receive payments. You'll still be able to browse jobs and submit proposals.
                </AlertDescription>
              </Alert>
            </>
          ) : (
            /* Connected State */
            <div className="text-center mb-8">
              <Card className="max-w-md mx-auto">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">Wallet Connected!</h3>
                  <p className="text-slate-600 mb-4">
                    Your {walletOptions.find((w) => w.id === selectedWallet)?.name} wallet is now connected
                  </p>
                  <div className="bg-slate-50 p-4 rounded-lg mb-4">
                    <div className="text-sm text-slate-600 mb-1">Wallet Address:</div>
                    <div className="font-mono text-sm text-slate-800">{walletAddress}</div>
                  </div>
                  <Badge className="bg-green-100 text-green-700">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Ready to receive payments
                  </Badge>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between">
            <Link href="/onboarding/verification">
              <Button variant="outline" size="lg">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex space-x-4">
              {!isConnected && (
                <Button variant="outline" size="lg" onClick={skipForNow}>
                  Skip for Now
                </Button>
              )}
              <Button size="lg" onClick={handleContinue} className="bg-blue-500 hover:bg-blue-600">
                {isConnected ? "Complete Setup" : "Continue Without Wallet"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
