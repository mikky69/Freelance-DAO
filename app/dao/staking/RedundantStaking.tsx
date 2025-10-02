"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

interface StakingData {
  totalStaked: number
  stakingPoints: number
  estimatedRewards: number
  singleAssetStaked: number
  lpTokensStaked: number
  nextRewardDate: string
  dailyPointsEarning: number
  totalPointsEarned: number
  fldaoExchanged: number
}

interface WalletBalance {
  usdc: number
  sol: number
  lpTokens: number
}

interface StakingActivity {
  date: string
  action: "Stake" | "Unstake" | "Exchange"
  amount: number
  asset: string
  points: number
  txHash: string
  status: "Completed" | "Pending" | "Failed"
}

export default function StakingPage() {
  const { user, isAuthenticated, isWalletConnected } = useAuth()
  const [selectedTab, setSelectedTab] = useState("stake")
  const [stakeAmount, setStakeAmount] = useState("")
  const [unstakeAmount, setUnstakeAmount] = useState("")
  const [selectedStakingOption, setSelectedStakingOption] = useState<string | null>(null)
  const [isStakeModalOpen, setIsStakeModalOpen] = useState(false)
  const [isUnstakeModalOpen, setIsUnstakeModalOpen] = useState(false)
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  // State for user data
  const [walletBalance, setWalletBalance] = useState<WalletBalance>({
    usdc: 5000,
    sol: 25.5,
    lpTokens: 150,
  })

  const [userStaking, setUserStaking] = useState<StakingData>({
    totalStaked: 2500,
    stakingPoints: 15750,
    estimatedRewards: 312.5,
    singleAssetStaked: 1500,
    lpTokensStaked: 1000,
    nextRewardDate: "2024-02-01",
    dailyPointsEarning: 125,
    totalPointsEarned: 45230,
    fldaoExchanged: 452,
  })

  const [stakingHistory, setStakingHistory] = useState<StakingActivity[]>([
    {
      date: "2024-01-15",
      action: "Stake",
      amount: 500,
      asset: "USDC",
      points: 0,
      txHash: "5KJp7z8X9mN2qR4vW1sT3uY6bH8cD9eF2gA5iL7oP3mQ1nR8vX4",
      status: "Completed",
    },
    {
      date: "2024-01-10",
      action: "Stake",
      amount: 1000,
      asset: "SOL/USDC LP",
      points: 0,
      txHash: "8mN2qR4vW1sT3uY6bH8cD9eF2gA5iL7oP3mQ1nR8vX4z5KJp7",
      status: "Completed",
    },
    {
      date: "2024-01-05",
      action: "Exchange",
      amount: 0,
      asset: "$FLDAO",
      points: -5000,
      txHash: "2qR4vW1sT3uY6bH8cD9eF2gA5iL7oP3mQ1nR8vX4z5KJp78mN",
      status: "Completed",
    },
  ])

  const stakingOptions = [
    {
      id: "usdc",
      name: "Single Asset Staking",
      asset: "USDC",
      apy: 12.5,
      description: "Stake USDC stablecoins for steady, predictable returns",
      minStake: 10,
      lockPeriod: "None",
      pointsRate: "10 points per USDC per day",
      totalStaked: 2450000,
      maxCapacity: 5000000,
      color: "from-green-500 to-green-600",
      icon: DollarSign,
      riskLevel: "Low",
      features: ["No lock period", "Instant withdrawals", "Stable returns", "FDIC-insured equivalent"],
      howToAcquire:
        "Purchase USDC from any major exchange like Coinbase, Binance, or directly through your Solana wallet.",
    },
    {
      id: "lp",
      name: "LP Token Staking",
      asset: "SOL/USDC",
      apy: 18.2,
      description: "Stake liquidity provider tokens for higher yields and trading fees",
      minStake: 5,
      lockPeriod: "7 days",
      pointsRate: "15 points per LP token per day",
      totalStaked: 890000,
      maxCapacity: 2000000,
      color: "from-blue-500 to-blue-600",
      icon: Zap,
      riskLevel: "Medium",
      features: ["Higher APY", "Trading fee rewards", "Impermanent loss protection", "Weekly compounding"],
      howToAcquire:
        "Provide liquidity to SOL/USDC pool on Raydium or Orca DEX to receive LP tokens, then stake them here.",
    },
  ]

  const exchangeRate = 100 // 100 points = 1 $FLDAO
  const fldaoFromPoints = Math.floor(userStaking.stakingPoints / exchangeRate)
  const fldaoPrice = 2.5

  // Real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())

      // Simulate real-time point accumulation (every minute for demo)
      setUserStaking((prev) => ({
        ...prev,
        stakingPoints: prev.stakingPoints + Math.floor(Math.random() * 3), // Random 0-2 points per minute
      }))
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  const handleStake = async (asset: string, amount: number) => {
    if (!isWalletConnected) {
      toast.error("Please connect your wallet first")
      return
    }

    if (amount <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    const option = stakingOptions.find((opt) => opt.asset === asset)
    if (!option) return

    if (amount < option.minStake) {
      toast.error(`Minimum stake amount is ${option.minStake} ${asset}`)
      return
    }

    const availableBalance = option.id === "usdc" ? walletBalance.usdc : walletBalance.lpTokens
    if (amount > availableBalance) {
      toast.error(`Insufficient balance. Available: ${availableBalance} ${asset}`)
      return
    }

    setIsProcessing(true)

    try {
      // Simulate wallet connection and transaction
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Generate mock transaction hash
      const txHash = `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`

      // Update wallet balance
      if (option.id === "usdc") {
        setWalletBalance((prev) => ({ ...prev, usdc: prev.usdc - amount }))
        setUserStaking((prev) => ({
          ...prev,
          singleAssetStaked: prev.singleAssetStaked + amount,
          totalStaked: prev.totalStaked + amount,
          dailyPointsEarning: prev.dailyPointsEarning + amount * 10,
        }))
      } else {
        setWalletBalance((prev) => ({ ...prev, lpTokens: prev.lpTokens - amount }))
        setUserStaking((prev) => ({
          ...prev,
          lpTokensStaked: prev.lpTokensStaked + amount,
          totalStaked: prev.totalStaked + amount,
          dailyPointsEarning: prev.dailyPointsEarning + amount * 15,
        }))
      }

      // Add to history
      const newActivity: StakingActivity = {
        date: new Date().toISOString().split("T")[0],
        action: "Stake",
        amount,
        asset,
        points: 0,
        txHash,
        status: "Completed",
      }
      setStakingHistory((prev) => [newActivity, ...prev])

      toast.success(
        <div className="flex flex-col space-y-2">
          <div className="font-semibold">Staking Successful! 🎉</div>
          <div className="text-sm">
            Successfully staked {amount} {asset}
          </div>
          <div className="text-xs text-muted-foreground">TX: {txHash.substring(0, 20)}...</div>
        </div>,
      )

      setIsStakeModalOpen(false)
      setStakeAmount("")
      setSelectedStakingOption(null)
    } catch (error) {
      toast.error("Staking failed. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUnstake = async (asset: string, amount: number) => {
    if (!isWalletConnected) {
      toast.error("Please connect your wallet first")
      return
    }

    if (amount <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    const option = stakingOptions.find((opt) => opt.asset === asset)
    if (!option) return

    const availableStaked = option.id === "usdc" ? userStaking.singleAssetStaked : userStaking.lpTokensStaked
    if (amount > availableStaked) {
      toast.error(`Insufficient staked amount. Available: ${availableStaked} ${asset}`)
      return
    }

    setIsProcessing(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 3000))

      const txHash = `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`

      // Update staking balance
      if (option.id === "usdc") {
        setUserStaking((prev) => ({
          ...prev,
          singleAssetStaked: prev.singleAssetStaked - amount,
          totalStaked: prev.totalStaked - amount,
          dailyPointsEarning: prev.dailyPointsEarning - amount * 10,
        }))

        // Add back to wallet (immediately for USDC, delayed for LP)
        if (option.lockPeriod === "None") {
          setWalletBalance((prev) => ({ ...prev, usdc: prev.usdc + amount }))
        }
      } else {
        setUserStaking((prev) => ({
          ...prev,
          lpTokensStaked: prev.lpTokensStaked - amount,
          totalStaked: prev.totalStaked - amount,
          dailyPointsEarning: prev.dailyPointsEarning - amount * 15,
        }))
      }

      // Add to history
      const newActivity: StakingActivity = {
        date: new Date().toISOString().split("T")[0],
        action: "Unstake",
        amount,
        asset,
        points: 0,
        txHash,
        status: "Completed",
      }
      setStakingHistory((prev) => [newActivity, ...prev])

      toast.success(
        <div className="flex flex-col space-y-2">
          <div className="font-semibold">Unstaking Initiated! ⏳</div>
          <div className="text-sm">
            Successfully unstaked {amount} {asset}
          </div>
          <div className="text-xs text-muted-foreground">
            {option.lockPeriod !== "None" ? "Funds will be available after lock period" : "Funds available immediately"}
          </div>
        </div>,
      )

      setIsUnstakeModalOpen(false)
      setUnstakeAmount("")
    } catch (error) {
      toast.error("Unstaking failed. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleExchangePoints = async () => {
    if (!isWalletConnected) {
      toast.error("Please connect your wallet first")
      return
    }

    if (userStaking.stakingPoints < exchangeRate) {
      toast.error(`You need at least ${exchangeRate} points to exchange`)
      return
    }

    setIsProcessing(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const txHash = `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
      const pointsToExchange = Math.floor(userStaking.stakingPoints / exchangeRate) * exchangeRate
      const fldaoTokens = pointsToExchange / exchangeRate

      // Update points and exchange history
      setUserStaking((prev) => ({
        ...prev,
        stakingPoints: prev.stakingPoints - pointsToExchange,
        fldaoExchanged: prev.fldaoExchanged + fldaoTokens,
      }))

      // Add to history
      const newActivity: StakingActivity = {
        date: new Date().toISOString().split("T")[0],
        action: "Exchange",
        amount: fldaoTokens,
        asset: "$FLDAO",
        points: -pointsToExchange,
        txHash,
        status: "Completed",
      }
      setStakingHistory((prev) => [newActivity, ...prev])

      toast.success(
        <div className="flex flex-col space-y-2">
          <div className="font-semibold">Points Exchanged! ✨</div>
          <div className="text-sm">
            Exchanged {pointsToExchange} points for {fldaoTokens} $FLDAO
          </div>
          <div className="text-xs text-muted-foreground">TX: {txHash.substring(0, 20)}...</div>
        </div>,
      )

      setIsExchangeModalOpen(false)
    } catch (error) {
      toast.error("Exchange failed. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const calculateDailyPoints = (amount: number, asset: string) => {
    const option = stakingOptions.find((opt) => opt.asset === asset)
    if (!option) return 0

    const multiplier = option.id === "usdc" ? 10 : 15
    return amount * multiplier
  }

  const calculateProjectedRewards = (amount: number, asset: string, days: number) => {
    const option = stakingOptions.find((opt) => opt.asset === asset)
    if (!option) return { points: 0, fldao: 0, usd: 0 }

    const dailyPoints = calculateDailyPoints(amount, asset)
    const totalPoints = dailyPoints * days
    const fldaoTokens = totalPoints / exchangeRate
    const usdValue = fldaoTokens * fldaoPrice

    return { points: totalPoints, fldao: fldaoTokens, usd: usdValue }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard!")
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
                <p className="text-3xl font-bold">${userStaking.totalStaked.toLocaleString()}</p>
                <p className="text-green-200">Total Staked</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <p className="text-3xl font-bold">{userStaking.stakingPoints.toLocaleString()}</p>
                <p className="text-green-200">Staking Points</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <p className="text-3xl font-bold">+{userStaking.dailyPointsEarning}</p>
                <p className="text-green-200">Daily Points</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <p className="text-3xl font-bold">${userStaking.estimatedRewards}</p>
                <p className="text-green-200">Monthly Rewards</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
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

        {/* Wallet Balance Display */}
        {isWalletConnected && (
          <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-900">
                <Wallet className="w-5 h-5 mr-2" />
                Wallet Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <p className="text-2xl font-bold text-green-600">{walletBalance.usdc.toLocaleString()} USDC</p>
                  <p className="text-sm text-gray-600">Available for staking</p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <p className="text-2xl font-bold text-purple-600">{walletBalance.sol} SOL</p>
                  <p className="text-sm text-gray-600">For LP token creation</p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <p className="text-2xl font-bold text-blue-600">{walletBalance.lpTokens} LP</p>
                  <p className="text-sm text-gray-600">SOL/USDC LP tokens</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Staking Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
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
                    <Badge className="bg-white text-gray-800 text-lg px-3 py-1 mb-2">{option.apy}% APY</Badge>
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
                        Your Staked Amount
                      </span>
                      <span className="text-sm font-bold text-blue-800">
                        {option.id === "usdc" ? userStaking.singleAssetStaked : userStaking.lpTokensStaked}{" "}
                        {option.asset}
                      </span>
                    </div>
                    <p className="text-xs text-blue-600">
                      Daily Points: +
                      {option.id === "usdc" ? userStaking.singleAssetStaked * 10 : userStaking.lpTokensStaked * 15}
                    </p>
                  </div>

                  {/* Pool Capacity */}
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-600 flex items-center">
                        <Target className="w-4 h-4 mr-1" />
                        Pool Capacity
                      </span>
                      <span className="text-sm font-bold text-slate-800">
                        ${option.totalStaked.toLocaleString()} / ${option.maxCapacity.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={(option.totalStaked / option.maxCapacity) * 100} className="h-3" />
                    <p className="text-xs text-slate-600 mt-1">
                      {Math.round((option.totalStaked / option.maxCapacity) * 100)}% filled
                    </p>
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
                    <Dialog
                      open={isStakeModalOpen && selectedStakingOption === option.id}
                      onOpenChange={(open) => {
                        setIsStakeModalOpen(open)
                        if (!open) setSelectedStakingOption(null)
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          className={`bg-gradient-to-r ${option.color} hover:opacity-90 shadow-lg`}
                          disabled={!isWalletConnected}
                          onClick={() => setSelectedStakingOption(option.id)}
                        >
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
                                Available: {option.id === "usdc" ? walletBalance.usdc : walletBalance.lpTokens}{" "}
                                {option.asset}
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
                                onClick={() => {
                                  const maxAmount = option.id === "usdc" ? walletBalance.usdc : walletBalance.lpTokens
                                  const amount = (maxAmount * percentage) / 100
                                  setStakeAmount(amount.toString())
                                }}
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
                                      {calculateDailyPoints(Number(stakeAmount), option.asset)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>$FLDAO Equivalent:</span>
                                    <span className="font-bold">
                                      {(calculateDailyPoints(Number(stakeAmount), option.asset) / exchangeRate).toFixed(
                                        2,
                                      )}
                                    </span>
                                  </div>
                                </TabsContent>
                                <TabsContent value="monthly" className="space-y-2 text-sm">
                                  {(() => {
                                    const monthly = calculateProjectedRewards(Number(stakeAmount), option.asset, 30)
                                    return (
                                      <>
                                        <div className="flex justify-between">
                                          <span>Points Earned:</span>
                                          <span className="font-bold">{monthly.points.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>$FLDAO Tokens:</span>
                                          <span className="font-bold">{monthly.fldao.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>USD Value:</span>
                                          <span className="font-bold text-green-600">${monthly.usd.toFixed(2)}</span>
                                        </div>
                                      </>
                                    )
                                  })()}
                                </TabsContent>
                                <TabsContent value="yearly" className="space-y-2 text-sm">
                                  {(() => {
                                    const yearly = calculateProjectedRewards(Number(stakeAmount), option.asset, 365)
                                    return (
                                      <>
                                        <div className="flex justify-between">
                                          <span>Points Earned:</span>
                                          <span className="font-bold">{yearly.points.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>$FLDAO Tokens:</span>
                                          <span className="font-bold">{yearly.fldao.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>USD Value:</span>
                                          <span className="font-bold text-green-600">${yearly.usd.toFixed(2)}</span>
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
                                <span className="font-medium">~0.001 SOL</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setIsStakeModalOpen(false)
                                setSelectedStakingOption(null)
                                setStakeAmount("")
                              }}
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={() => handleStake(option.asset, Number(stakeAmount))}
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

                    <Dialog open={isUnstakeModalOpen} onOpenChange={setIsUnstakeModalOpen}>
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
                              value={unstakeAmount}
                              onChange={(e) => setUnstakeAmount(e.target.value)}
                              step="0.01"
                              className="mt-1"
                            />
                            <p className="text-xs text-slate-600 mt-1">
                              Available:{" "}
                              {option.id === "usdc" ? userStaking.singleAssetStaked : userStaking.lpTokensStaked}{" "}
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
                            <Button variant="outline" onClick={() => setIsUnstakeModalOpen(false)} className="flex-1">
                              Cancel
                            </Button>
                            <Button
                              onClick={() => handleUnstake(option.asset, Number(unstakeAmount))}
                              disabled={!unstakeAmount || isProcessing}
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

        {/* Points Exchange Section */}
        <Card className="mb-12 shadow-lg border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Award className="w-8 h-8 mr-3" />
                <div>
                  <CardTitle className="text-xl">Exchange Staking Points</CardTitle>
                  <CardDescription className="text-purple-100">
                    Convert your accumulated points to $FLDAO tokens
                  </CardDescription>
                </div>
              </div>
              <div className="text-right">
                <Badge className="bg-white text-purple-600 text-lg px-3 py-1 mb-1">
                  {userStaking.stakingPoints.toLocaleString()} Points
                </Badge>
                <div className="text-xs text-purple-200">+{userStaking.dailyPointsEarning} daily</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                {/* Exchange Calculator */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-200">
                  <h4 className="font-semibold text-purple-900 mb-4 flex items-center">
                    <Calculator className="w-5 h-5 mr-2" />
                    Exchange Calculator
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                      <span className="text-gray-600">Your Points:</span>
                      <span className="font-bold text-lg">{userStaking.stakingPoints.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                      <span className="text-gray-600">Exchange Rate:</span>
                      <span className="font-bold">{exchangeRate} Points = 1 $FLDAO</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg border-2 border-purple-300">
                      <span className="font-semibold text-purple-900">You'll Receive:</span>
                      <span className="font-bold text-xl text-purple-600">{fldaoFromPoints} $FLDAO</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Remaining Points:</span>
                      <span className="font-medium">{userStaking.stakingPoints % exchangeRate}</span>
                    </div>
                  </div>
                </div>

                {/* $FLDAO Token Benefits */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-6">
                  <h4 className="font-semibold text-blue-900 mb-4 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2" />
                    $FLDAO Token Benefits
                  </h4>
                  <ul className="space-y-2">
                    {[
                      "Enhanced voting power in DAO proposals",
                      "Access to premium platform features",
                      "Reduced transaction fees (up to 50% off)",
                      "Exclusive governance participation rights",
                      "Priority access to new features",
                      "Quarterly dividend distributions",
                    ].map((benefit, index) => (
                      <li key={index} className="flex items-center text-sm text-blue-800">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex flex-col justify-center space-y-6">
                {/* Current $FLDAO Price */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-sm text-gray-600">Current $FLDAO Price</span>
                  </div>
                  <p className="text-3xl font-bold text-green-600">${fldaoPrice}</p>
                  <p className="text-sm text-green-500">+12.5% (24h)</p>
                </div>

                {/* Exchange Button */}
                <Dialog open={isExchangeModalOpen} onOpenChange={setIsExchangeModalOpen}>
                  <DialogTrigger asChild>
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 shadow-lg text-lg py-6"
                      disabled={!isWalletConnected || userStaking.stakingPoints < exchangeRate}
                    >
                      <Coins className="w-6 h-6 mr-2" />
                      Exchange Points for $FLDAO
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="flex items-center">
                        <Award className="w-5 h-5 mr-2" />
                        Exchange Staking Points
                      </DialogTitle>
                      <DialogDescription>
                        Convert your staking points to $FLDAO tokens. This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4">
                        <h4 className="font-semibold text-purple-900 mb-3">Exchange Summary</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Points to Exchange:</span>
                            <span className="font-bold">
                              {Math.floor(userStaking.stakingPoints / exchangeRate) * exchangeRate}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>$FLDAO Tokens:</span>
                            <span className="font-bold text-purple-600">{fldaoFromPoints}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>USD Value:</span>
                            <span className="font-bold text-green-600">
                              ${(fldaoFromPoints * fldaoPrice).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm text-slate-600">
                            <span>Remaining Points:</span>
                            <span>{userStaking.stakingPoints % exchangeRate}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                          <div>
                            <h4 className="font-semibold text-yellow-900">Important Notice</h4>
                            <p className="text-sm text-yellow-800">
                              This exchange is permanent and cannot be reversed. $FLDAO tokens will be sent to your
                              connected wallet.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button variant="outline" onClick={() => setIsExchangeModalOpen(false)} className="flex-1">
                          Cancel
                        </Button>
                        <Button
                          onClick={handleExchangePoints}
                          disabled={isProcessing}
                          className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600"
                        >
                          {isProcessing ? (
                            <div className="flex items-center">
                              <Loader2 className="animate-spin h-4 w-4 mr-2" />
                              Processing...
                            </div>
                          ) : (
                            "Exchange Now"
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {userStaking.stakingPoints < exchangeRate && (
                  <p className="text-sm text-slate-600 text-center">
                    You need at least {exchangeRate} points to exchange for $FLDAO tokens
                  </p>
                )}

                {/* Statistics */}
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-2xl font-bold text-gray-800">{userStaking.totalPointsEarned.toLocaleString()}</p>
                    <p className="text-xs text-gray-600">Total Points Earned</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-2xl font-bold text-gray-800">{userStaking.fldaoExchanged}</p>
                    <p className="text-xs text-gray-600">$FLDAO Exchanged</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Staking History */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <History className="w-5 h-5 mr-2" />
              Staking History
            </CardTitle>
            <CardDescription>Your recent staking activities and transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stakingHistory.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                        activity.action === "Stake"
                          ? "bg-green-100"
                          : activity.action === "Unstake"
                            ? "bg-red-100"
                            : "bg-purple-100"
                      }`}
                    >
                      {activity.action === "Stake" ? (
                        <ArrowUpRight className="w-6 h-6 text-green-600" />
                      ) : activity.action === "Unstake" ? (
                        <ArrowDownRight className="w-6 h-6 text-red-600" />
                      ) : (
                        <Coins className="w-6 h-6 text-purple-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{activity.action}</p>
                      <p className="text-sm text-slate-600">{activity.date}</p>
                      <div className="flex items-center text-xs text-slate-500">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        <span
                          className="cursor-pointer hover:text-blue-600"
                          onClick={() => copyToClipboard(activity.txHash)}
                        >
                          {activity.txHash.substring(0, 20)}...
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 ml-1"
                          onClick={() => copyToClipboard(activity.txHash)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {activity.amount > 0 && (
                      <p className="font-semibold text-slate-800">
                        {activity.amount} {activity.asset}
                      </p>
                    )}
                    {activity.points !== 0 && (
                      <p className={`text-sm ${activity.points > 0 ? "text-green-600" : "text-purple-600"}`}>
                        {activity.points > 0 ? "+" : ""}
                        {activity.points} points
                      </p>
                    )}
                    <Badge
                      variant={
                        activity.status === "Completed"
                          ? "default"
                          : activity.status === "Pending"
                            ? "secondary"
                            : "destructive"
                      }
                      className="text-xs"
                    >
                      {activity.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
