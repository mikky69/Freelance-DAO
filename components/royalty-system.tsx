"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DollarSign,
  TrendingUp,
  Bot,
  Shield,
  Crown,
  Handshake,
  PieChart,
  Calendar,
  Award,
  AlertCircle,
} from "lucide-react"

interface RoyaltyData {
  agentId: string
  agentName: string
  originalCreator: {
    id: string
    name: string
    avatar: string
  }
  currentOwner: {
    id: string
    name: string
    avatar: string
  }
  royaltyRate: number
  totalRevenue: number
  royaltiesPaid: number
  monthlyRoyalties: number
  transferHistory: Array<{
    id: string
    fromUser: string
    toUser: string
    date: string
    transferPrice: number
    royaltyAtTransfer: number
  }>
  revenueHistory: Array<{
    month: string
    revenue: number
    royalty: number
  }>
}

interface RoyaltySystemProps {
  userRole: "creator" | "owner" | "admin"
  userId: string
}

export function RoyaltySystem({ userRole, userId }: RoyaltySystemProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly")

  // Mock data for demonstration
  const mockRoyaltyData: RoyaltyData[] = [
    {
      agentId: "agent1",
      agentName: "CodeMaster AI",
      originalCreator: {
        id: "creator1",
        name: "Alex Chen",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      currentOwner: {
        id: "owner1",
        name: "TechCorp Inc.",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      royaltyRate: 15,
      totalRevenue: 12450.0,
      royaltiesPaid: 1867.5,
      monthlyRoyalties: 234.5,
      transferHistory: [
        {
          id: "t1",
          fromUser: "Alex Chen",
          toUser: "TechCorp Inc.",
          date: "2024-01-15",
          transferPrice: 5000,
          royaltyAtTransfer: 750,
        },
      ],
      revenueHistory: [
        { month: "Jan 2024", revenue: 2100, royalty: 315 },
        { month: "Feb 2024", revenue: 2800, royalty: 420 },
        { month: "Mar 2024", revenue: 3200, royalty: 480 },
        { month: "Apr 2024", revenue: 2900, royalty: 435 },
        { month: "May 2024", revenue: 1450, royalty: 217.5 },
      ],
    },
    {
      agentId: "agent2",
      agentName: "ContentCraft Pro",
      originalCreator: {
        id: "creator2",
        name: "Sarah Johnson",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      currentOwner: {
        id: "creator2",
        name: "Sarah Johnson",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      royaltyRate: 12,
      totalRevenue: 8750.0,
      royaltiesPaid: 1050.0,
      monthlyRoyalties: 156.8,
      transferHistory: [],
      revenueHistory: [
        { month: "Jan 2024", revenue: 1500, royalty: 180 },
        { month: "Feb 2024", revenue: 1800, royalty: 216 },
        { month: "Mar 2024", revenue: 2200, royalty: 264 },
        { month: "Apr 2024", revenue: 1950, royalty: 234 },
        { month: "May 2024", revenue: 1300, royalty: 156 },
      ],
    },
  ]

  const totalRoyaltiesEarned = mockRoyaltyData.reduce((sum, agent) => sum + agent.royaltiesPaid, 0)
  const monthlyRoyaltiesTotal = mockRoyaltyData.reduce((sum, agent) => sum + agent.monthlyRoyalties, 0)
  const totalAgentsCreated = mockRoyaltyData.length
  const averageRoyaltyRate = mockRoyaltyData.reduce((sum, agent) => sum + agent.royaltyRate, 0) / mockRoyaltyData.length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-4 flex items-center justify-center">
          <Crown className="w-8 h-8 mr-3 text-yellow-500" />
          Royalty Management System
        </h2>
        <p className="text-slate-600 text-lg max-w-3xl mx-auto">
          Track and manage royalty payments for AI agents. Original creators continue to earn from their innovations
          regardless of ownership transfers.
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 opacity-50" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Total Royalties Earned</p>
                <p className="text-3xl font-bold text-green-600">${totalRoyaltiesEarned.toFixed(2)}</p>
                <p className="text-xs text-green-500 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +18.5% this month
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 opacity-50" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Monthly Royalties</p>
                <p className="text-3xl font-bold text-blue-600">${monthlyRoyaltiesTotal.toFixed(2)}</p>
                <p className="text-xs text-blue-500 flex items-center mt-1">
                  <Calendar className="w-3 h-3 mr-1" />
                  This month
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <PieChart className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-purple-100 opacity-50" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">AI Agents Created</p>
                <p className="text-3xl font-bold text-purple-600">{totalAgentsCreated}</p>
                <p className="text-xs text-purple-500 flex items-center mt-1">
                  <Bot className="w-3 h-3 mr-1" />
                  Active agents
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-yellow-100 opacity-50" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Avg Royalty Rate</p>
                <p className="text-3xl font-bold text-yellow-600">{averageRoyaltyRate.toFixed(1)}%</p>
                <p className="text-xs text-yellow-500 flex items-center mt-1">
                  <Award className="w-3 h-3 mr-1" />
                  Industry standard
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="agents" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="agents">My Agents</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="transfers">Transfer History</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockRoyaltyData.map((agent) => (
              <Card key={agent.agentId} className="shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Bot className="w-5 h-5 mr-2" />
                      {agent.agentName}
                    </CardTitle>
                    <Badge className="bg-green-100 text-green-700">{agent.royaltyRate}% Royalty</Badge>
                  </div>
                  <CardDescription>
                    {agent.originalCreator.id === agent.currentOwner.id ? "Self-owned" : "Transferred ownership"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Creator and Owner Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <Avatar className="w-12 h-12 mx-auto mb-2">
                        <AvatarImage src={agent.originalCreator.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{agent.originalCreator.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="text-sm font-medium text-blue-800">Original Creator</div>
                      <div className="text-xs text-blue-600">{agent.originalCreator.name}</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <Avatar className="w-12 h-12 mx-auto mb-2">
                        <AvatarImage src={agent.currentOwner.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{agent.currentOwner.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="text-sm font-medium text-purple-800">Current Owner</div>
                      <div className="text-xs text-purple-600">{agent.currentOwner.name}</div>
                    </div>
                  </div>

                  {/* Revenue and Royalty Stats */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm font-medium">Total Revenue</span>
                      <span className="text-lg font-bold text-green-600">${agent.totalRevenue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm font-medium">Royalties Paid</span>
                      <span className="text-lg font-bold text-blue-600">${agent.royaltiesPaid.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                      <span className="text-sm font-medium text-green-800">Monthly Royalties</span>
                      <span className="text-lg font-bold text-green-600">${agent.monthlyRoyalties.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Royalty Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Royalty Rate</span>
                      <span>{agent.royaltyRate}%</span>
                    </div>
                    <Progress value={agent.royaltyRate} className="h-2" />
                    <div className="text-xs text-slate-500">
                      {agent.royaltyRate}% of all revenue goes to the original creator
                    </div>
                  </div>

                  {/* Transfer Status */}
                  {agent.transferHistory.length > 0 && (
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-center text-amber-800 mb-2">
                        <Handshake className="w-4 h-4 mr-2" />
                        <span className="font-semibold">Ownership Transferred</span>
                      </div>
                      <div className="text-sm text-amber-700">
                        Transferred on {agent.transferHistory[0].date} for ${agent.transferHistory[0].transferPrice}
                      </div>
                      <div className="text-xs text-amber-600 mt-1">
                        Creator royalty: ${agent.transferHistory[0].royaltyAtTransfer} (
                        {(
                          (agent.transferHistory[0].royaltyAtTransfer / agent.transferHistory[0].transferPrice) *
                          100
                        ).toFixed(1)}
                        %)
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trends */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Revenue Trends
                </CardTitle>
                <CardDescription>Monthly revenue and royalty payments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRoyaltyData[0].revenueHistory.map((month, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm font-medium">{month.month}</span>
                      <div className="text-right">
                        <div className="text-sm font-bold">${month.revenue}</div>
                        <div className="text-xs text-green-600">Royalty: ${month.royalty}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Royalty Distribution */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="w-5 h-5 mr-2" />
                  Royalty Distribution
                </CardTitle>
                <CardDescription>How royalties are distributed across agents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRoyaltyData.map((agent, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{agent.agentName}</span>
                        <span>${agent.royaltiesPaid.toFixed(2)}</span>
                      </div>
                      <Progress value={(agent.royaltiesPaid / totalRoyaltiesEarned) * 100} className="h-2" />
                      <div className="text-xs text-slate-500">
                        {((agent.royaltiesPaid / totalRoyaltiesEarned) * 100).toFixed(1)}% of total royalties
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transfers" className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Handshake className="w-5 h-5 mr-2" />
                Ownership Transfer History
              </CardTitle>
              <CardDescription>Track all ownership transfers and associated royalty payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRoyaltyData
                  .filter((agent) => agent.transferHistory.length > 0)
                  .map((agent) =>
                    agent.transferHistory.map((transfer, index) => (
                      <div key={`${agent.agentId}-${index}`} className="p-4 border border-slate-200 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <Bot className="w-8 h-8 text-blue-500" />
                            <div>
                              <div className="font-semibold">{agent.agentName}</div>
                              <div className="text-sm text-slate-600">Agent Transfer</div>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-700">Completed</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="font-medium text-slate-700">Transfer Details</div>
                            <div className="text-slate-600">From: {transfer.fromUser}</div>
                            <div className="text-slate-600">To: {transfer.toUser}</div>
                            <div className="text-slate-600">Date: {transfer.date}</div>
                          </div>
                          <div>
                            <div className="font-medium text-slate-700">Financial Details</div>
                            <div className="text-slate-600">Transfer Price: ${transfer.transferPrice}</div>
                            <div className="text-slate-600">Creator Royalty: ${transfer.royaltyAtTransfer}</div>
                            <div className="text-slate-600">
                              Royalty Rate: {((transfer.royaltyAtTransfer / transfer.transferPrice) * 100).toFixed(1)}%
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-slate-700">Current Status</div>
                            <div className="text-slate-600">Ongoing Royalty: {agent.royaltyRate}%</div>
                            <div className="text-slate-600">Monthly: ${agent.monthlyRoyalties.toFixed(2)}</div>
                            <div className="text-slate-600">Total Paid: ${agent.royaltiesPaid.toFixed(2)}</div>
                          </div>
                        </div>
                      </div>
                    )),
                  )}
                {mockRoyaltyData.filter((agent) => agent.transferHistory.length > 0).length === 0 && (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-600 mb-2">No Transfers Yet</h3>
                    <p className="text-slate-500">
                      When AI agents are transferred between users, the transfer history will appear here.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Legal Notice */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <Shield className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-800 mb-2">Royalty System Guarantee</h3>
              <p className="text-sm text-blue-700 mb-3">
                Our smart contract-based royalty system ensures that original creators continue to receive their fair
                share of revenue, regardless of how many times ownership is transferred. All payments are automatically
                distributed and transparently recorded on the blockchain.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-blue-600">
                <div>
                  <strong>Automatic Distribution:</strong> Royalties are paid instantly with each transaction
                </div>
                <div>
                  <strong>Transparent Records:</strong> All payments are recorded on the Hedera blockchain
                </div>
                <div>
                  <strong>Immutable Terms:</strong> Royalty rates cannot be changed after agent creation
                </div>
                <div>
                  <strong>Global Enforcement:</strong> Smart contracts ensure compliance across all platforms
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
