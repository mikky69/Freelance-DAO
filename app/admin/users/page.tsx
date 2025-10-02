"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Users,
  Search,
  Filter,
  Eye,
  Ban,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Mail,
  Calendar,
  Star,
  Briefcase,
} from "lucide-react"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
  verified: boolean
  suspended: boolean
  avatar?: string
  lastActive?: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [userTypeFilter, setUserTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })

  const fetchUsers = async (page = 1, search = "", type = "all", status = "all") => {
    try {
      setLoading(true)
      const token = localStorage.getItem('freelancedao_token')
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
        ...(type !== "all" && { type }),
        ...(status !== "all" && { status })
      })
      
      const response = await fetch(`/api/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
        setPagination(data.pagination)
      } else {
        toast.error('Failed to fetch users')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Error loading users')
    } finally {
      setLoading(false)
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
        // Refresh current page
        fetchUsers(pagination.page, searchTerm, userTypeFilter, statusFilter)
      } else {
        const error = await response.json()
        toast.error(error.message || `Failed to ${action} user`)
      }
    } catch (error) {
      console.error(`Error ${action}ing user:`, error)
      toast.error(`Error ${action}ing user`)
    }
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchUsers(1, value, userTypeFilter, statusFilter)
  }

  const handleTypeFilter = (value: string) => {
    setUserTypeFilter(value)
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchUsers(1, searchTerm, value, statusFilter)
  }

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value)
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchUsers(1, searchTerm, userTypeFilter, value)
  }

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
    fetchUsers(newPage, searchTerm, userTypeFilter, statusFilter)
  }

  const getStatusBadge = (user: User) => {
    if (user.suspended) {
      return <Badge variant="destructive">Suspended</Badge>
    }
    if (user.verified) {
      return <Badge className="bg-green-100 text-green-700">Active</Badge>
    }
    return <Badge className="bg-yellow-100 text-yellow-700">Pending Verification</Badge>
  }

  const getActionButtons = (user: User) => {
    if (user.suspended) {
      return (
        <Button 
          size="sm" 
          className="bg-green-500 hover:bg-green-600"
          onClick={() => handleUserAction(user.id, user.type.toLowerCase(), 'activate')}
        >
          <UserCheck className="w-4 h-4 mr-1" />
          Activate
        </Button>
      )
    }
    
    if (user.verified) {
      return (
        <Button 
          variant="destructive" 
          size="sm"
          onClick={() => handleUserAction(user.id, user.type.toLowerCase(), 'suspend')}
        >
          <Ban className="w-4 h-4 mr-1" />
          Suspend
        </Button>
      )
    }
    
    return (
      <div className="flex gap-2">
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
      </div>
    )
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">User Management</h1>
        <p className="text-slate-600">Manage and moderate platform users</p>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2 text-blue-500" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search users by name, email, or company..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={userTypeFilter} onValueChange={handleTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="User Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="freelancer">Freelancers</SelectItem>
                <SelectItem value="client">Clients</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-500" />
              Users ({pagination.total})
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-600 font-semibold">
                              {user.name?.split(" ").map((n) => n[0]).join("") || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-slate-800">{user.name}</div>
                            <div className="text-sm text-slate-500 flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {user.email}
                            </div>
                            {user.flags > 0 && (
                              <Badge variant="destructive" className="text-xs mt-1">
                                {user.flags} Flags
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {user.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(user)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center">
                            <Briefcase className="w-3 h-3 mr-1 text-slate-400" />
                            <span className="font-medium">{user.jobs}</span> jobs
                          </div>
                          <div className="flex items-center mt-1">
                            <Star className="w-3 h-3 mr-1 text-yellow-500" />
                            <span className="font-medium">{user.rating}</span> rating
                          </div>
                          {(user.earnings || user.spent) && (
                            <div className="text-green-600 font-medium text-xs mt-1">
                              {user.type === "Freelancer" ? user.earnings : user.spent}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-slate-500">
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {user.joined}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          {getActionButtons(user)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-slate-500">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <div className="flex items-center space-x-1">
                      {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                        const pageNum = Math.max(1, pagination.page - 2) + i
                        if (pageNum > pagination.pages) return null
                        return (
                          <Button
                            key={pageNum}
                            variant={pageNum === pagination.page ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            className="w-8 h-8 p-0"
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}