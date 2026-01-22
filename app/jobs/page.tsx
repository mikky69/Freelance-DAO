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
import { useState, useEffect } from "react"
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
  const fetchUserProposals = async () => {
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
  }

  // Fetch platform statistics
  const fetchStats = async () => {
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
  }

  // Fetch jobs from API
  const fetchJobs = async () => {
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
  }

  useEffect(() => {
    fetchJobs()
    fetchStats()
  }, [pagination.page, selectedCategory, selectedBudgetType, selectedUrgency, showFeaturedOnly])

  // Fetch stats and user proposals on component mount
  useEffect(() => {
    fetchStats()
    fetchUserProposals()
  }, [])

  // Fetch user proposals when user changes
  useEffect(() => {
    fetchUserProposals()
  }, [user])

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
  }, [searchTerm])

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
        return "bg-[#FF068D]/20 text-[#FF068D] border border-[#FF068D]/50"
      case "medium":
        return "bg-[#FA5F04]/20 text-[#FA5F04] border border-[#FA5F04]/50"
      case "low":
        return "bg-[#AE16A7]/20 text-[#AE16A7] border border-[#AE16A7]/50"
      default:
        return "bg-slate-800 text-slate-400 border border-slate-700"
    }
  }

  return (
    <div className="min-h-screen bg-[#1D0225] text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Find Your Next Project</h1>
          <p className="text-slate-400">Discover opportunities that match your skills and interests</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-[#2A0632] border-[#AE16A7]/30">
            <CardContent className="p-4 text-center">
              <Briefcase className="w-8 h-8 text-[#AE16A7] mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{filteredJobs.length}</div>
              <div className="text-sm text-slate-400">Available Jobs</div>
            </CardContent>
          </Card>
          <Card className="bg-[#2A0632] border-[#AE16A7]/30">
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-[#FA5F04] mx-auto mb-2" />
              {isLoadingStats ? (
                <Skeleton className="h-8 w-16 mx-auto mb-2 bg-slate-700" />
              ) : (
                <div className="text-2xl font-bold text-white">{stats.activeClients.toLocaleString()}</div>
              )}
              <div className="text-sm text-slate-400">Active Clients</div>
            </CardContent>
          </Card>
          <Card className="bg-[#2A0632] border-[#AE16A7]/30">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 text-[#FF068D] mx-auto mb-2" />
              {isLoadingStats ? (
                <Skeleton className="h-8 w-20 mx-auto mb-2 bg-slate-700" />
              ) : (
                <div className="text-2xl font-bold text-white">
                  {stats.totalPaid.toLocaleString()} HBAR
                </div>
              )}
              <div className="text-sm text-slate-400">Total Paid</div>
            </CardContent>
          </Card>
          <Card className="bg-[#2A0632] border-[#AE16A7]/30">
            <CardContent className="p-4 text-center">
              <Star className="w-8 h-8 text-[#FA5F04] mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">4.8</div>
              <div className="text-sm text-slate-400">Avg Rating</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 bg-[#2A0632] border-[#AE16A7]/30 text-white">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Filter className="w-5 h-5 mr-2" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div>
                  <Label htmlFor="search" className="text-slate-300">Search Jobs</Label>
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      id="search"
                      placeholder="Search by title, skills..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-[#1D0225] border-[#AE16A7]/30 text-white placeholder:text-slate-500 focus:border-[#AE16A7]"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <Label className="text-slate-300">Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="mt-1 bg-[#1D0225] border-[#AE16A7]/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#2A0632] border-[#AE16A7]/30 text-white">
                      {categories.map((category) => (
                        <SelectItem key={category} value={category} className="focus:bg-[#AE16A7]/20 focus:text-white">
                          {category === "all" ? "All Categories" : category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Budget Type */}
                <div>
                  <Label className="text-slate-300">Budget Type</Label>
                  <Select value={selectedBudgetType} onValueChange={setSelectedBudgetType}>
                    <SelectTrigger className="mt-1 bg-[#1D0225] border-[#AE16A7]/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#2A0632] border-[#AE16A7]/30 text-white">
                      {budgetTypes.map((type) => (
                        <SelectItem key={type} value={type} className="focus:bg-[#AE16A7]/20 focus:text-white">
                          {type === "all" ? "All Types" : type === "fixed" ? "Fixed Price" : "Hourly Rate"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Urgency */}
                <div>
                  <Label className="text-slate-300">Urgency</Label>
                  <Select value={selectedUrgency} onValueChange={setSelectedUrgency}>
                    <SelectTrigger className="mt-1 bg-[#1D0225] border-[#AE16A7]/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#2A0632] border-[#AE16A7]/30 text-white">
                      {urgencyLevels.map((level) => (
                        <SelectItem key={level} value={level} className="focus:bg-[#AE16A7]/20 focus:text-white">
                          {level === "all" ? "All Levels" : level.charAt(0).toUpperCase() + level.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Featured Only */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured"
                    checked={showFeaturedOnly}
                    onCheckedChange={setShowFeaturedOnly}
                    className="border-[#AE16A7]/50 data-[state=checked]:bg-[#AE16A7] data-[state=checked]:text-white"
                  />
                  <Label htmlFor="featured" className="text-sm text-slate-300">
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
                    <Card key={i} className="bg-[#2A0632] border-[#AE16A7]/30">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-6 w-3/4 bg-slate-700" />
                              <Skeleton className="h-4 w-full bg-slate-700" />
                              <Skeleton className="h-4 w-2/3 bg-slate-700" />
                            </div>
                            <Skeleton className="h-8 w-8 rounded-full bg-slate-700" />
                          </div>
                          <div className="flex gap-2">
                            <Skeleton className="h-6 w-16 bg-slate-700" />
                            <Skeleton className="h-6 w-20 bg-slate-700" />
                            <Skeleton className="h-6 w-18 bg-slate-700" />
                          </div>
                          <div className="flex justify-between items-center">
                            <Skeleton className="h-8 w-32 bg-slate-700" />
                            <Skeleton className="h-8 w-24 bg-slate-700" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredJobs.length === 0 ? (
                <Card className="bg-[#2A0632] border-[#AE16A7]/30">
                  <CardContent className="p-12 text-center">
                    <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No jobs found</h3>
                    <p className="text-slate-400">Try adjusting your filters or search terms</p>
                  </CardContent>
                </Card>
              ) : (
                filteredJobs.map((job) => (
                  <Card
                    key={job._id}
                    className={`hover:shadow-lg transition-shadow duration-300 bg-[#2A0632] border-[#AE16A7]/30 ${job.featured ? "ring-2 ring-[#AE16A7]" : ""
                      }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-xl font-semibold text-white hover:text-[#AE16A7] cursor-pointer transition-colors">
                              {job.title}
                            </h3>
                            {job.featured && <Badge className="bg-[#AE16A7]/20 text-[#AE16A7] border border-[#AE16A7]/50 text-xs">Featured</Badge>}
                            <Badge className={`text-xs ${getUrgencyColor(job.urgency)}`}>{job.urgency} priority</Badge>
                          </div>
                          <p className="text-slate-300 mb-4 line-clamp-3">{job.description}</p>

                          {/* Skills */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {job.skills.map((skill, index) => (
                              <Badge key={index} variant="outline" className="text-xs border-[#AE16A7]/30 text-slate-300">
                                {skill}
                              </Badge>
                            ))}
                          </div>

                          {/* Job Details */}
                          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                            <div className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-1 text-[#FA5F04]" />
                              {job.budget.type === "fixed" ? `${job.budget.amount} ${job.budget.currency}` : `${job.budget.amount} ${job.budget.currency}/hr`}
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1 text-[#AE16A7]" />
                              {job.duration}
                            </div>
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-1 text-[#FF068D]" />
                              {job.proposals.length} proposals
                            </div>
                            <div className="flex items-center">
                              <Briefcase className="w-4 h-4 mr-1 text-[#FA5F04]" />
                              {categoryMap[job.category] || job.category}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end space-y-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSaveJob(job._id)}
                            className="text-slate-400 hover:text-[#AE16A7] hover:bg-[#AE16A7]/10"
                          >
                            {savedJobs.has(job._id) ? (
                              <BookmarkCheck className="w-4 h-4 text-[#AE16A7]" />
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
                      <div className="flex items-center justify-between pt-4 border-t border-[#AE16A7]/20">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8 ring-2 ring-[#AE16A7]/30">
                            <AvatarImage src={job.client.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="bg-[#AE16A7] text-white">{job.client.fullname[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-white">{job.client.fullname}</span>
                              {job.client.verified && (
                                <Badge className="bg-[#FA5F04]/20 text-[#FA5F04] border border-[#FA5F04]/50 text-xs">Verified</Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {user && user.role === 'freelancer' ? (
                          submittedProposals.has(job._id) ? (
                            <Button
                              disabled
                              className="bg-green-900/20 text-green-500 cursor-not-allowed border border-green-900/50"
                              title="You have already submitted a proposal for this job"
                            >
                              ✓ Submitted
                            </Button>
                          ) : (
                            <ApplyJobModal
                              job={job}
                              trigger={
                                <Button className="bg-gradient-to-r from-[#AE16A7] to-[#FF068D] hover:from-[#AE16A7]/80 hover:to-[#FF068D]/80 text-white border-0">
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
                            className="bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
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
