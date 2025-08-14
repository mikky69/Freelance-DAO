"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
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
  Send,
  Briefcase,
  Users,
  TrendingUp,
  AlertCircle,
} from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"

interface Job {
  id: string
  title: string
  description: string
  budget: string
  budgetType: "fixed" | "hourly"
  duration: string
  skills: string[]
  client: {
    name: string
    avatar: string
    rating: number
    reviewCount: number
    location: string
    verified: boolean
  }
  postedAt: string
  proposals: number
  category: string
  urgency: "low" | "medium" | "high"
  featured: boolean
}

const mockJobs: Job[] = [
  {
    id: "1",
    title: "Full-Stack Web Application Development",
    description:
      "Looking for an experienced full-stack developer to build a modern web application using React, Node.js, and PostgreSQL. The project includes user authentication, real-time features, and payment integration.",
    budget: "2500-5000",
    budgetType: "fixed",
    duration: "2-3 months",
    skills: ["React", "Node.js", "PostgreSQL", "TypeScript", "AWS"],
    client: {
      name: "TechCorp Solutions",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 4.8,
      reviewCount: 23,
      location: "San Francisco, CA",
      verified: true,
    },
    postedAt: "2 hours ago",
    proposals: 12,
    category: "Web Development",
    urgency: "high",
    featured: true,
  },
  {
    id: "2",
    title: "Mobile App UI/UX Design",
    description:
      "Need a talented designer to create modern, user-friendly interfaces for our mobile application. Experience with Figma and mobile design patterns required.",
    budget: "50-75",
    budgetType: "hourly",
    duration: "1 month",
    skills: ["UI/UX Design", "Figma", "Mobile Design", "Prototyping"],
    client: {
      name: "StartupXYZ",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 4.6,
      reviewCount: 15,
      location: "New York, NY",
      verified: true,
    },
    postedAt: "5 hours ago",
    proposals: 8,
    category: "Design",
    urgency: "medium",
    featured: false,
  },
  {
    id: "3",
    title: "Content Writing for Tech Blog",
    description:
      "Seeking experienced tech writers to create engaging blog posts about emerging technologies, AI, and software development trends.",
    budget: "25-40",
    budgetType: "hourly",
    duration: "Ongoing",
    skills: ["Content Writing", "Technical Writing", "SEO", "Research"],
    client: {
      name: "Digital Media Co",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 4.9,
      reviewCount: 31,
      location: "Remote",
      verified: true,
    },
    postedAt: "1 day ago",
    proposals: 25,
    category: "Writing",
    urgency: "low",
    featured: false,
  },
  {
    id: "4",
    title: "Smart Contract Development on Hedera",
    description:
      "Looking for a blockchain developer experienced with Hedera Hashgraph to develop and deploy smart contracts for our DeFi platform.",
    budget: "3000-8000",
    budgetType: "fixed",
    duration: "1-2 months",
    skills: ["Solidity", "Hedera", "Smart Contracts", "DeFi", "Web3"],
    client: {
      name: "CryptoFinance Ltd",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 4.7,
      reviewCount: 18,
      location: "London, UK",
      verified: true,
    },
    postedAt: "3 hours ago",
    proposals: 6,
    category: "Blockchain",
    urgency: "high",
    featured: true,
  },
  {
    id: "5",
    title: "Digital Marketing Campaign Management",
    description:
      "Need a digital marketing expert to manage our social media campaigns, create content, and optimize our online presence across multiple platforms.",
    budget: "1500-3000",
    budgetType: "fixed",
    duration: "3 months",
    skills: ["Digital Marketing", "Social Media", "Content Creation", "Analytics"],
    client: {
      name: "E-commerce Plus",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 4.5,
      reviewCount: 12,
      location: "Austin, TX",
      verified: false,
    },
    postedAt: "6 hours ago",
    proposals: 18,
    category: "Marketing",
    urgency: "medium",
    featured: false,
  },
]

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>(mockJobs)
  const [filteredJobs, setFilteredJobs] = useState<Job[]>(mockJobs)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedBudgetType, setSelectedBudgetType] = useState("all")
  const [selectedUrgency, setSelectedUrgency] = useState("all")
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false)
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set())
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [proposalText, setProposalText] = useState("")
  const [proposalBudget, setProposalBudget] = useState("")
  const [proposalTimeline, setProposalTimeline] = useState("")
  const [isSubmittingProposal, setIsSubmittingProposal] = useState(false)

  const categories = ["all", "Web Development", "Design", "Writing", "Marketing", "Blockchain", "Mobile Development"]
  const budgetTypes = ["all", "fixed", "hourly"]
  const urgencyLevels = ["all", "low", "medium", "high"]

  useEffect(() => {
    filterJobs()
  }, [searchTerm, selectedCategory, selectedBudgetType, selectedUrgency, showFeaturedOnly, jobs])

  const filterJobs = () => {
    let filtered = jobs

    if (searchTerm) {
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((job) => job.category === selectedCategory)
    }

    if (selectedBudgetType !== "all") {
      filtered = filtered.filter((job) => job.budgetType === selectedBudgetType)
    }

    if (selectedUrgency !== "all") {
      filtered = filtered.filter((job) => job.urgency === selectedUrgency)
    }

    if (showFeaturedOnly) {
      filtered = filtered.filter((job) => job.featured)
    }

    setFilteredJobs(filtered)
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

  const submitProposal = async () => {
    if (!selectedJob || !proposalText || !proposalBudget) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmittingProposal(true)

    // Simulate API call
    setTimeout(() => {
      toast.success("Proposal submitted successfully!")
      setSelectedJob(null)
      setProposalText("")
      setProposalBudget("")
      setProposalTimeline("")
      setIsSubmittingProposal(false)

      // Update job proposals count
      setJobs((prevJobs) =>
        prevJobs.map((job) => (job.id === selectedJob.id ? { ...job, proposals: job.proposals + 1 } : job)),
      )
    }, 2000)
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
              <div className="text-2xl font-bold text-slate-800">1,234</div>
              <div className="text-sm text-slate-600">Active Clients</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-800">$2.5M</div>
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
              {filteredJobs.length === 0 ? (
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
                    key={job.id}
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
                              {job.budgetType === "fixed" ? `$${job.budget}` : `$${job.budget}/hr`}
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {job.duration}
                            </div>
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {job.proposals} proposals
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end space-y-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSaveJob(job.id)}
                            className="text-slate-500 hover:text-blue-600"
                          >
                            {savedJobs.has(job.id) ? (
                              <BookmarkCheck className="w-4 h-4" />
                            ) : (
                              <Bookmark className="w-4 h-4" />
                            )}
                          </Button>
                          <span className="text-xs text-slate-500">{job.postedAt}</span>
                        </div>
                      </div>

                      {/* Client Info */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={job.client.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{job.client.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-slate-800">{job.client.name}</span>
                              {job.client.verified && (
                                <Badge className="bg-green-100 text-green-700 text-xs">Verified</Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-slate-600">
                              <div className="flex items-center">
                                <Star className="w-3 h-3 text-yellow-500 mr-1" />
                                {job.client.rating} ({job.client.reviewCount} reviews)
                              </div>
                              <span>•</span>
                              <div className="flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {job.client.location}
                              </div>
                            </div>
                          </div>
                        </div>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button onClick={() => setSelectedJob(job)} className="bg-blue-500 hover:bg-blue-600">
                              Submit Proposal
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Submit Proposal</DialogTitle>
                              <DialogDescription>Submit your proposal for "{selectedJob?.title}"</DialogDescription>
                            </DialogHeader>

                            <div className="space-y-6">
                              {/* Job Summary */}
                              {selectedJob && (
                                <div className="bg-slate-50 p-4 rounded-lg">
                                  <h4 className="font-medium text-slate-800 mb-2">{selectedJob.title}</h4>
                                  <div className="flex items-center space-x-4 text-sm text-slate-600">
                                    <span>Budget: ${selectedJob.budget}</span>
                                    <span>Duration: {selectedJob.duration}</span>
                                    <span>{selectedJob.proposals} proposals</span>
                                  </div>
                                </div>
                              )}

                              {/* Proposal Form */}
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="proposal">Cover Letter *</Label>
                                  <Textarea
                                    id="proposal"
                                    placeholder="Explain why you're the best fit for this project..."
                                    value={proposalText}
                                    onChange={(e) => setProposalText(e.target.value)}
                                    rows={6}
                                    className="mt-1"
                                  />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="budget">Your Bid (HBAR) *</Label>
                                    <Input
                                      id="budget"
                                      type="number"
                                      placeholder="Enter your bid"
                                      value={proposalBudget}
                                      onChange={(e) => setProposalBudget(e.target.value)}
                                      className="mt-1"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="timeline">Delivery Timeline</Label>
                                    <Input
                                      id="timeline"
                                      placeholder="e.g., 2 weeks"
                                      value={proposalTimeline}
                                      onChange={(e) => setProposalTimeline(e.target.value)}
                                      className="mt-1"
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="flex justify-end space-x-4">
                                <Button variant="outline" onClick={() => setSelectedJob(null)}>
                                  Cancel
                                </Button>
                                <Button
                                  onClick={submitProposal}
                                  disabled={isSubmittingProposal || !proposalText || !proposalBudget}
                                  className="bg-blue-500 hover:bg-blue-600"
                                >
                                  {isSubmittingProposal ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                      Submitting...
                                    </>
                                  ) : (
                                    <>
                                      <Send className="w-4 h-4 mr-2" />
                                      Submit Proposal
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
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
