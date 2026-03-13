"use client"

import { useState, useEffect } from "react"
import { useAccount, useBalance } from "wagmi"
import { useWriteContract, useReadContract, useWaitForTransactionReceipt, useWatchContractEvent } from "wagmi"
import { parseEther, formatEther } from "viem"
import StakingDeployment from "@/base-smart-contracts/deployments/baseSepolia/FreelanceDAOStaking.json"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
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
  DollarSign,
  AlertCircle,
  Info,
  CheckCircle,
  Calculator,
  History,
  Sparkles,
  Loader2,
} from "lucide-react"

const stakingAddress = StakingDeployment.address as `0x${string}`
const stakingAbi     = StakingDeployment.abi
const BASE_SEPOLIA_CHAIN_ID = 84532

const stakingOptions = [
  {
    id: "ETH",
    name: "Single Asset Staking",
    asset: "ETH",
    apy: 12.5,
    description: "Stake ETH for steady, predictable returns",
    minStake: 0.001,
    lockPeriod: "7 days",
    pointsRate: "10 points per ETH per day",
    color: "from-green-500 to-green-600",
    icon: DollarSign,
    riskLevel: "Low",
    features: ["Low lock period", "Instant withdrawals", "Stable returns"],
    howToAcquire: "Purchase ETH from any major exchange like Coinbase or Binance, then bridge to Base Sepolia for testing.",
  },
]

