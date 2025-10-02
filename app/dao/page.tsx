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
      color: "bg-blue-500",
      disabled: !isWalletConnected,
    },
    {
      title: "Submit Dispute",
      description: "File a dispute for resolution",
      href: "/dao/disputes",
      icon: Gavel,
      color: "bg-orange-500",
      disabled: !isAuthenticated,
    },
    {
      title: "Start Staking",
      description: "Stake tokens and earn rewards",
      href: "/dao/staking",
      icon: Coins,
      color: "bg-green-500",
      disabled: !isWalletConnected,
    },
    {
      title: "Read News",
      description: "Latest DAO updates and announcements",
      href: "/dao/news",
      icon: Newspaper,
      color: "bg-purple-500",
      disabled: false,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">FreeLanceDAO Governance</h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Participate in decentralized governance, stake tokens, resolve disputes, and shape the future of
              freelancing on the blockchain
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                <Users className="w-5 h-5 mr-2" />
                {daoStats.totalMembers.toLocaleString()} Members
              </Badge>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                <Vote className="w-5 h-5 mr-2" />
                {daoStats.activeProposals} Active Proposals
              </Badge>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                <Coins className="w-5 h-5 mr-2" />${daoStats.totalStaked.toLocaleString()} Staked
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Wallet Connection Alert */}
        {isAuthenticated && !isWalletConnected && (
          <Card className="mb-8 bg-orange-50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="w-6 h-6 text-orange-500 mr-3" />
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-900">Connect Your Wallet</h3>
                  <p className="text-orange-700">
                    Connect your wallet to participate in DAO governance.
                  </p>
                </div>
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {quickActions.map((action) => (
            <Card
              key={action.title}
              className={`hover:shadow-lg transition-all duration-300 ${
                action.disabled ? "opacity-60" : "hover:scale-105"
              }`}
            >
              <CardHeader className="text-center">
                <div className={`w-16 h-16 ${action.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <action.icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">{action.title}</CardTitle>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={action.href}>
                  <Button className="w-full" disabled={action.disabled}>
                    {action.disabled && action.title.includes("Proposal") ? "Connect Wallet" : "Get Started"}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* DAO Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Treasury Balance</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${daoStats.treasuryBalance.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+12.5% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Staking APY</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{daoStats.stakingAPY}%</div>
              <p className="text-xs text-muted-foreground">Current annual percentage yield</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved Disputes</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{daoStats.completedDisputes}</div>
              <p className="text-xs text-muted-foreground">98.7% satisfaction rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Recent DAO Activity</CardTitle>
            <CardDescription>Latest proposals, disputes, and staking updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                  {activity.type === "proposal" && (
                    <>
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Vote className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{activity.title}</h4>
                        <div className="flex items-center space-x-4 text-sm text-slate-600">
                          <Badge className="bg-green-100 text-green-800">{activity.status}</Badge>
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {activity.timeLeft}
                          </span>
                        </div>
                        <div className="mt-2">
                          <Progress
                            value={(activity.votes.yes / (activity.votes.yes + activity.votes.no)) * 100}
                            className="h-2"
                          />
                          <div className="flex justify-between text-xs text-slate-600 mt-1">
                            <span>Yes: {activity.votes.yes}</span>
                            <span>No: {activity.votes.no}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {activity.type === "dispute" && (
                    <>
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <Gavel className="w-6 h-6 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{activity.title}</h4>
                        <div className="flex items-center space-x-4 text-sm text-slate-600">
                          <Badge className="bg-blue-100 text-blue-800">{activity.status}</Badge>
                          <span>Resolution: {activity.resolution}</span>
                          <span>Amount: {activity.amount}</span>
                        </div>
                      </div>
                    </>
                  )}

                  {activity.type === "staking" && (
                    <>
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Coins className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{activity.title}</h4>
                        <div className="flex items-center space-x-4 text-sm text-slate-600">
                          <Badge className="bg-green-100 text-green-800">{activity.status}</Badge>
                          <span>APY: {activity.apy}</span>
                          <span>Pool: {activity.pool}</span>
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
