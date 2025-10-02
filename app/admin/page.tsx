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
    <div className="container mx-auto px-4 py-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {loading.stats ? (
              <>
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-4 w-32" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-slate-800">
                  {stats?.totalUsers.value.toLocaleString() || '0'}
                </div>
                <p className={`text-xs flex items-center mt-1 ${
                  stats?.totalUsers.isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {stats?.totalUsers.growth || 'No data'}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Active Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            {loading.stats ? (
              <>
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-4 w-32" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-slate-800">
                  {stats?.activeJobs.value.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {stats?.activeJobs.subtitle || 'No data'}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Platform TVL</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {loading.stats ? (
              <>
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-4 w-32" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-slate-800">
                  {stats?.platformTVL.value || '0 HBAR'}
                </div>
                <p className={`text-xs flex items-center mt-1 ${
                  stats?.platformTVL.isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {stats?.platformTVL.growth || 'No data'}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Active Disputes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            {loading.stats ? (
              <>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-28" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-slate-800">
                  {stats?.activeDisputes.value || '0'}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {stats?.activeDisputes.subtitle || 'No data'}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="disputes">Disputes</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="disputes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2 text-red-500" />
                Active Disputes
              </CardTitle>
              <CardDescription>Disputes requiring immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              {loading.disputes ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="border-l-4 border-l-gray-200">
                      <CardHeader>
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Skeleton className="h-5 w-16" />
                            <Skeleton className="h-5 w-20" />
                          </div>
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              ) : disputes.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Shield className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p>No active disputes found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {disputes.map((dispute, index) => (
                    <Card key={index} className="border-l-4 border-l-red-500">
                      <CardHeader>
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="font-mono text-xs">
                                {dispute.id}
                              </Badge>
                              <Badge
                                className={
                                  dispute.priority === "High"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }
                              >
                                {dispute.priority} Priority
                              </Badge>
                            </div>
                            <CardTitle className="text-lg text-slate-800">{dispute.title}</CardTitle>
                            <CardDescription className="mt-2">{dispute.description}</CardDescription>
                          </div>
                          <div className="flex flex-col md:items-end gap-2">
                            <Badge
                              variant="secondary"
                              className={
                                dispute.status === "Under Review"
                                  ? "bg-blue-100 text-blue-700"
                                  : dispute.status === "Mediation"
                                    ? "bg-purple-100 text-purple-700"
                                    : "bg-orange-100 text-orange-700"
                              }
                            >
                              {dispute.status}
                            </Badge>
                            <span className="text-lg font-semibold text-green-600">{dispute.amount}</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-slate-700">Client:</span>
                              <div className="flex items-center mt-1">
                                <Avatar className="w-6 h-6 mr-2">
                                  <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                                    {dispute.client[0]}
                                  </AvatarFallback>
                                </Avatar>
                                {dispute.client}
                              </div>
                            </div>
                            <div>
                              <span className="font-medium text-slate-700">Freelancer:</span>
                              <div className="flex items-center mt-1">
                                <Avatar className="w-6 h-6 mr-2">
                                  <AvatarFallback className="text-xs bg-green-100 text-green-600">
                                    {dispute.freelancer[0]}
                                  </AvatarFallback>
                                </Avatar>
                                {dispute.freelancer}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4 border-t border-slate-100">
                            <span className="text-sm text-slate-500">Created {dispute.created}</span>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-1" />
                                View Details
                              </Button>
                              <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
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
              {!loading.users && users.length > 0 && (
                <div className="mt-6 text-center">
                  <Button asChild variant="outline">
                    <Link href="/admin/users">
                      <Users className="w-4 h-4 mr-2" />
                      View All Users
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-500" />
                User Management
              </CardTitle>
              <CardDescription>Monitor and manage platform users</CardDescription>
            </CardHeader>
            <CardContent>
              {loading.users ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <Skeleton className="w-12 h-12 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p>No users found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {users.map((user, index) => (
                    <Card key={index} className={user.flags > 0 ? "border-l-4 border-l-yellow-500" : ""}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex items-center space-x-4">
                            <Avatar className="w-12 h-12">
                              <AvatarFallback className="bg-blue-100 text-blue-600">{user.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-semibold text-slate-800">{user.name}</h4>
                              <p className="text-sm text-slate-600">{user.email}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline">{user.type}</Badge>
                                <Badge
                                  className={
                                    user.status === "Active"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-yellow-100 text-yellow-700"
                                  }
                                >
                                  {user.status}
                                </Badge>
                                {user.flags > 0 && (
                                  <Badge className="bg-red-100 text-red-700">{user.flags} Flags</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col md:items-end gap-2">
                            <div className="text-sm text-slate-600">
                              <div>
                                <strong>{user.jobs}</strong> jobs • <strong>{user.rating}</strong>★
                              </div>
                              <div className="text-green-600 font-medium">
                                {user.type === "Freelancer" ? user.earnings : user.spent}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                              {user.status === "Under Review" && (
                                <>
                                  <Button 
                                    size="sm" 
                                    className="bg-green-500 hover:bg-green-600"
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
                                  onClick={() => handleUserAction(user.id, user.type.toLowerCase(), 'suspend')}
                                >
                                  <Ban className="w-4 h-4 mr-1" />
                                  Suspend
                                </Button>
                              )}
                              {user.status === "Suspended" && (
                                <Button 
                                  size="sm" 
                                  className="bg-green-500 hover:bg-green-600"
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
                                    className="bg-green-500 hover:bg-green-600"
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-purple-500" />
                Job Approval
              </CardTitle>
              <CardDescription>Review and approve draft jobs submitted by clients</CardDescription>
            </CardHeader>
            <CardContent>
              {loading.jobs ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex gap-2">
                            <Skeleton className="h-5 w-16" />
                            <Skeleton className="h-5 w-20" />
                          </div>
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-2/3" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Briefcase className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p>No draft jobs pending approval</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.map((job, index) => (
                    <Card key={index} className="border-l-4 border-l-orange-500">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="font-mono text-xs">
                                  {job.id}
                                </Badge>
                                <Badge className="bg-orange-100 text-orange-700">
                                  {job.status}
                                </Badge>
                                <Badge variant="secondary">{job.category}</Badge>
                                {job.urgency === 'high' && (
                                  <Badge className="bg-red-100 text-red-700">High Priority</Badge>
                                )}
                              </div>
                              <h4 className="font-semibold text-slate-800 text-lg mb-2">{job.title}</h4>
                              <p className="text-sm text-slate-600 mb-3 line-clamp-2">{job.description}</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="font-medium text-slate-700">Client:</span>
                                  <div className="flex items-center mt-1">
                                    <Avatar className="w-6 h-6 mr-2">
                                      <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
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
                                  <span className="font-medium text-slate-700">Budget:</span>
                                  <div className="text-green-600 font-semibold mt-1">{job.budget}</div>
                                </div>
                                <div>
                                  <span className="font-medium text-slate-700">Duration:</span>
                                  <div className="mt-1">{job.duration}</div>
                                </div>
                                <div>
                                  <span className="font-medium text-slate-700">Skills:</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {job.skills.slice(0, 3).map((skill, idx) => (
                                      <Badge key={idx} variant="outline" className="text-xs">
                                        {skill}
                                      </Badge>
                                    ))}
                                    {job.skills.length > 3 && (
                                      <Badge variant="outline" className="text-xs">
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
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleJobAction(job.id, 'reject')}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Reject
                                </Button>
                                <Button 
                                  size="sm" 
                                  className="bg-green-500 hover:bg-green-600"
                                  onClick={() => handleJobAction(job.id, 'approve')}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Approve
                                </Button>
                              </div>
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-green-500" />
                Payment Monitoring
              </CardTitle>
              <CardDescription>Track escrow payments and transactions</CardDescription>
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
                        className={`w-2 h-2 rounded-full ${
                          activity.type === "user"
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
