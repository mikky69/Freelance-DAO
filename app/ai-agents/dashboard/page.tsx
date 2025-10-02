"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Bot,
  DollarSign,
  TrendingUp,
  Clock,
  Star,
  Play,
  Pause,
  Settings,
  MoreVertical,
  CheckCircle,
  Activity,
  Users,
  Zap,
  BarChart3,
  Eye,
  Briefcase,
  Sparkles,
  Target,
  Award,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { toast } from "sonner"

// Mock data for user's AI agents
const mockUserAgents = [
  {
    id: "1",
    name: "CodeMaster AI",
    status: "active" as const,
    earnings: { total: 2847.5, thisMonth: 485.2 },
    stats: { completedTasks: 156, rating: 4.9, responseTime: "1.8s", uptime: 99.2 },
    recentJobs: [
      {
        id: "j1",
        title: "React Component Development",
        client: "TechCorp",
        amount: 75,
        status: "completed" as const,
        completedAt: "2 hours ago",
      },
      {
        id: "j2",
        title: "API Integration",
        client: "StartupXYZ",
        amount: 120,
        status: "in-progress" as const,
        startedAt: "4 hours ago",
      },
      {
        id: "j3",
        title: "Bug Fix Analysis",
        client: "DevTeam",
        amount: 45,
        status: "completed" as const,
        completedAt: "1 day ago",
      },
    ],
  },
  {
    id: "2",
    name: "ContentCraft Pro",
    status: "paused" as const,
    earnings: { total: 1923.75, thisMonth: 234.5 },
    stats: { completedTasks: 89, rating: 4.7, responseTime: "3.2s", uptime: 97.8 },
    recentJobs: [
      {
        id: "j4",
        title: "Blog Post Writing",
        client: "Marketing Co",
        amount: 85,
        status: "completed" as const,
        completedAt: "3 days ago",
      },
      {
        id: "j5",
        title: "Product Description",
        client: "E-commerce",
        amount: 35,
        status: "completed" as const,
        completedAt: "5 days ago",
      },
    ],
  },
]

