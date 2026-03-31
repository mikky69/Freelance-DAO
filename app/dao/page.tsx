"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Vote,
  Gavel,
  Coins,
  Newspaper,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Wallet,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function DAOPage() {
  const { user, isAuthenticated, isWalletConnected } = useAuth()

  const daoStats = {
    totalMembers: 12847,
    activeProposals: 8,
    totalStaked: 2847392,
    treasuryBalance: 1250000,
    completedDisputes: 156,
    stakingAPY: 12.5,
  }

  const recentActivity = [
    {
      type: "proposal",
      title: "Implement AI Agent Revenue Sharing",
      status: "Active",
      timeLeft: "3 days",
      votes: { yes: 1247, no: 234 },
    },
    {
      type: "dispute",
      title: "Payment Dispute #D-2024-0156",
      status: "Resolved",
      resolution: "Freelancer",
      amount: "2,500 USDC",
    },
    {
      type: "staking",
      title: "New Staking Pool Launched",
      status: "Active",
      apy: "18.2%",
      pool: "SOL/USDC LP",
    },
  ]

  const quickActions = [
    {
      title: "Create Proposal",
      description: "Submit a new governance proposal",
      href: "/dao/proposals",
      icon: Vote,
      iconColor: "text-blue-400",
      glowColor: "bg-blue-500/20",
      disabled: !isWalletConnected,
    },
    {
      title: "Submit Dispute",
      description: "File a dispute for resolution",
      href: "/dao/disputes",
      icon: Gavel,
      iconColor: "text-orange-400",
      glowColor: "bg-orange-500/20",
      disabled: !isAuthenticated,
    },
    {
      title: "Start Staking",
      description: "Stake tokens and earn rewards",
      href: "/dao/staking",
      icon: Coins,
      iconColor: "text-green-400",
      glowColor: "bg-green-500/20",
      disabled: !isWalletConnected,
    },
    {
      title: "Read News",
      description: "Latest DAO updates and announcements",
      href: "/dao/news",
      icon: Newspaper,
      iconColor: "text-purple-400",
      glowColor: "bg-purple-500/20",
      disabled: false,
    },
  ]

  return (
    <div className="min-h-screen bg-[#1D0225] text-white">

      {/* ── Hero Section ─────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#AE16A7] via-[#FF068D] to-[#FA5F04] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[#1D0225] opacity-20"></div>
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4 text-white">FreeLanceDAO Governance</h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Participate in decentralized governance, stake tokens, resolve disputes, and shape the future of
              freelancing on the blockchain
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge
                variant="secondary"
                className="text-lg px-4 py-2 bg-white/10 text-white border border-white/20 backdrop-blur-sm"
              >
                <Users className="w-5 h-5 mr-2" />
                {daoStats.totalMembers.toLocaleString()} Members
              </Badge>
              <Badge
                variant="secondary"
                className="text-lg px-4 py-2 bg-white/10 text-white border border-white/20 backdrop-blur-sm"
              >
                <Vote className="w-5 h-5 mr-2" />
                {daoStats.activeProposals} Active Proposals
              </Badge>
              <Badge
                variant="secondary"
                className="text-lg px-4 py-2 bg-white/10 text-white border border-white/20 backdrop-blur-sm"
              >
                <Coins className="w-5 h-5 mr-2" />
                ${daoStats.totalStaked.toLocaleString()} Staked
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">

        {/* ── Wallet Connection Alert ───────────────────────────────── */}
        {isAuthenticated && !isWalletConnected && (
          <Card className="mb-8 bg-[#2A0632] border-[#FA5F04]/50">
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="w-6 h-6 text-[#FA5F04] mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-white">Connect Your Wallet</h3>
                  <p className="text-slate-300 text-sm mt-1">
                    Connect your wallet to participate in DAO governance, voting, staking, and disputes.
                  </p>
                </div>
                <Button className="bg-[#FA5F04] hover:bg-[#FA5F04]/80 text-white border-0 ml-4 flex-shrink-0">
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Quick Actions ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {quickActions.map((action) => (
            <Card
              key={action.title}
              className={`
                transition-all duration-300
                bg-[#2A0632] border-[#AE16A7]/30
                ${action.disabled
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:scale-105 hover:border-[#AE16A7] hover:shadow-lg hover:shadow-[#AE16A7]/20 cursor-pointer"
                }
              `}
            >
              <CardHeader className="text-center pb-2">
                {/* Icon circle */}
                <div className={`w-16 h-16 ${action.glowColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <action.icon className={`w-8 h-8 ${action.iconColor}`} />
                </div>
                {/* Title — explicit text-white so it never goes dark */}
                <CardTitle className="text-xl text-white">{action.title}</CardTitle>
                {/* Description — explicit muted colour so it's readable on dark card */}
                <CardDescription className="text-slate-400 text-sm">{action.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={action.href}>
                  <Button
                    className="w-full bg-[#AE16A7]/20 hover:bg-[#AE16A7]/40 text-white border border-[#AE16A7]/50"
                    disabled={action.disabled}
                  >
                    {action.disabled ? "Connect Wallet to Continue" : "Get Started"}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── DAO Statistics ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">

          {/* Treasury Balance */}
          <Card className="bg-[#2A0632] border-[#AE16A7]/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Treasury Balance</CardTitle>
              <Wallet className="h-4 w-4 text-[#AE16A7]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                ${daoStats.treasuryBalance.toLocaleString()}
              </div>
              <p className="text-xs text-[#FA5F04] mt-1">+12.5% from last month</p>
            </CardContent>
          </Card>

          {/* Staking APY */}
          <Card className="bg-[#2A0632] border-[#AE16A7]/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Staking APY</CardTitle>
              <TrendingUp className="h-4 w-4 text-[#FA5F04]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{daoStats.stakingAPY}%</div>
              <p className="text-xs text-slate-400 mt-1">Current annual percentage yield</p>
            </CardContent>
          </Card>

          {/* Resolved Disputes */}
          <Card className="bg-[#2A0632] border-[#AE16A7]/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Resolved Disputes</CardTitle>
              <CheckCircle className="h-4 w-4 text-[#FF068D]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{daoStats.completedDisputes}</div>
              <p className="text-xs text-slate-400 mt-1">98.7% satisfaction rate</p>
            </CardContent>
          </Card>

        </div>

        {/* ── Recent Activity ───────────────────────────────────────── */}
        <Card className="bg-[#2A0632] border-[#AE16A7]/30">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Recent DAO Activity</CardTitle>
            <CardDescription className="text-slate-400">
              Latest proposals, disputes, and staking updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-4 p-4 border border-[#AE16A7]/20 rounded-lg bg-[#1D0225]/60 hover:bg-[#AE16A7]/10 transition-colors"
                >

                  {/* ── Proposal activity ── */}
                  {activity.type === "proposal" && (
                    <>
                      <div className="w-12 h-12 bg-[#AE16A7]/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <Vote className="w-6 h-6 text-[#AE16A7]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white">{activity.title}</h4>
                        <div className="flex items-center flex-wrap gap-3 mt-1 text-sm text-slate-400">
                          <Badge className="bg-[#FA5F04]/20 text-[#FA5F04] border-0 text-xs">
                            {activity.status}
                          </Badge>
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {activity.timeLeft} remaining
                          </span>
                        </div>
                        <div className="mt-3">
                          <Progress
                            value={(activity.votes.yes / (activity.votes.yes + activity.votes.no)) * 100}
                            className="h-2 bg-[#1D0225]"
                          />
                          <div className="flex justify-between text-xs text-slate-400 mt-1">
                            <span className="text-green-400">Yes: {activity.votes.yes}</span>
                            <span className="text-red-400">No: {activity.votes.no}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* ── Dispute activity ── */}
                  {activity.type === "dispute" && (
                    <>
                      <div className="w-12 h-12 bg-[#FA5F04]/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <Gavel className="w-6 h-6 text-[#FA5F04]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white">{activity.title}</h4>
                        <div className="flex items-center flex-wrap gap-3 mt-1 text-sm text-slate-400">
                          <Badge className="bg-[#AE16A7]/20 text-[#AE16A7] border-0 text-xs">
                            {activity.status}
                          </Badge>
                          <span>Resolution: <span className="text-white">{activity.resolution}</span></span>
                          <span>Amount: <span className="text-white">{activity.amount}</span></span>
                        </div>
                      </div>
                    </>
                  )}

                  {/* ── Staking activity ── */}
                  {activity.type === "staking" && (
                    <>
                      <div className="w-12 h-12 bg-[#FF068D]/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <Coins className="w-6 h-6 text-[#FF068D]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white">{activity.title}</h4>
                        <div className="flex items-center flex-wrap gap-3 mt-1 text-sm text-slate-400">
                          <Badge className="bg-[#FA5F04]/20 text-[#FA5F04] border-0 text-xs">
                            {activity.status}
                          </Badge>
                          <span>APY: <span className="text-green-400 font-semibold">{activity.apy}</span></span>
                          <span>Pool: <span className="text-white">{activity.pool}</span></span>
                        </div>
                      </div>
                    </>
                  )}

                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
