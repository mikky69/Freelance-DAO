"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Users,
  Briefcase,
  DollarSign,
  TrendingUp,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Ban,
  UserCheck,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"

interface AdminStats {
  totalUsers: {
    value: number
    growth: string
    isPositive: boolean
  }
  activeJobs: {
    value: number
    subtitle: string
  }
  platformTVL: {
    value: string
    growth: string
    isPositive: boolean
  }
  activeDisputes: {
    value: number
    subtitle: string
  }
}

interface Dispute {
  id: string
  title: string
  client: string
  freelancer: string
  amount: string
  status: string
  priority: string
  created: string
  description: string
}

interface User {
  id: string
  name: string
  email: string
  type: string
  status: string
  joined: string
  jobs: number
  rating: number
  earnings?: string
  spent?: string
  flags: number
}

interface Job {
  id: string
  title: string
  client: string
  clientCompany: string
  budget: string
  status: string
  proposals: number
  created: string
  flagged: boolean
  category: string
  skills: string[]
  description: string
  duration: string
  urgency: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState({
    stats: true,
    disputes: true,
    users: true,
    jobs: true
  })
  const [activeTab, setActiveTab] = useState("disputes")

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('freelancedao_token')
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      } else {
        toast.error('Failed to fetch statistics')
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
      toast.error('Error loading statistics')
    } finally {
      setLoading(prev => ({ ...prev, stats: false }))
    }
  }

  const fetchDisputes = async () => {
    try {
      const token = localStorage.getItem('freelancedao_token')
      const response = await fetch('/api/admin/disputes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setDisputes(data.disputes)
      } else {
        toast.error('Failed to fetch disputes')
      }
    } catch (error) {
      console.error('Error fetching disputes:', error)
      toast.error('Error loading disputes')
    } finally {
      setLoading(prev => ({ ...prev, disputes: false }))
    }
  }

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('freelancedao_token')
      const response = await fetch('/api/admin/users?limit=5', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      } else {
        toast.error('Failed to fetch users')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Error loading users')
    } finally {
      setLoading(prev => ({ ...prev, users: false }))
    }
  }

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('freelancedao_token')
      const response = await fetch('/api/admin/jobs?status=draft&limit=10', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setJobs(data.jobs)
      } else {
        toast.error('Failed to fetch jobs')
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
      toast.error('Error loading jobs')
    } finally {
      setLoading(prev => ({ ...prev, jobs: false }))
    }
  }

  const handleJobAction = async (jobId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      const token = localStorage.getItem('freelancedao_token')
      const response = await fetch('/api/admin/jobs', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ jobId, action, reason })
      })

      if (response.ok) {
        toast.success(`Job ${action}d successfully`)
        // Refresh jobs list
        fetchJobs()
      } else {
        toast.error(`Failed to ${action} job`)
      }
    } catch (error) {
      console.error(`Error ${action}ing job:`, error)
      toast.error(`Error ${action}ing job`)
    }
  }

  const handleUserAction = async (userId: string, userType: string, action: 'verify' | 'suspend' | 'activate') => {
    try {
      const token = localStorage.getItem('freelancedao_token')
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, userType, action })
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(data.message)
        // Refresh users list
        fetchUsers()
      } else {
        const error = await response.json()
        toast.error(error.message || `Failed to ${action} user`)
      }
    } catch (error) {
      console.error(`Error ${action}ing user:`, error)
      toast.error(`Error ${action}ing user`)
    }
  }

  useEffect(() => {
    fetchStats()
    fetchDisputes()
    fetchUsers()
    fetchJobs()
  }, [])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="text-slate-400">Welcome back, Admin</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-white hover:bg-[#1e293b]">
            <Bell className="w-5 h-5" />
            <Badge className="absolute top-2 right-2 w-2 h-2 p-0 bg-red-500 rounded-full" />
          </Button>
          <Avatar className="h-10 w-10 border-2 border-cyan-500/20">
            <AvatarFallback className="bg-cyan-500 text-white">A</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-[#1e293b] border-none shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-50 text-slate-600">
            {/* Decorative background element if needed */}
          </div>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-xl bg-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Users className="w-6 h-6 text-white" />
              </div>
              {stats?.totalUsers.isPositive && (
                <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +{stats.totalUsers.growth}
                </div>
              )}
            </div>
            <h3 className="text-slate-400 text-sm font-medium mb-1">Total Users</h3>
            <div className="text-4xl font-bold text-white tracking-tight">
              {loading.stats ? <Skeleton className="h-10 w-32 bg-slate-700" /> : stats?.totalUsers.value.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1e293b] border-none shadow-lg relative overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-xl bg-pink-500 flex items-center justify-center shadow-lg shadow-pink-500/20">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              {/* Mocking growth for Active Jobs if not in API, or using generic */}
              <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +5.2%
              </div>
            </div>
            <h3 className="text-slate-400 text-sm font-medium mb-1">Active Jobs</h3>
            <div className="text-4xl font-bold text-white tracking-tight">
              {loading.stats ? <Skeleton className="h-10 w-32 bg-slate-700" /> : stats?.activeJobs.value.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        {/* Additional Cards (Optional, keeping 2 rows if needed or just sticking to the design request for top 2) 
            For completeness, let's keep the others but styled similarly 
        */}
        <Card className="bg-[#1e293b] border-none shadow-lg">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {stats?.platformTVL.growth}
              </div>
            </div>
            <h3 className="text-slate-400 text-sm font-medium mb-1">Platform TVL</h3>
            <div className="text-4xl font-bold text-white tracking-tight">
              {loading.stats ? <Skeleton className="h-10 w-32 bg-slate-700" /> : stats?.platformTVL.value}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1e293b] border-none shadow-lg">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/20">
                <Shield className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-slate-400 text-sm font-medium mb-1">Active Disputes</h3>
            <div className="text-4xl font-bold text-white tracking-tight">
              {loading.stats ? <Skeleton className="h-10 w-32 bg-slate-700" /> : stats?.activeDisputes.value}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <div className="-mx-2 sm:mx-0 overflow-x-auto">
          <TabsList className="inline-flex min-w-max gap-2 px-2 bg-[#1e293b] text-slate-400">
            <TabsTrigger value="disputes" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white">Disputes</TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white">Users</TabsTrigger>
            <TabsTrigger value="jobs" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white">Jobs</TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white">Payments</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white">Analytics</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="disputes" className="space-y-6">
          <Card className="bg-[#1e293b] border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Shield className="w-5 h-5 mr-2 text-red-500" />
                Active Disputes
              </CardTitle>
              <CardDescription className="text-slate-400">Disputes requiring immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              {loading.disputes ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="border-l-4 border-l-slate-700 bg-[#0B0E14] border-none">
                      <CardHeader>
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Skeleton className="h-5 w-16 bg-slate-700" />
                            <Skeleton className="h-5 w-20 bg-slate-700" />
                          </div>
                          <Skeleton className="h-6 w-3/4 bg-slate-700" />
                          <Skeleton className="h-4 w-full bg-slate-700" />
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              ) : disputes.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Shield className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                  <p>No active disputes found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {disputes.map((dispute, index) => (
                    <Card key={index} className="border-l-4 border-l-red-500 bg-[#0B0E14] border-t-0 border-r-0 border-b-0">
                      <CardHeader>
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="font-mono text-xs border-slate-700 text-slate-400">
                                {dispute.id}
                              </Badge>
                              <Badge
                                className={
                                  dispute.priority === "High"
                                    ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                    : "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                                }
                              >
                                {dispute.priority} Priority
                              </Badge>
                            </div>
                            <CardTitle className="text-lg text-white">{dispute.title}</CardTitle>
                            <CardDescription className="mt-2 text-slate-400">{dispute.description}</CardDescription>
                          </div>
                          <div className="flex flex-col md:items-end gap-2">
                            <Badge
                              variant="secondary"
                              className={
                                dispute.status === "Under Review"
                                  ? "bg-blue-500/20 text-blue-400"
                                  : dispute.status === "Mediation"
                                    ? "bg-purple-500/20 text-purple-400"
                                    : "bg-orange-500/20 text-orange-400"
                              }
                            >
                              {dispute.status}
                            </Badge>
                            <span className="text-lg font-semibold text-emerald-400">{dispute.amount}</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-slate-400">Client:</span>
                              <div className="flex items-center mt-1 text-slate-300">
                                <Avatar className="w-6 h-6 mr-2">
                                  <AvatarFallback className="text-xs bg-blue-500/20 text-blue-400">
                                    {dispute.client[0]}
                                  </AvatarFallback>
                                </Avatar>
                                {dispute.client}
                              </div>
                            </div>
                            <div>
                              <span className="font-medium text-slate-400">Freelancer:</span>
                              <div className="flex items-center mt-1 text-slate-300">
                                <Avatar className="w-6 h-6 mr-2">
                                  <AvatarFallback className="text-xs bg-emerald-500/20 text-emerald-400">
                                    {dispute.freelancer[0]}
                                  </AvatarFallback>
                                </Avatar>
                                {dispute.freelancer}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4 border-t border-slate-800">
                            <span className="text-sm text-slate-500">Created {dispute.created}</span>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                                <Eye className="w-4 h-4 mr-1" />
                                View Details
                              </Button>
                              <Button size="sm" className="bg-cyan-500 hover:bg-cyan-600 text-white border-none">
                                Take Action
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              {/* Optional View All Button */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card className="bg-[#1e293b] border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Users className="w-5 h-5 mr-2 text-blue-500" />
                User Management
              </CardTitle>
              <CardDescription className="text-slate-400">Monitor and manage platform users</CardDescription>
            </CardHeader>
            <CardContent>
              {loading.users ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="bg-[#0B0E14] border-none">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <Skeleton className="w-12 h-12 rounded-full bg-slate-700" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32 bg-slate-700" />
                            <Skeleton className="h-3 w-24 bg-slate-700" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                  <p>No users found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {users.map((user, index) => (
                    <Card key={index} className={`bg-[#0B0E14] border-none ${user.flags > 0 ? "border-l-4 border-l-yellow-500" : ""}`}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex items-center space-x-4">
                            <Avatar className="w-12 h-12">
                              <AvatarFallback className="bg-blue-500/20 text-blue-400">{user.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-semibold text-white">{user.name}</h4>
                              <p className="text-sm text-slate-400">{user.email}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="border-slate-700 text-slate-400">{user.type}</Badge>
                                <Badge
                                  className={
                                    user.status === "Active"
                                      ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                                      : "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                                  }
                                >
                                  {user.status}
                                </Badge>
                                {user.flags > 0 && (
                                  <Badge className="bg-red-500/20 text-red-400 hover:bg-red-500/30">{user.flags} Flags</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col md:items-end gap-2">
                            <div className="text-sm text-slate-400">
                              <div>
                                <strong className="text-white">{user.jobs}</strong> jobs • <strong className="text-white">{user.rating}</strong>★
                              </div>
                              <div className="text-emerald-400 font-medium">
                                {user.type === "Freelancer" ? user.earnings : user.spent}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                              {user.status === "Under Review" && (
                                <>
                                  <Button
                                    size="sm"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white border-none"
                                    onClick={() => handleUserAction(user.id, user.type.toLowerCase(), 'verify')}
                                  >
                                    <UserCheck className="w-4 h-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleUserAction(user.id, user.type.toLowerCase(), 'suspend')}
                                  >
                                    <Ban className="w-4 h-4 mr-1" />
                                    Suspend
                                  </Button>
                                </>
                              )}
                              {user.status === "Active" && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="bg-red-500/20 text-red-400 hover:bg-red-500/40 border-none"
                                  onClick={() => handleUserAction(user.id, user.type.toLowerCase(), 'suspend')}
                                >
                                  <Ban className="w-4 h-4 mr-1" />
                                  Suspend
                                </Button>
                              )}
                              {user.status === "Suspended" && (
                                <Button
                                  size="sm"
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white border-none"
                                  onClick={() => handleUserAction(user.id, user.type.toLowerCase(), 'activate')}
                                >
                                  <UserCheck className="w-4 h-4 mr-1" />
                                  Activate
                                </Button>
                              )}
                              {user.status === "Pending Verification" && (
                                <>
                                  <Button
                                    size="sm"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white border-none"
                                    onClick={() => handleUserAction(user.id, user.type.toLowerCase(), 'verify')}
                                  >
                                    <UserCheck className="w-4 h-4 mr-1" />
                                    Verify
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleUserAction(user.id, user.type.toLowerCase(), 'suspend')}
                                  >
                                    <Ban className="w-4 h-4 mr-1" />
                                    Suspend
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-6">
          <Card className="bg-[#1e293b] border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Briefcase className="w-5 h-5 mr-2 text-purple-500" />
                Job Approval
              </CardTitle>
              <CardDescription className="text-slate-400">Review and approve draft jobs submitted by clients</CardDescription>
            </CardHeader>
            <CardContent>
              {loading.jobs ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="bg-[#0B0E14] border-none">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex gap-2">
                            <Skeleton className="h-5 w-16 bg-slate-700" />
                            <Skeleton className="h-5 w-20 bg-slate-700" />
                          </div>
                          <Skeleton className="h-6 w-3/4 bg-slate-700" />
                          <Skeleton className="h-4 w-full bg-slate-700" />
                          <Skeleton className="h-4 w-2/3 bg-slate-700" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Briefcase className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                  <p>No draft jobs pending approval</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.map((job, index) => (
                    <Card key={index} className="bg-[#0B0E14] border-none border-l-4 border-l-orange-500">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="font-mono text-xs border-slate-700 text-slate-400">
                                  {job.id}
                                </Badge>
                                <Badge className="bg-orange-500/20 text-orange-400">
                                  {job.status}
                                </Badge>
                                <Badge variant="secondary" className="bg-slate-800 text-slate-300">{job.category}</Badge>
                                {job.urgency === 'high' && (
                                  <Badge className="bg-red-500/20 text-red-400 hover:bg-red-500/30">High Priority</Badge>
                                )}
                              </div>
                              <h4 className="font-semibold text-white text-lg mb-2">{job.title}</h4>
                              <p className="text-sm text-slate-400 mb-3 line-clamp-2">{job.description}</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="font-medium text-slate-400">Client:</span>
                                  <div className="flex items-center mt-1 text-slate-300">
                                    <Avatar className="w-6 h-6 mr-2">
                                      <AvatarFallback className="text-xs bg-blue-500/20 text-blue-400">
                                        {job.client[0]}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div>{job.client}</div>
                                      {job.clientCompany && (
                                        <div className="text-xs text-slate-500">{job.clientCompany}</div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <span className="font-medium text-slate-400">Budget:</span>
                                  <div className="text-emerald-400 font-semibold mt-1">{job.budget}</div>
                                </div>
                                <div>
                                  <span className="font-medium text-slate-400">Duration:</span>
                                  <div className="mt-1 text-slate-300">{job.duration}</div>
                                </div>
                                <div>
                                  <span className="font-medium text-slate-400">Skills:</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {job.skills.slice(0, 3).map((skill, idx) => (
                                      <Badge key={idx} variant="outline" className="text-xs border-slate-700 text-slate-400">
                                        {skill}
                                      </Badge>
                                    ))}
                                    {job.skills.length > 3 && (
                                      <Badge variant="outline" className="text-xs border-slate-700 text-slate-400">
                                        +{job.skills.length - 3} more
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              <div className="text-sm text-slate-500 text-right">
                                Posted {job.created}
                              </div>
                              {job.status.toLowerCase() === 'draft' && (
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                                    onClick={() => handleJobAction(job.id, 'reject')}
                                  >
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Reject
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white border-none"
                                    onClick={() => handleJobAction(job.id, 'approve')}
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Approve
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card className="bg-[#1e293b] border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <DollarSign className="w-5 h-5 mr-2 text-green-500" />
                Payment Monitoring
              </CardTitle>
              <CardDescription className="text-slate-400">Track escrow payments and transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-center py-8 text-slate-500">Payment monitoring data will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Growth</CardTitle>
                <CardDescription>User registration and activity trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">New Users (30 days)</span>
                    <span className="text-2xl font-bold text-blue-600">1,247</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Active Users (7 days)</span>
                    <span className="text-2xl font-bold text-green-600">8,934</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Jobs Posted (30 days)</span>
                    <span className="text-2xl font-bold text-purple-600">456</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Success Rate</span>
                    <span className="text-2xl font-bold text-orange-600">94.2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Overview</CardTitle>
                <CardDescription>Platform revenue and transaction volume</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Volume (30 days)</span>
                    <span className="text-2xl font-bold text-green-600">245K HBAR</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Platform Fees</span>
                    <span className="text-2xl font-bold text-blue-600">12.3K HBAR</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Avg. Job Value</span>
                    <span className="text-2xl font-bold text-purple-600">2,847 HBAR</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Dispute Rate</span>
                    <span className="text-2xl font-bold text-red-600">2.1%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest platform events and actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    action: "New user registration",
                    user: "Alex Developer",
                    time: "2 minutes ago",
                    type: "user",
                  },
                  {
                    action: "Job completed",
                    user: "React Development Project",
                    time: "15 minutes ago",
                    type: "job",
                  },
                  {
                    action: "Dispute resolved",
                    user: "Payment dispute #DSP-004",
                    time: "1 hour ago",
                    type: "dispute",
                  },
                  {
                    action: "Large payment processed",
                    user: "8,500 HBAR escrow release",
                    time: "2 hours ago",
                    type: "payment",
                  },
                  {
                    action: "User verification completed",
                    user: "TechCorp Industries",
                    time: "3 hours ago",
                    type: "verification",
                  },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-2 h-2 rounded-full ${activity.type === "user"
                          ? "bg-blue-500"
                          : activity.type === "job"
                            ? "bg-green-500"
                            : activity.type === "dispute"
                              ? "bg-red-500"
                              : activity.type === "payment"
                                ? "bg-purple-500"
                                : "bg-orange-500"
                          }`}
                      />
                      <div>
                        <p className="text-sm font-medium text-slate-800">{activity.action}</p>
                        <p className="text-xs text-slate-600">{activity.user}</p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-500">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