export default function AIAgentDashboard() {
  const { user } = useAuth()
  const [selectedAgent, setSelectedAgent] = useState(mockUserAgents[0])

  const totalEarnings = mockUserAgents.reduce((sum, agent) => sum + agent.earnings.total, 0)
  const monthlyEarnings = mockUserAgents.reduce((sum, agent) => sum + agent.earnings.thisMonth, 0)
  const totalTasks = mockUserAgents.reduce((sum, agent) => sum + agent.stats.completedTasks, 0)
  const avgRating = mockUserAgents.reduce((sum, agent) => sum + agent.stats.rating, 0) / mockUserAgents.length

  const toggleAgentStatus = (agentId: string) => {
    const agent = mockUserAgents.find((a) => a.id === agentId)
    if (agent) {
      const newStatus = agent.status === "active" ? "paused" : "active"
      toast.success(`${agent.name} has been ${newStatus}`)
    }
  }

  return (
    <ProtectedRoute requireAuth={true} requiredRole="freelancer" requireCompleteProfile={true}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Enhanced Header with Visual Elements */}
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 right-10 w-32 h-32 bg-white rounded-full animate-pulse" />
            <div className="absolute bottom-10 left-10 w-24 h-24 bg-white rounded-full animate-pulse delay-1000" />
          </div>

          <div className="relative container mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-4xl font-bold flex items-center mb-3">
                  <div className="relative mr-4">
                    <Bot className="w-10 h-10" />
                    <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-yellow-300 animate-pulse" />
                  </div>
                  AI Agent Dashboard
                </h1>
                <p className="text-blue-100 text-lg">Monitor and manage your autonomous AI agents</p>
                <div className="flex items-center space-x-4 mt-4">
                  <Badge className="bg-white/20 text-white border-white/30">
                    <Users className="w-3 h-3 mr-1" />
                    {mockUserAgents.length} Active Agents
                  </Badge>
                  <Badge className="bg-white/20 text-white border-white/30">
                    <DollarSign className="w-3 h-3 mr-1" />${totalEarnings.toFixed(0)} Total Earned
                  </Badge>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Link href="/ai-agents/register">
                  <Button className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg">
                    <Zap className="w-4 h-4 mr-2" />
                    Register New Agent
                  </Button>
                </Link>
                <Link href="/ai-agents">
                  <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                    <Eye className="w-4 h-4 mr-2" />
                    View Marketplace
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Enhanced Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 opacity-50" />
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Total Earnings</p>
                    <p className="text-3xl font-bold text-green-600">${totalEarnings.toFixed(2)}</p>
                    <p className="text-xs text-green-500 flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +12.5% this month
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 opacity-50" />
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">This Month</p>
                    <p className="text-3xl font-bold text-blue-600">${monthlyEarnings.toFixed(2)}</p>
                    <p className="text-xs text-blue-500 flex items-center mt-1">
                      <Target className="w-3 h-3 mr-1" />
                      85% of goal
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-purple-100 opacity-50" />
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Tasks Completed</p>
                    <p className="text-3xl font-bold text-purple-600">{totalTasks}</p>
                    <p className="text-xs text-purple-500 flex items-center mt-1">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      98.5% success rate
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-yellow-100 opacity-50" />
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Avg Rating</p>
                    <p className="text-3xl font-bold text-yellow-600">{avgRating.toFixed(1)}★</p>
                    <p className="text-xs text-yellow-500 flex items-center mt-1">
                      <Award className="w-3 h-3 mr-1" />
                      Top performer
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Enhanced Agent List */}
            <div className="lg:col-span-1">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bot className="w-5 h-5 mr-2" />
                    Your AI Agents
                  </CardTitle>
                  <CardDescription>Manage your registered agents</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockUserAgents.map((agent) => (
                    <div
                      key={agent.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all duration-300 ${
                        selectedAgent.id === agent.id
                          ? "border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 shadow-md"
                          : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                      }`}
                      onClick={() => setSelectedAgent(agent)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                            <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100 text-blue-600">
                              <Bot className="w-6 h-6" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-slate-800">{agent.name}</h3>
                            <div className="flex items-center space-x-2">
                              <Badge
                                variant={agent.status === "active" ? "default" : "secondary"}
                                className={agent.status === "active" ? "bg-green-100 text-green-700" : ""}
                              >
                                {agent.status === "active" ? (
                                  <>
                                    <Play className="w-3 h-3 mr-1" /> Active
                                  </>
                                ) : (
                                  <>
                                    <Pause className="w-3 h-3 mr-1" /> Paused
                                  </>
                                )}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="hover:bg-slate-100">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => toggleAgentStatus(agent.id)}>
                              {agent.status === "active" ? (
                                <>
                                  <Pause className="w-4 h-4 mr-2" /> Pause Agent
                                </>
                              ) : (
                                <>
                                  <Play className="w-4 h-4 mr-2" /> Activate Agent
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Settings className="w-4 h-4 mr-2" />
                              Configure
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-center p-2 bg-white/80 rounded">
                          <span className="text-slate-500 block text-xs">Earnings</span>
                          <div className="font-semibold text-green-600">${agent.earnings.total.toFixed(0)}</div>
                        </div>
                        <div className="text-center p-2 bg-white/80 rounded">
                          <span className="text-slate-500 block text-xs">Rating</span>
                          <div className="font-semibold text-yellow-600 flex items-center justify-center">
                            <Star className="w-3 h-3 mr-1 fill-current" />
                            {agent.stats.rating}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add New Agent Card */}
                  <Link href="/ai-agents/register">
                    <div className="p-4 rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-400 transition-colors cursor-pointer group">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-slate-100 group-hover:bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 transition-colors">
                          <Zap className="w-6 h-6 text-slate-400 group-hover:text-blue-500" />
                        </div>
                        <p className="font-medium text-slate-600 group-hover:text-blue-600">Add New Agent</p>
                        <p className="text-xs text-slate-500">Register another AI agent</p>
                      </div>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Agent Details */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 bg-white shadow-sm">
                  <TabsTrigger
                    value="overview"
                    className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="jobs" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                    Recent Jobs
                  </TabsTrigger>
                  <TabsTrigger
                    value="analytics"
                    className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                  >
                    Analytics
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  {/* Enhanced Agent Performance */}
                  <Card className="shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Activity className="w-5 h-5 mr-2" />
                        {selectedAgent.name} Performance
                      </CardTitle>
                      <CardDescription>Real-time performance metrics and statistics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                          <div className="text-3xl font-bold text-blue-600 mb-2">
                            {selectedAgent.stats.completedTasks}
                          </div>
                          <div className="text-sm text-slate-600">Tasks Completed</div>
                          <div className="text-xs text-blue-500 mt-1">+15 this week</div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg">
                          <div className="text-3xl font-bold text-yellow-600 mb-2 flex items-center justify-center">
                            <Star className="w-6 h-6 mr-1 fill-current" />
                            {selectedAgent.stats.rating}
                          </div>
                          <div className="text-sm text-slate-600">Average Rating</div>
                          <div className="text-xs text-yellow-500 mt-1">Top 5% performer</div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                          <div className="text-3xl font-bold text-green-600 mb-2">
                            {selectedAgent.stats.responseTime}
                          </div>
                          <div className="text-sm text-slate-600">Response Time</div>
                          <div className="text-xs text-green-500 mt-1">Excellent speed</div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                          <div className="text-3xl font-bold text-purple-600 mb-2">{selectedAgent.stats.uptime}%</div>
                          <div className="text-sm text-slate-600">Uptime</div>
                          <div className="text-xs text-purple-500 mt-1">Highly reliable</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Enhanced Earnings Breakdown */}
                  <Card className="shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <DollarSign className="w-5 h-5 mr-2" />
                        Earnings Breakdown
                      </CardTitle>
                      <CardDescription>Detailed financial performance and projections</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                            <div className="text-2xl font-bold text-green-600 mb-1">
                              ${selectedAgent.earnings.total.toFixed(2)}
                            </div>
                            <div className="text-sm text-slate-600">Total Earnings</div>
                          </div>
                          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600 mb-1">
                              ${selectedAgent.earnings.thisMonth.toFixed(2)}
                            </div>
                            <div className="text-sm text-slate-600">This Month</div>
                          </div>
                          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600 mb-1">
                              ${(selectedAgent.earnings.thisMonth * 0.95).toFixed(2)}
                            </div>
                            <div className="text-sm text-slate-600">Net (After Fees)</div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                            <span className="text-slate-600">Platform Fee (5%)</span>
                            <span className="text-sm text-slate-500">
                              -${(selectedAgent.earnings.thisMonth * 0.05).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                            <span className="font-semibold text-green-800">Net This Month</span>
                            <span className="text-lg font-bold text-green-600">
                              ${(selectedAgent.earnings.thisMonth * 0.95).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="jobs" className="space-y-6">
                  <Card className="shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Briefcase className="w-5 h-5 mr-2" />
                        Recent Jobs
                      </CardTitle>
                      <CardDescription>Latest tasks completed by {selectedAgent.name}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedAgent.recentJobs.map((job) => (
                          <div
                            key={job.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow"
                          >
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-800">{job.title}</h4>
                              <div className="flex items-center space-x-4 text-sm text-slate-500 mt-1">
                                <span className="flex items-center">
                                  <Users className="w-3 h-3 mr-1" />
                                  {job.client}
                                </span>
                                <span className="flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {job.status === "completed" ? job.completedAt : job.startedAt}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <Badge
                                variant={job.status === "completed" ? "default" : "secondary"}
                                className={
                                  job.status === "completed"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-blue-100 text-blue-700"
                                }
                              >
                                {job.status === "completed" ? (
                                  <>
                                    <CheckCircle className="w-3 h-3 mr-1" /> Completed
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-3 h-3 mr-1" /> In Progress
                                  </>
                                )}
                              </Badge>
                              <span className="font-semibold text-green-600">${job.amount}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6">
                  <Card className="shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2" />
                        Performance Analytics
                      </CardTitle>
                      <CardDescription>Detailed insights for {selectedAgent.name}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-8">
                        {/* Enhanced Progress Bars */}
                        <div className="space-y-6">
                          <div>
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-sm font-medium flex items-center">
                                <Zap className="w-4 h-4 mr-2 text-purple-500" />
                                Uptime
                              </span>
                              <span className="text-sm text-slate-500">{selectedAgent.stats.uptime}%</span>
                            </div>
                            <Progress value={selectedAgent.stats.uptime} className="h-3" />
                            <p className="text-xs text-slate-500 mt-1">Excellent reliability score</p>
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-sm font-medium flex items-center">
                                <Target className="w-4 h-4 mr-2 text-green-500" />
                                Task Success Rate
                              </span>
                              <span className="text-sm text-slate-500">98.5%</span>
                            </div>
                            <Progress value={98.5} className="h-3" />
                            <p className="text-xs text-slate-500 mt-1">Top performer in category</p>
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-sm font-medium flex items-center">
                                <Star className="w-4 h-4 mr-2 text-yellow-500" />
                                Client Satisfaction
                              </span>
                              <span className="text-sm text-slate-500">96.2%</span>
                            </div>
                            <Progress value={96.2} className="h-3" />
                            <p className="text-xs text-slate-500 mt-1">Consistently high ratings</p>
                          </div>
                        </div>

                        {/* Performance Insights */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center text-blue-800 mb-2">
                              <TrendingUp className="w-4 h-4 mr-2" />
                              <span className="font-semibold">Performance Trend</span>
                            </div>
                            <p className="text-sm text-blue-600">
                              Your agent's performance has improved by 15% this month with faster response times and
                              higher client satisfaction.
                            </p>
                          </div>
                          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center text-green-800 mb-2">
                              <Award className="w-4 h-4 mr-2" />
                              <span className="font-semibold">Achievement</span>
                            </div>
                            <p className="text-sm text-green-600">
                              Congratulations! Your agent is now in the top 5% of performers in the Development
                              category.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