export default function StakingPage() {
  const { user, isAuthenticated } = useAuth()
  const [stakeAmount, setStakeAmount] = useState("")
  const [unstakeAmount, setUnstakeAmount] = useState("")
  const [isStakeModalOpen, setIsStakeModalOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const { address, isConnected } = useAccount()
  const { writeContract, data: txData, error: writeError, isPending: isWritePending, reset } = useWriteContract()
  const txHash = typeof txData === 'object' && txData !== null && 'hash' in txData ? (txData as any).hash : undefined
  const { isLoading: isTxLoading, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  // ETH balance on Base Sepolia
  const { data: userBalanceData } = useBalance({
    address,
    chainId: BASE_SEPOLIA_CHAIN_ID,
  })
  const availableBalance = userBalanceData ? Number(formatEther(userBalanceData.value)) : 0

  // Read user's stake
  const { data: userStakeData, refetch: refetchStake } = useReadContract({
    address: stakingAddress,
    abi: stakingAbi,
    functionName: "getStakedAmount",
    args: address ? [address] : undefined,
    chainId: BASE_SEPOLIA_CHAIN_ID,
    query: { enabled: !!address },
  })

  // Read total staked
  const { data: totalStaked, refetch: refetchTotalStaked } = useReadContract({
    address: stakingAddress,
    abi: stakingAbi,
    functionName: "totalStaked",
    chainId: BASE_SEPOLIA_CHAIN_ID,
  })

  // Read user staking details
  const { data: userStakes, refetch: refetchUserStaked } = useReadContract({
    address: stakingAddress,
    abi: stakingAbi,
    functionName: "getUserStaking",
    args: address ? [address] : undefined,
    chainId: BASE_SEPOLIA_CHAIN_ID,
    query: { enabled: !!address },
  })

  // Read reward rate
  const { data: rewardRate } = useReadContract({
    address: stakingAddress,
    abi: stakingAbi,
    functionName: "rewardRate",
    chainId: BASE_SEPOLIA_CHAIN_ID,
  })

  // Read lock time (seconds)
  const { data: lockTime } = useReadContract({
    address: stakingAddress,
    abi: stakingAbi,
    functionName: "lockTime",
    chainId: BASE_SEPOLIA_CHAIN_ID,
    query: { enabled: !!stakingAddress },
  })

  useEffect(() => {
    if (isTxSuccess) {
      setTimeout(() => { refetchTotalStaked() }, 1000)
    }
  }, [isTxSuccess, refetchTotalStaked])

  useEffect(() => {
    if (writeError) {
      toast.error(writeError.message?.slice(0, 120) || "Transaction failed")
    }
  }, [writeError])

  // ETH — all values in Wei (1e18)
  const stakedAmount    = userStakeData ? Number(formatEther(userStakeData as bigint)) : 0
  const totalStakedAmount = totalStaked ? Number(formatEther(totalStaked as bigint)) : 0
  const dailyRewardRate = rewardRate ? Number(rewardRate) : 0

  const userTotalStake       = Array.isArray(userStakes) && userStakes[0] ? Number(formatEther(userStakes[0])) : 0
  const lastStakedTimestamp  = Array.isArray(userStakes) && userStakes[1] ? Number(userStakes[1]) : 0
  const lockTimeMs           = lockTime ? Number(lockTime) * 1000 : 0

  useWatchContractEvent({
    address: stakingAddress,
    abi: stakingAbi,
    eventName: "Staked",
    chainId: BASE_SEPOLIA_CHAIN_ID,
    onLogs: () => {
      toast.success("Staking successful!")
      setIsStakeModalOpen(false)
      setStakeAmount("")
      reset()
      refetchStake()
      refetchTotalStaked()
      refetchUserStaked()
    },
  })

  const handleStake = async () => {
    if (!isConnected) { toast.error("Please connect your wallet first"); return }
    const amount = Number(stakeAmount)
    if (!amount || amount <= 0) { toast.error("Please enter a valid amount"); return }
    setIsProcessing(true)
    try {
      writeContract({
        address: stakingAddress,
        abi: stakingAbi,
        functionName: "stake",
        value: parseEther(stakeAmount),
      })
    } catch (err: any) {
      toast.error(err?.message || "Staking failed. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUnstake = async () => {
    if (!isConnected) { toast.error("Please connect your wallet first"); return }
    const amount = Number(unstakeAmount)
    const now = Date.now()
    const unlockTime = lastStakedTimestamp * 1000 + lockTimeMs

    if (!amount || amount <= 0) { toast.error("Please enter a valid unstake amount"); return }
    if (amount > userTotalStake) { toast.error("Unstake amount exceeds your total staked amount"); return }
    if (now < unlockTime) {
      const msLeft = unlockTime - now
      const totalSeconds = Math.floor(msLeft / 1000)
      const days = Math.floor(totalSeconds / 86400)
      const hours = Math.floor((totalSeconds % 86400) / 3600)
      const minutes = Math.floor((totalSeconds % 3600) / 60)
      let timeStr = days > 0 ? `${days}d ` : ''
      timeStr += hours > 0 ? `${hours}h ` : ''
      timeStr += minutes > 0 ? `${minutes}m` : ''
      if (!timeStr) timeStr = 'less than a minute'
      toast.error(`Tokens still locked. Wait ${timeStr} before unstaking.`)
      return
    }
    setIsProcessing(true)
    try {
      writeContract({
        address: stakingAddress,
        abi: stakingAbi,
        functionName: "unstake",
        args: [parseEther(unstakeAmount)],
      })
      toast.success("Unstake transaction submitted!")
      setUnstakeAmount("")
      refetchStake(); refetchUserStaked(); refetchTotalStaked()
    } catch (err: any) {
      toast.error(err?.message || "Unstake failed. Please try again.")
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
              Stake ETH, earn rewards, and contribute to the DAO's security and stability
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <p className="text-3xl font-bold">{totalStakedAmount.toFixed(4)} ETH</p>
                <p className="text-green-200">Total Staked</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <p className="text-3xl font-bold">{stakedAmount.toFixed(4)} ETH</p>
                <p className="text-green-200">Your Stake</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <p className="text-3xl font-bold">{dailyRewardRate}%</p>
                <p className="text-green-200">APY</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Connection Warning */}
      {isAuthenticated && !isConnected && (
        <div className="container mx-auto px-4 pt-6">
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
        </div>
      )}

      {/* Staking Options */}
      <div className="flex flex-col items-center max-w-xl gap-8 mb-12 mx-auto px-4 py-8">
        {stakingOptions.map((option) => (
          <Card key={option.id} className="w-full shadow-lg hover:shadow-xl transition-all duration-300 border-0 overflow-hidden">
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
                  <Badge className="bg-white text-gray-800 text-lg px-3 py-1 mb-2">{dailyRewardRate || option.apy}% APY</Badge>
                  <div className="text-xs text-white/80">Risk: {option.riskLevel}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <span className="font-medium text-slate-600">Asset:</span>
                    <p className="text-slate-800 font-bold text-lg">{option.asset}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <span className="font-medium text-slate-600">Min Stake:</span>
                    <p className="text-slate-800 font-bold text-lg">{option.minStake} {option.asset}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <span className="font-medium text-slate-600">Lock Period:</span>
                    <p className="text-slate-800 font-bold">{option.lockPeriod}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <span className="font-medium text-slate-600">Your Stake:</span>
                    <p className="text-slate-800 font-bold">{stakedAmount.toFixed(4)} ETH</p>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-600 flex items-center">
                      <Coins className="w-4 h-4 mr-1" />
                      Total Staked
                    </span>
                    <span className="text-sm font-bold text-blue-800">{totalStakedAmount.toFixed(4)} ETH</span>
                  </div>
                </div>

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

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-900 mb-2 flex items-center">
                    <Info className="w-4 h-4 mr-1" />
                    How to Acquire {option.asset}
                  </h4>
                  <p className="text-sm text-yellow-800">{option.howToAcquire}</p>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Stake Dialog */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className={`bg-gradient-to-r ${option.color} hover:opacity-90 shadow-lg`} disabled={!isConnected}>
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
                          Enter the amount you want to stake. You'll start earning rewards immediately.
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
                              step="0.001"
                              className="mt-1 pr-16"
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">{option.asset}</span>
                          </div>
                          <div className="flex justify-between text-xs text-slate-600 mt-1">
                            <span>Min: {option.minStake} {option.asset}</span>
                            <span>Available: {availableBalance.toFixed(4)} {option.asset}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                          {[25, 50, 75, 100].map((pct) => (
                            <Button key={pct} variant="outline" size="sm" className="text-xs"
                              onClick={() => setStakeAmount(((availableBalance * pct) / 100).toFixed(4))}>
                              {pct}%
                            </Button>
                          ))}
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="font-semibold text-blue-900 mb-2">Transaction Details</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between"><span>APY:</span><span className="font-medium">{dailyRewardRate || option.apy}%</span></div>
                            <div className="flex justify-between"><span>Lock Period:</span><span className="font-medium">{option.lockPeriod}</span></div>
                            <div className="flex justify-between"><span>Network:</span><span className="font-medium">Base Sepolia</span></div>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Button variant="outline" className="flex-1" onClick={() => setStakeAmount("")}>Cancel</Button>
                          <Button
                            disabled={!stakeAmount || Number(stakeAmount) < option.minStake || isProcessing || Number(stakeAmount) > availableBalance}
                            className={`flex-1 bg-gradient-to-r ${option.color}`}
                            onClick={handleStake}
                          >
                            {isProcessing ? <><Loader2 className="animate-spin h-4 w-4 mr-2" />Processing...</> : "Stake Now"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Unstake Dialog */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" disabled={!isConnected} className="shadow-lg bg-transparent">
                        <ArrowDownRight className="w-4 h-4 mr-2" />
                        Unstake
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Unstake {option.asset}</DialogTitle>
                        <DialogDescription>Enter the amount to unstake. Lock period applies.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="unstakeAmount">Amount to Unstake</Label>
                          <Input
                            id="unstakeAmount"
                            type="number"
                            placeholder="0.00"
                            value={unstakeAmount}
                            onChange={e => setUnstakeAmount(e.target.value)}
                            step="0.001"
                            className="mt-1"
                          />
                          <p className="text-xs text-slate-600 mt-1">Available to unstake: {userTotalStake.toFixed(4)} {option.asset}</p>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-center">
                            <Clock className="w-5 h-5 text-yellow-600 mr-2" />
                            <div>
                              <h4 className="font-semibold text-yellow-900">Lock Period Notice</h4>
                              <p className="text-sm text-yellow-800">Funds are available {option.lockPeriod} after staking</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Button variant="outline" className="flex-1" onClick={() => setUnstakeAmount("")}>Cancel</Button>
                          <Button className="flex-1" onClick={handleUnstake} disabled={isProcessing || !unstakeAmount}>
                            {isProcessing ? <><Loader2 className="animate-spin h-4 w-4 mr-2" />Processing...</> : "Unstake"}
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

      {/* Staking History */}
      <div className="container mx-auto px-4 pb-12">
        <Card className="max-w-xl mx-auto shadow-lg mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600" />
              Staking History
            </CardTitle>
            <CardDescription>Your staking activity and rewards</CardDescription>
          </CardHeader>
          <CardContent>
            {Array.isArray(userStakes) ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Staked Amount:</span>
                  <span className="font-bold text-green-700">{userStakes[0] ? Number(formatEther(userStakes[0])).toFixed(4) : 0} ETH</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Last Staked:</span>
                  <span className="font-bold text-blue-700">{userStakes[1] ? new Date(Number(userStakes[1]) * 1000).toLocaleString() : '-'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Rewards Earned:</span>
                  <span className="font-bold text-emerald-700">{userStakes[2] ? Number(formatEther(userStakes[2])).toFixed(6) : 0} ETH</span>
                </div>
              </div>
            ) : (
              <div className="text-gray-500">No staking history found.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
