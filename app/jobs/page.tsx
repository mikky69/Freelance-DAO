"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import {
  Search,
  Filter,
  MapPin,
  Clock,
  DollarSign,
  Star,
  Bookmark,
  BookmarkCheck,
  Briefcase,
  Users,
  TrendingUp,
  AlertCircle,
} from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import { Skeleton } from "@/components/ui/skeleton"
import { ApplyJobModal } from "@/components/jobs/ApplyJobModal"

interface Job {
  _id: string
  title: string
  description: string
  budget: {
    amount: number
    currency: string
    type: "fixed" | "hourly"
  }
  duration: string
  skills: string[]
  client: {
    fullname: string
    avatar?: string
    rating?: number
    reviewCount?: number
    verified?: boolean
  }
  createdAt: string
  proposals: any[]
  category: string
  urgency: "low" | "medium" | "high"
  featured: boolean
}

// Job categories mapping
const categoryMap: { [key: string]: string } = {
  'web-dev': 'Web Development',
  'mobile-dev': 'Mobile Development', 
  'design': 'Design',
  'writing': 'Writing',
  'marketing': 'Marketing',
  'blockchain': 'Blockchain',
  'data': 'Data Science',
  'photography': 'Photography',
  'other': 'Other'
}

export default function JobsPage() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedBudgetType, setSelectedBudgetType] = useState("all")
  const [selectedUrgency, setSelectedUrgency] = useState("all")
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false)
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  })
  const [stats, setStats] = useState({
    activeClients: 0,
    totalPaid: 0,
    totalJobs: 0
  })
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [submittedProposals, setSubmittedProposals] = useState<Set<string>>(new Set())

  const categories = ["all", "Web Development", "Design", "Writing", "Marketing", "Blockchain", "Mobile Development"]
  const budgetTypes = ["all", "fixed", "hourly"]
  const urgencyLevels = ["all", "low", "medium", "high"]

  // Fetch user's submitted proposals
  const fetchUserProposals = useCallback(async () => {
    if (!user || user.role !== 'freelancer') return
    
    try {
      const token = localStorage.getItem('freelancedao_token')
      if (!token) return
      
      const response = await fetch('/api/proposals', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        const jobIds = new Set(data.proposals.map((proposal: any) => proposal.job._id || proposal.job))
        setSubmittedProposals(jobIds)
      }
    } catch (error) {
      console.error('Error fetching user proposals:', error)
    }
  }, [user])

  // Fetch platform statistics
  const fetchStats = useCallback(async () => {
    try {
      setIsLoadingStats(true)
      const response = await fetch('/api/platform/stats')
      
      if (!response.ok) {
        throw new Error('Failed to fetch stats')
      }
      
      const data = await response.json()
      setStats({
        activeClients: data.stats.totalClients || 0,
        totalPaid: data.stats.totalVolume || 0,
        totalJobs: data.stats.totalJobs || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
      // Keep default values on error
    } finally {
      setIsLoadingStats(false)
    }
  }, [])

  // Fetch jobs from API
  const fetchJobs = useCallback(async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      })
      
      if (selectedCategory !== 'all') {
        // Map display category to backend category
        const backendCategory = Object.keys(categoryMap).find(
          key => categoryMap[key] === selectedCategory
        )
        if (backendCategory) {
          params.append('category', backendCategory)
        }
      }
      
      if (selectedBudgetType !== 'all') {
        params.append('budgetType', selectedBudgetType)
      }
      
      if (selectedUrgency !== 'all') {
        params.append('urgency', selectedUrgency)
      }
      
      if (showFeaturedOnly) {
        params.append('featured', 'true')
      }
      
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim())
      }

      const response = await fetch(`/api/jobs?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch jobs')
      }
      
      const data = await response.json()
      setJobs(data.jobs || [])
      setPagination(data.pagination || {
        page: 1,
        limit: 12,
        total: 0,
        pages: 0
      })
    } catch (error) {
      console.error('Error fetching jobs:', error)
      toast.error('Failed to load jobs')
      setJobs([])
    } finally {
      setIsLoading(false)
    }
  }, [pagination.page, pagination.limit, selectedCategory, selectedBudgetType, selectedUrgency, showFeaturedOnly, searchTerm])

  useEffect(() => {
    fetchJobs()
    fetchStats()
  }, [fetchJobs, fetchStats])
  
  // Fetch stats and user proposals on component mount
  useEffect(() => {
    fetchStats()
    fetchUserProposals()
  }, [fetchStats, fetchUserProposals])
  
  // Fetch user proposals when user changes
  useEffect(() => {
    fetchUserProposals()
  }, [fetchUserProposals])
  
  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (pagination.page === 1) {
        fetchJobs()
      } else {
        setPagination(prev => ({ ...prev, page: 1 }))
      }
    }, 500)
    
    return () => clearTimeout(timeoutId)
  }, [searchTerm, fetchJobs, pagination.page])

  useEffect(() => {
    filterJobs()
  }, [jobs])

  const filterJobs = () => {
    // Since API handles most filtering, we just set the jobs directly
    // This function is kept for any additional client-side filtering if needed
    setFilteredJobs(jobs)
  }

  const toggleSaveJob = (jobId: string) => {
    const newSavedJobs = new Set(savedJobs)
    if (newSavedJobs.has(jobId)) {
      newSavedJobs.delete(jobId)
      toast.success("Job removed from saved jobs")
    } else {
      newSavedJobs.add(jobId)
      toast.success("Job saved successfully")
    }
    setSavedJobs(newSavedJobs)
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "bg-red-100 text-red-700"
      case "medium":
        return "bg-yellow-100 text-yellow-700"
      case "low":
        return "bg-green-100 text-green-700"
      default:
        return "bg-slate-100 text-slate-700"
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Find Your Next Project</h1>
          <p className="text-slate-600">Discover opportunities that match your skills and interests</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Briefcase className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-800">{filteredJobs.length}</div>
              <div className="text-sm text-slate-600">Available Jobs</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
              {isLoadingStats ? (
                <Skeleton className="h-8 w-16 mx-auto mb-2" />
              ) : (
                <div className="text-2xl font-bold text-slate-800">{stats.activeClients.toLocaleString()}</div>
              )}
              <div className="text-sm text-slate-600">Active Clients</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              {isLoadingStats ? (
                <Skeleton className="h-8 w-20 mx-auto mb-2" />
              ) : (
                <div className="text-2xl font-bold text-slate-800">
                  {stats.totalPaid.toLocaleString()} HBAR
                </div>
              )}
              <div className="text-sm text-slate-600">Total Paid</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-800">4.8</div>
              <div className="text-sm text-slate-600">Avg Rating</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div>
                  <Label htmlFor="search">Search Jobs</Label>
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      id="search"
                      placeholder="Search by title, skills..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <Label>Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category === "all" ? "All Categories" : category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Budget Type */}
                <div>
                  <Label>Budget Type</Label>
                  <Select value={selectedBudgetType} onValueChange={setSelectedBudgetType}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {budgetTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type === "all" ? "All Types" : type === "fixed" ? "Fixed Price" : "Hourly Rate"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Urgency */}
                <div>
                  <Label>Urgency</Label>
                  <Select value={selectedUrgency} onValueChange={setSelectedUrgency}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {urgencyLevels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level === "all" ? "All Levels" : level.charAt(0).toUpperCase() + level.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Featured Only */}
                <div className="flex items-center space-x-2">
                  <Checkbox id="featured" checked={showFeaturedOnly} onCheckedChange={setShowFeaturedOnly} />
                  <Label htmlFor="featured" className="text-sm">
                    Featured jobs only
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Jobs List */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {isLoading ? (
                // Loading skeleton
                <div className="space-y-6">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-6 w-3/4" />
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-4 w-2/3" />
                            </div>
                            <Skeleton className="h-8 w-8 rounded-full" />
                          </div>
                          <div className="flex gap-2">
                            <Skeleton className="h-6 w-16" />
                            <Skeleton className="h-6 w-20" />
                            <Skeleton className="h-6 w-18" />
                          </div>
                          <div className="flex justify-between items-center">
                            <Skeleton className="h-8 w-32" />
                            <Skeleton className="h-8 w-24" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredJobs.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">No jobs found</h3>
                    <p className="text-slate-600">Try adjusting your filters or search terms</p>
                  </CardContent>
                </Card>
              ) : (
                filteredJobs.map((job) => (
                  <Card
                    key={job._id}
                    className={`hover:shadow-lg transition-shadow duration-300 ${job.featured ? "ring-2 ring-blue-200" : ""}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-xl font-semibold text-slate-800 hover:text-blue-600 cursor-pointer">
                              {job.title}
                            </h3>
                            {job.featured && <Badge className="bg-blue-100 text-blue-700 text-xs">Featured</Badge>}
                            <Badge className={`text-xs ${getUrgencyColor(job.urgency)}`}>{job.urgency} priority</Badge>
                          </div>
                          <p className="text-slate-600 mb-4 line-clamp-3">{job.description}</p>

                          {/* Skills */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {job.skills.map((skill, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>

                          {/* Job Details */}
                          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                            <div className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-1" />
                              {job.budget.type === "fixed" ? `${job.budget.amount} ${job.budget.currency}` : `${job.budget.amount} ${job.budget.currency}/hr`}
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {job.duration}
                            </div>
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {job.proposals.length} proposals
                            </div>
                            <div className="flex items-center">
                              <Briefcase className="w-4 h-4 mr-1" />
                              {categoryMap[job.category] || job.category}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end space-y-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSaveJob(job._id)}
                            className="text-slate-500 hover:text-blue-600"
                          >
                            {savedJobs.has(job._id) ? (
                              <BookmarkCheck className="w-4 h-4" />
                            ) : (
                              <Bookmark className="w-4 h-4" />
                            )}
                          </Button>
                          <span className="text-xs text-slate-500">
                            {new Date(job.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Client Info */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={job.client.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{job.client.fullname[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-slate-800">{job.client.fullname}</span>
                              {job.client.verified && (
                                <Badge className="bg-green-100 text-green-700 text-xs">Verified</Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {user && user.role === 'freelancer' ? (
                          submittedProposals.has(job._id) ? (
                            <Button 
                              disabled 
                              className="bg-green-100 text-green-700 cursor-not-allowed border border-green-200"
                              title="You have already submitted a proposal for this job"
                            >
                              ✓ Submitted
                            </Button>
                          ) : (
                            <ApplyJobModal
                              job={job}
                              trigger={
                                <Button className="bg-blue-500 hover:bg-blue-600">
                                  Submit Proposal
                                </Button>
                              }
                              onSuccess={() => {
                                setSubmittedProposals(prev => new Set([...prev, job._id]))
                                fetchJobs()
                              }}
                            />
                          )
                        ) : (
                          <Button 
                            disabled 
                            className="bg-slate-300 text-slate-500 cursor-not-allowed"
                            title={!user ? "Please log in as a freelancer to submit proposals" : "Only freelancers can submit proposals"}
                          >
                            {!user ? "Login to Apply" : "Freelancers Only"}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
