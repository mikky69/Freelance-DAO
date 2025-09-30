"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { useWriteContract, useReadContract, useWaitForTransactionReceipt, useWatchContractEvent } from "wagmi"
import stakingContractDeployment from "../../../hedera-deployments/hedera-staking-testnet.json"
import stakingContractABI from "../../../hedera-frontend-abi/FreeLanceDAOStaking.json"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Coins,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Award,
  DollarSign,
  Zap,
  AlertCircle,
  TrendingUp,
  Info,
  CheckCircle,
  ExternalLink,
  Calculator,
  History,
  Target,
  Sparkles,
  Copy,
  Loader2,
} from "lucide-react"


const stakingOptions = [
  {
    id: "HBAR",
    name: "Single Asset Staking",
    asset: "HBAR",
    apy: 12.5,
    description: "Stake HBAR for steady, predictable returns",
    minStake: 10,
    lockPeriod: "None",
    pointsRate: "10 points per HBAR per day",
    totalStaked: 2450000,
    maxCapacity: 5000000,
    color: "from-green-500 to-green-600",
    icon: DollarSign,
    riskLevel: "Low",
    features: ["No lock period", "Instant withdrawals", "Stable returns"],
    howToAcquire:
      "Purchase HBAR from any major exchange like Coinbase, Binance, or directly through your HashPack wallet.",
  }
]
export default function StakingPage() {
  const { user, isAuthenticated, isWalletConnected } = useAuth()
  const [stakeAmount, setStakeAmount] = useState("")
  const [isStakeModalOpen, setIsStakeModalOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  
  
  // Contract details
  const stakingAddress = stakingContractDeployment.FreeLanceDAOStaking.evmAddress
  const stakingAbi = stakingContractABI.abi

  // wagmi hooks
  const { address, isConnected } = useAccount()
  const { writeContract, data: txData, error: writeError, isPending: isWritePending, reset } = useWriteContract()
  const txHash = typeof txData === 'object' && txData !== null && 'hash' in txData ? (txData as any).hash : undefined
  const { isLoading: isTxLoading, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  // Read user's stake
  const { data: userStakeData, refetch: refetchStake } = useReadContract({
    address: stakingAddress as `0x${string}`,
    abi: stakingAbi,
    functionName: "stakes",
    args: [address],
    chainId: 296,
    // enabled: !!address,
  })

  // Read total staked
  const { data: totalStaked, refetch: refetchTotalStaked } = useReadContract({
    address: stakingAddress as `0x${string}`,
    abi: stakingAbi,
    functionName: "totalStaked",
    chainId: 296,
  })

  // Read daily reward rate
  const { data: rewardRate } = useReadContract({
    address: stakingAddress as `0x${string}`,
    abi: stakingAbi,
    functionName: "rewardRate",
    chainId: 296,
  })
  // Refetch totalStaked after successful staking transaction
  useEffect(() => {
    if (isTxSuccess) {
      setTimeout(() => {
        refetchTotalStaked();
      }, 1000);
    }
  }, [isTxSuccess, refetchTotalStaked]);

  //IMPORTANT
  // User's staked amount
  console.log("Your stakes: ", userStakeData)

  const stakedAmount = Array.isArray(userStakeData) && userStakeData[0] ? Number(userStakeData[0]) / 1e8 : 0 // convert tinybar to HBAR. Very important and dont delete

  // dateStaked: convert timestamp (seconds) to readable date/time
  const dateStaked = Array.isArray(userStakeData) && userStakeData[1]
    ? new Date(Number(userStakeData[1]) * 1000).toLocaleString()
    : "-"
  console.log("Date staked: ", dateStaked)

  const totalStakedAmount = totalStaked ? Number(totalStaked) / 1e8 : 0 // convert tinybar to HBAR. Very important and dont delete
  const dailyRewardRate = rewardRate ? Number(rewardRate) : 0

  useWatchContractEvent({
    address: stakingAddress as `0x${string}`,
    abi: stakingAbi,
    eventName: "Staked",
    chainId: 296,
    onLogs: () => {
      toast.success("Staking successful!")
      setIsStakeModalOpen(false)
      setStakeAmount("")
      reset()
      refetchStake()
      refetchTotalStaked()
    },
  })

  const handleStake = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first")
      return
    }
    const amount = Number(stakeAmount)
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount")
      return
    }
    setIsProcessing(true)
    try {
      writeContract({
        address: stakingAddress as `0x${string}`,
        abi: stakingAbi,
        functionName: "stake",
        value: BigInt(amount * 1e18),
      })
    } catch (err: any) {
      toast.error(err?.message || "Staking failed. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">

      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <Coins className="w-16 h-16 mr-4" />
              <h1 className="text-5xl font-bold">DAO Staking</h1>
            </div>
            <p className="text-xl mb-8 text-green-100">
              Stake your assets, earn rewards, and contribute to the DAO's security and stability
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <p className="text-3xl font-bold">{totalStakedAmount} HBAR</p>
                <p className="text-green-200">Total Staked</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <p className="text-3xl font-bold">15,757</p>
                <p className="text-green-200">Staking Points</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <p className="text-3xl font-bold">+125</p>
                <p className="text-green-200">Daily Points</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <p className="text-3xl font-bold">212.5 HBAR</p>
                <p className="text-green-200">Monthly Rewards</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Wallet Connection Warning */}
      {isAuthenticated && !isWalletConnected && (
        <Card className="mb-8 bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="w-6 h-6 text-orange-500 mr-3" />
              <div className="flex-1">
                <h3 className="font-semibold text-orange-900">Connect Your Wallet</h3>
                <p className="text-orange-700">Connect your wallet to start staking and earning rewards.</p>
              </div>
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* staking options */}
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Single Asset Staking</CardTitle>
            <div className="flex gap-4 mt-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                Total Staked: {totalStakedAmount} HBAR
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                Your Staked: {stakedAmount} HBAR
              </Badge>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                APY: {dailyRewardRate}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-1">
                <div className="mb-2 text-lg font-semibold">Stake HBAR to earn rewards and participate in DAO governance.</div>
                <div className="mb-4 text-sm text-gray-600">Staked HBAR is locked for a period and earns daily rewards. You can unstake after the lock period.</div>
                <div className="mb-2 text-sm text-gray-600">Date Staked: {dateStaked}</div>
                <Button className="bg-green-600 text-white px-4 py-2 rounded" onClick={() => setIsStakeModalOpen(true)} disabled={!isConnected}>
                  Stake HBAR
                </Button>
                <Button className="bg-gray-300 text-black px-4 py-2 rounded ml-2" onClick={() => console.log('Unstake clicked')} disabled={!isConnected}>
                  Unstake
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stake Modal */}
        {isStakeModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Stake HBAR</h2>
              <Input
                className="w-full mb-4"
                type="number"
                min="0"
                step="any"
                placeholder="Amount to stake (HBAR)"
                value={stakeAmount}
                onChange={e => setStakeAmount(e.target.value)}
                disabled={isProcessing}
              />
              <div className="flex gap-2 mt-4">
                <Button className="bg-green-600 text-white px-4 py-2 rounded" onClick={handleStake} disabled={isProcessing}>
                  {isProcessing ? "Staking..." : "Stake"}
                </Button>
                <Button className="bg-gray-300 px-4 py-2 rounded" onClick={() => setIsStakeModalOpen(false)} disabled={isProcessing}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/*Single Staking Options original*/}
      <div className="flex flex-col items-center max-w-xl gap-8 mb-12 mx-auto">
        {stakingOptions.map((option) => (
          <Card
            key={option.id}
            className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 overflow-hidden"
          >
            <CardHeader className={`bg-gradient-to-r ${option.color} text-white`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <option.icon className="w-8 h-8 mr-3" />
                  <div>
                    <CardTitle className="text-xl">{option.name}</CardTitle>
                    <CardDescription className="text-white/90">{option.description}</CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className="bg-white text-gray-800 text-lg px-3 py-1 mb-2">{dailyRewardRate}% APY</Badge>
                  <div className="text-xs text-white/80">Risk: {option.riskLevel}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <span className="font-medium text-slate-600">Asset:</span>
                    <p className="text-slate-800 font-bold text-lg">{option.asset}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <span className="font-medium text-slate-600">Min Stake:</span>
                    <p className="text-slate-800 font-bold text-lg">
                      {option.minStake} {option.asset}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <span className="font-medium text-slate-600">Lock Period:</span>
                    <p className="text-slate-800 font-bold">{option.lockPeriod}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <span className="font-medium text-slate-600">Points Rate:</span>
                    <p className="text-slate-800 font-bold text-xs">{option.pointsRate}</p>
                  </div>
                </div>

                {/* Current Staked Amount */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-600 flex items-center">
                      <Coins className="w-4 h-4 mr-1" />
                      Total Staked Amount
                    </span>
                    <span className="text-sm font-bold text-blue-800">
                      {totalStakedAmount} HBAR
                    </span>
                  </div>
                </div>

                {/* Features */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                    <Sparkles className="w-4 h-4 mr-1" />
                    Key Features
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    {option.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle className="w-3 h-3 mr-2 text-green-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* How to Acquire */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-900 mb-2 flex items-center">
                    <Info className="w-4 h-4 mr-1" />
                    How to Acquire {option.asset}
                  </h4>
                  <p className="text-sm text-yellow-800">{option.howToAcquire}</p>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Dialog >
                    <DialogTrigger asChild>
                      <Button
                        className={`bg-gradient-to-r ${option.color} hover:opacity-90 shadow-lg`}
                        disabled={!isWalletConnected}                      >
                        <ArrowUpRight className="w-4 h-4 mr-2" />
                        Stake {option.asset}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center">
                          <option.icon className="w-5 h-5 mr-2" />
                          Stake {option.asset}
                        </DialogTitle>
                        <DialogDescription>
                          Enter the amount you want to stake. You'll start earning points immediately.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="stakeAmount">Amount to Stake</Label>
                          <div className="relative">
                            <Input
                              id="stakeAmount"
                              type="number"
                              placeholder="0.00"
                              value={stakeAmount}
                              onChange={(e) => setStakeAmount(e.target.value)}
                              min={option.minStake}
                              step="0.01"
                              className="mt-1 pr-16"
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                              {option.asset}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs text-slate-600 mt-1">
                            <span>
                              Minimum: {option.minStake} {option.asset}
                            </span>
                            <span>
                              Available:
                              {option.asset || 0}
                            </span>
                          </div>
                        </div>

                        {/* Quick Amount Buttons */}
                        <div className="grid grid-cols-4 gap-2">
                          {[25, 50, 75, 100].map((percentage) => (
                            <Button
                              key={percentage}
                              variant="outline"
                              size="sm"
                              className="text-xs"
                            >
                              {percentage}%
                            </Button>
                          ))}
                        </div>

                        {/* Projection Calculator */}
                        {stakeAmount && Number(stakeAmount) >= option.minStake && (
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                            <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                              <Calculator className="w-4 h-4 mr-1" />
                              Staking Projections
                            </h4>
                            <Tabs defaultValue="daily" className="w-full">
                              <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="daily">Daily</TabsTrigger>
                                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                                <TabsTrigger value="yearly">Yearly</TabsTrigger>
                              </TabsList>
                              <TabsContent value="daily" className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Points Earned:</span>
                                  <span className="font-bold">
                                    000
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>$FLDAO Equivalent:</span>
                                  <span className="font-bold">
                                    000
                                  </span>
                                </div>
                              </TabsContent>
                              <TabsContent value="monthly" className="space-y-2 text-sm">
                                {(() => {
                                  const monthly = (Number(stakeAmount), option.asset, 30)
                                  return (
                                    <>
                                      <div className="flex justify-between">
                                        <span>Points Earned:</span>
                                        <span className="font-bold">000</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>$FLDAO Tokens:</span>
                                        <span className="font-bold">000</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>USD Value:</span>
                                        <span className="font-bold text-green-600">$000</span>
                                      </div>
                                    </>
                                  )
                                })()}
                              </TabsContent>
                              <TabsContent value="yearly" className="space-y-2 text-sm">
                                {(() => {
                                  const yearly = (Number(stakeAmount), option.asset, 365)
                                  return (
                                    <>
                                      <div className="flex justify-between">
                                        <span>Points Earned:</span>
                                        <span className="font-bold">000</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>$FLDAO Tokens:</span>
                                        <span className="font-bold">000</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>USD Value:</span>
                                        <span className="font-bold text-green-600">$000</span>
                                      </div>
                                    </>
                                  )
                                })()}
                              </TabsContent>
                            </Tabs>
                          </div>
                        )}

                        {/* Transaction Details */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="font-semibold text-blue-900 mb-2">Transaction Details</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>APY:</span>
                              <span className="font-medium">{option.apy}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Lock Period:</span>
                              <span className="font-medium">{option.lockPeriod}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Network Fee:</span>
                              <span className="font-medium">~0.001 HBAR</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Button
                            variant="outline"

                            className="flex-1"
                          >
                            Cancel
                          </Button>
                          <Button
                            disabled={!stakeAmount || Number(stakeAmount) < option.minStake || isProcessing}
                            className={`flex-1 bg-gradient-to-r ${option.color}`}
                          >
                            {isProcessing ? (
                              <div className="flex items-center">
                                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                                Processing...
                              </div>
                            ) : (
                              "Stake Now"
                            )}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" disabled={!isWalletConnected} className="shadow-lg bg-transparent">
                        <ArrowDownRight className="w-4 h-4 mr-2" />
                        Unstake
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Unstake {option.asset}</DialogTitle>
                        <DialogDescription>
                          Enter the amount you want to unstake. Note the lock period before funds are available.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="unstakeAmount">Amount to Unstake</Label>
                          <Input
                            id="unstakeAmount"
                            type="number"
                            placeholder="0.00"
                            // value={unstakeAmount}
                            step="0.01"
                            className="mt-1"
                          />
                          <p className="text-xs text-slate-600 mt-1">
                            Available:{" "}

                            {option.asset}
                          </p>
                        </div>

                        {option.lockPeriod !== "None" && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-center">
                              <Clock className="w-5 h-5 text-yellow-600 mr-2" />
                              <div>
                                <h4 className="font-semibold text-yellow-900">Lock Period Notice</h4>
                                <p className="text-sm text-yellow-800">
                                  Funds will be available {option.lockPeriod} after unstaking
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-3">
                          <Button variant="outline" className="flex-1">
                            Cancel
                          </Button>
                          <Button

                            className="flex-1"
                          >
                            {isProcessing ? (
                              <div className="flex items-center">
                                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                                Processing...
                              </div>
                            ) : (
                              "Unstake"
                            )}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

    </div>
  )
}
