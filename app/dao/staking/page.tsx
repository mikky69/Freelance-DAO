"use client"

import { useState, useEffect, useMemo } from "react"
import { useAccount, useBalance } from "wagmi"
import { useWriteContract, useReadContract, useWaitForTransactionReceipt, useWatchContractEvent, useConfig } from "wagmi"
import { parseEther, formatEther } from "viem"
import StakingDeployment from "@/base-smart-contracts/deployments/baseSepolia/FreelanceDAOStaking.json"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { txSubmittedToast, txSuccessToast, txErrorToast } from "@/components/tx-toast"
import { useAuth } from "@/lib/auth-context"
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Coins, Wallet, ArrowUpRight, ArrowDownRight, Clock,
  DollarSign, AlertCircle, Info, CheckCircle,
  History, Sparkles, Loader2,
} from "lucide-react"

const stakingAddress = StakingDeployment.address as `0x${string}`
const stakingAbi     = StakingDeployment.abi
const BASE_SEPOLIA_CHAIN_ID = 84532

export default function StakingPage() {
  const { isAuthenticated } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [stakeAmount, setStakeAmount] = useState("")
  const [unstakeAmount, setUnstakeAmount] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const { address, isConnected } = useAccount()
  const { writeContract, data: txHash, error: writeError, isPending: isWritePending, reset } = useWriteContract()
  const { isLoading: isTxLoading, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  const { data: userBalanceData } = useBalance({ address, chainId: BASE_SEPOLIA_CHAIN_ID })
  const availableBalance = userBalanceData ? Number(formatEther(userBalanceData.value)) : 0

  const { data: userStakeData, refetch: refetchStake } = useReadContract({
    address: stakingAddress, abi: stakingAbi, functionName: "getStakedAmount",
    args: address ? [address] : undefined,
    chainId: BASE_SEPOLIA_CHAIN_ID,
    query: { enabled: !!address },
  })

  const { data: totalStaked, refetch: refetchTotalStaked } = useReadContract({
    address: stakingAddress, abi: stakingAbi, functionName: "totalStaked",
    chainId: BASE_SEPOLIA_CHAIN_ID,
  })

  const { data: userStakes, refetch: refetchUserStaked } = useReadContract({
    address: stakingAddress, abi: stakingAbi, functionName: "getUserStaking",
    args: address ? [address] : undefined,
    chainId: BASE_SEPOLIA_CHAIN_ID,
    query: { enabled: !!address },
  })

  const { data: lockTime } = useReadContract({
    address: stakingAddress, abi: stakingAbi, functionName: "lockTime",
    chainId: BASE_SEPOLIA_CHAIN_ID,
    query: { enabled: !!stakingAddress },
  })

  // Tx toasts
  useEffect(() => { if (txHash) txSubmittedToast(txHash, "Staking transaction") }, [txHash])
  useEffect(() => { if (isTxSuccess && txHash) txSuccessToast(txHash, "Staking transaction") }, [isTxSuccess, txHash])
  useEffect(() => {
    if (writeError) txErrorToast(writeError.message?.slice(0, 120) || "Transaction failed", txHash)
  }, [writeError])

  useEffect(() => {
    if (isTxSuccess) setTimeout(() => { refetchTotalStaked() }, 1000)
  }, [isTxSuccess, refetchTotalStaked])

  const stakedAmount      = userStakeData ? Number(formatEther(userStakeData as bigint)) : 0
  const totalStakedAmount = totalStaked   ? Number(formatEther(totalStaked as bigint))   : 0
  const displayApy        = "Governance" // V2 is governance-only per GUIDE.md

  const userTotalStake      = Array.isArray(userStakes) && userStakes[0] ? Number(formatEther(userStakes[0])) : 0
  const lastStakedTimestamp = Array.isArray(userStakes) && userStakes[1] ? Number(userStakes[1]) : 0
  const lockTimeMs          = lockTime ? Number(lockTime) * 1000 : 0

  // Prevent hydration mismatch and build-time hook warnings
  if (!mounted) return null;

  useWatchContractEvent({
    address: stakingAddress, abi: stakingAbi, eventName: "Staked",
    chainId: BASE_SEPOLIA_CHAIN_ID,
    onLogs: () => {
      setStakeAmount("")
      reset()
      refetchStake(); refetchTotalStaked(); refetchUserStaked()
    },
  })

  const handleStake = async () => {
    if (!isConnected) { txErrorToast("Please connect your wallet first"); return }
    const amount = Number(stakeAmount)
    if (!amount || amount <= 0) { txErrorToast("Please enter a valid amount"); return }
    if (amount > availableBalance) { txErrorToast("Insufficient balance"); return }
    setIsProcessing(true)
    try {
      writeContract({
        address: stakingAddress, abi: stakingAbi, functionName: "stake",
        value: parseEther(stakeAmount),
      })
    } catch (err: any) {
      txErrorToast(err?.message || "Staking failed. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUnstake = async () => {
    if (!isConnected) { txErrorToast("Please connect your wallet first"); return }
    const amount = Number(unstakeAmount)
    const now = Date.now()
    const unlockTime = lastStakedTimestamp * 1000 + lockTimeMs

    if (!amount || amount <= 0) { txErrorToast("Please enter a valid unstake amount"); return }
    if (amount > userTotalStake) { txErrorToast("Unstake amount exceeds your staked amount"); return }
    if (now < unlockTime) {
      const msLeft = unlockTime - now
      const totalSec = Math.floor(msLeft / 1000)
      const days    = Math.floor(totalSec / 86400)
      const hours   = Math.floor((totalSec % 86400) / 3600)
      const minutes = Math.floor((totalSec % 3600) / 60)
      const timeStr = [days > 0 && `${days}d`, hours > 0 && `${hours}h`, minutes > 0 && `${minutes}m`]
        .filter(Boolean).join(" ") || "less than a minute"
      txErrorToast(`Tokens still locked. Wait ${timeStr} before unstaking.`)
      return
    }
    setIsProcessing(true)
    try {
      writeContract({
        address: stakingAddress, abi: stakingAbi, functionName: "unstake",
        args: [parseEther(unstakeAmount)],
      })
      setUnstakeAmount("")
      refetchStake(); refetchUserStaked(); refetchTotalStaked()
    } catch (err: any) {
      txErrorToast(err?.message || "Unstake failed. Please try again.")
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
              Stake ETH, earn rewards, and participate in DAO governance
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              {[
                { label: "Total Staked", value: `${totalStakedAmount.toFixed(4)} ETH` },
                { label: "Your Stake", value: `${stakedAmount.toFixed(4)} ETH` },
                { label: "Weight", value: displayApy },
              ].map(s => (
                <div key={s.label} className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <p className="text-3xl font-bold">{s.value}</p>
                  <p className="text-green-200">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isAuthenticated && !isConnected && (
        <div className="container mx-auto px-4 pt-6">
          <Card className="mb-8 bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
            <CardContent className="p-6 flex items-center gap-4">
              <AlertCircle className="w-6 h-6 text-orange-500" />
              <div className="flex-1">
                <h3 className="font-semibold text-orange-900">Connect Your Wallet</h3>
                <p className="text-orange-700 text-sm">Connect your wallet to start staking and earning rewards.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Staking Card */}
      <div className="flex flex-col items-center max-w-xl gap-8 mb-12 mx-auto px-4 py-8">
        <Card className="w-full shadow-lg hover:shadow-xl transition-all duration-300 border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <DollarSign className="w-8 h-8 mr-3" />
                <div>
                  <CardTitle className="text-xl">Single Asset Staking</CardTitle>
                  <CardDescription className="text-white/90">Stake ETH for steady, predictable returns</CardDescription>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold bg-white text-gray-800 px-3 py-1 rounded-full">Governance</div>
                <div className="text-xs text-white/80 mt-1">Risk: Low</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                { label: "Asset", value: "ETH" },
                { label: "Min Stake", value: "0.001 ETH" },
                { label: "Lock Period", value: "7 days" },
                { label: "Your Stake", value: `${stakedAmount.toFixed(4)} ETH` },
              ].map(item => (
                <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                  <span className="font-medium text-slate-600">{item.label}:</span>
                  <p className="text-slate-800 font-bold text-lg">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-600 flex items-center">
                  <Coins className="w-4 h-4 mr-1" />Total Staked
                </span>
                <span className="text-sm font-bold text-blue-800">{totalStakedAmount.toFixed(4)} ETH</span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                <Sparkles className="w-4 h-4 mr-1" />Key Features
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                {["Low lock period", "Instant withdrawals after lock", "Stable returns"].map(f => (
                  <li key={f} className="flex items-center">
                    <CheckCircle className="w-3 h-3 mr-2 text-green-600" />{f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-900 mb-2 flex items-center">
                <Info className="w-4 h-4 mr-1" />How to Acquire ETH
              </h4>
              <p className="text-sm text-yellow-800">
                Purchase ETH from any major exchange like Coinbase or Binance, then bridge to Base Sepolia for testing.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              {/* Stake Dialog */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:opacity-90 shadow-lg" disabled={!isConnected}>
                    <ArrowUpRight className="w-4 h-4 mr-2" />Stake ETH
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center"><Coins className="w-5 h-5 mr-2" />Stake ETH</DialogTitle>
                    <DialogDescription>Enter the amount to stake. You'll start earning rewards immediately.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="stakeAmount">Amount to Stake</Label>
                      <div className="relative mt-1">
                        <Input id="stakeAmount" type="number" placeholder="0.00" value={stakeAmount} onChange={(e) => setStakeAmount(e.target.value)} min={0.001} step="0.001" className="pr-16" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">ETH</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-600 mt-1">
                        <span>Min: 0.001 ETH</span>
                        <span>Available: {availableBalance.toFixed(4)} ETH</span>
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
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm space-y-1">
                      <div className="flex justify-between"><span>Type:</span><span className="font-medium">Governance Power</span></div>
                      <div className="flex justify-between"><span>Lock Period:</span><span className="font-medium">7 days</span></div>
                      <div className="flex justify-between"><span>Network:</span><span className="font-medium">Base Sepolia</span></div>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1" onClick={() => setStakeAmount("")}>Cancel</Button>
                      <Button
                        disabled={!stakeAmount || Number(stakeAmount) < 0.001 || isProcessing || Number(stakeAmount) > availableBalance}
                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600"
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
                    <ArrowDownRight className="w-4 h-4 mr-2" />Unstake
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Unstake ETH</DialogTitle>
                    <DialogDescription>Enter the amount to unstake. Lock period applies.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="unstakeAmount">Amount to Unstake</Label>
                      <Input id="unstakeAmount" type="number" placeholder="0.00" value={unstakeAmount} onChange={e => setUnstakeAmount(e.target.value)} step="0.001" className="mt-1" />
                      <p className="text-xs text-slate-600 mt-1">Available to unstake: {userTotalStake.toFixed(4)} ETH</p>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
                      <Clock className="w-5 h-5 text-yellow-600 shrink-0" />
                      <div>
                        <h4 className="font-semibold text-yellow-900">Lock Period Notice</h4>
                        <p className="text-sm text-yellow-800">Funds are available 7 days after staking</p>
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
          </CardContent>
        </Card>
      </div>

      {/* Staking History */}
      <div className="container mx-auto px-4 pb-12">
        <Card className="max-w-xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600" />Staking History
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
                  <span className="font-bold text-blue-700">{userStakes[1] ? new Date(Number(userStakes[1]) * 1000).toLocaleString() : "—"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Rewards Earned:</span>
                  <span className="font-bold text-emerald-700">{userStakes[2] ? Number(formatEther(userStakes[2])).toFixed(6) : 0} ETH</span>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-center py-4">No staking history found.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}