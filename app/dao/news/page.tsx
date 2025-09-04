"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Filter,
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  ExternalLink,
  Vote,
  Gavel,
  Coins,
  Megaphone,
  Building2,
  Users,
  CheckCircle,
  Star,
  Mail,
} from "lucide-react"

interface NewsItem {
  id: string
  title: string
  content: string
  type: "proposal" | "dispute" | "announcement" | "treasury"
  author: {
    name: string
    role: string
    avatar: string
    verified: boolean
  }
  publishedAt: string
  readTime: number
  views: number
  likes: number
  comments: number
  tags: string[]
  status?: "active" | "approved" | "rejected" | "resolved" | "under-review"
  metadata?: {
    proposalId?: string
    disputeId?: string
    amount?: string
    deadline?: string
    outcome?: string
    arbitrator?: string
  }
  featured?: boolean
  trending?: boolean
}

const mockNewsData: NewsItem[] = [
  {
    id: "1",
    title: "Proposal FLD-2024-008: Enhanced AI Agent Verification System",
    content:
      "The DAO community is voting on a comprehensive proposal to implement an enhanced verification system for AI agents. This system would include automated testing, performance benchmarks, and security audits to ensure all AI agents meet platform standards before being listed in the marketplace.",
    type: "proposal",
    author: {
      name: "Sarah Chen",
      role: "Core Developer",
      avatar: "/placeholder.svg?height=40&width=40",
      verified: true,
    },
    publishedAt: "2024-01-15T10:30:00Z",
    readTime: 4,
    views: 1247,
    likes: 89,
    comments: 23,
    tags: ["ai-agents", "verification", "security", "voting"],
    status: "active",
    metadata: {
      proposalId: "FLD-2024-008",
      amount: "50,000 FLDAO",
      deadline: "2024-01-22T23:59:59Z",
    },
    featured: true,
    trending: true,
  },
  {
    id: "2",
    title: "Dispute Resolution: DSP-2024-0089 Successfully Resolved",
    content:
      "A payment dispute between client TechCorp and freelancer Alex Rodriguez has been successfully resolved through our DAO arbitration system. The dispute involved a $5,000 smart contract development project where deliverables were questioned. After thorough review by our high-ranking arbitrators, the decision was made in favor of the freelancer with full payment release.",
    type: "dispute",
    author: {
      name: "Marcus Thompson",
      role: "Lead Arbitrator",
      avatar: "/placeholder.svg?height=40&width=40",
      verified: true,
    },
    publishedAt: "2024-01-14T16:45:00Z",
    readTime: 3,
    views: 892,
    likes: 67,
    comments: 15,
    tags: ["dispute-resolution", "arbitration", "payment", "smart-contracts"],
    status: "resolved",
    metadata: {
      disputeId: "DSP-2024-0089",
      amount: "$5,000 USDC",
      outcome: "Resolved in favor of freelancer",
      arbitrator: "Marcus Thompson",
    },
  },
  {
    id: "3",
    title: "FreeLanceDAO Reaches 10,000 Active Members Milestone",
    content:
      "We're thrilled to announce that FreeLanceDAO has officially reached 10,000 active members! This incredible milestone represents our growing community of freelancers, clients, and AI agents working together in the decentralized economy. To celebrate, we're launching a special rewards program for early adopters.",
    type: "announcement",
    author: {
      name: "Emma Wilson",
      role: "Community Manager",
      avatar: "/placeholder.svg?height=40&width=40",
      verified: true,
    },
    publishedAt: "2024-01-13T12:00:00Z",
    readTime: 2,
    views: 2156,
    likes: 234,
    comments: 78,
    tags: ["milestone", "community", "growth", "rewards"],
    status: "approved",
    featured: true,
  },
  {
    id: "4",
    title: "Q4 2023 Treasury Report: $2.4M in Total Assets",
    content:
      "Our quarterly treasury report shows strong financial health with $2.4M in total assets under management. The treasury consists of 60% stablecoins (USDC), 25% SOL, 10% FLDAO tokens, and 5% other DeFi assets. Revenue from platform fees increased by 45% compared to Q3, demonstrating sustainable growth.",
    type: "treasury",
    author: {
      name: "David Kim",
      role: "Treasury Manager",
      avatar: "/placeholder.svg?height=40&width=40",
      verified: true,
    },
    publishedAt: "2024-01-12T09:15:00Z",
    readTime: 6,
    views: 1543,
    likes: 156,
    comments: 42,
    tags: ["treasury", "financial-report", "assets", "revenue"],
    status: "approved",
  },
  {
    id: "5",
    title: "Proposal FLD-2024-007: Staking Rewards Increase - APPROVED",
    content:
      "The community has voted to approve the proposal to increase staking rewards by 2% APY across all staking pools. This change will take effect on January 20th, 2024, and will benefit all current and future stakers. The proposal passed with 78% approval rate and 89% participation.",
    type: "proposal",
    author: {
      name: "Lisa Park",
      role: "Economics Lead",
      avatar: "/placeholder.svg?height=40&width=40",
      verified: true,
    },
    publishedAt: "2024-01-11T14:20:00Z",
    readTime: 3,
    views: 1876,
    likes: 198,
    comments: 56,
    tags: ["staking", "rewards", "approved", "economics"],
    status: "approved",
    metadata: {
      proposalId: "FLD-2024-007",
      amount: "2% APY Increase",
      outcome: "Approved (78% Yes, 89% Participation)",
    },
  },
  {
    id: "6",
    title: "New Dispute Under Review: DSP-2024-0091",
    content:
      "A new dispute has been submitted regarding an AI agent performance issue. The case involves a data analysis AI agent that allegedly provided inaccurate results, leading to financial losses for the client. Our arbitration team is currently reviewing the evidence and will provide a resolution within 7 business days.",
    type: "dispute",
    author: {
      name: "Jennifer Adams",
      role: "Dispute Coordinator",
      avatar: "/placeholder.svg?height=40&width=40",
      verified: true,
    },
    publishedAt: "2024-01-10T11:30:00Z",
    readTime: 2,
    views: 654,
    likes: 34,
    comments: 12,
    tags: ["dispute", "ai-agent", "under-review", "data-analysis"],
    status: "under-review",
    metadata: {
      disputeId: "DSP-2024-0091",
      amount: "$3,200 USDC",
      arbitrator: "Review Panel",
    },
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-blue-100 text-blue-800"
    case "approved":
      return "bg-green-100 text-green-800"
    case "rejected":
      return "bg-red-100 text-red-800"
    case "resolved":
      return "bg-green-100 text-green-800"
    case "under-review":
      return "bg-yellow-100 text-yellow-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case "proposal":
      return Vote
    case "dispute":
      return Gavel
    case "treasury":
      return Coins
    case "announcement":
      return Megaphone
    default:
      return Building2
  }
}

const getTypeColor = (type: string) => {
  switch (type) {
    case "proposal":
      return "text-blue-600"
    case "dispute":
      return "text-orange-600"
    case "treasury":
      return "text-green-600"
    case "announcement":
      return "text-purple-600"
    default:
      return "text-gray-600"
  }
}

export default function DAONewsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [sortBy, setSortBy] = useState("latest")
  const [activeTab, setActiveTab] = useState("all")

  const filteredNews = useMemo(() => {
    let filtered = mockNewsData

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
          item.metadata?.proposalId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.metadata?.disputeId?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Filter by type
    if (selectedType !== "all") {
      filtered = filtered.filter((item) => item.type === selectedType)
    }

    // Filter by tab
    if (activeTab === "featured") {
      filtered = filtered.filter((item) => item.featured)
    } else if (activeTab === "trending") {
      filtered = filtered.filter((item) => item.trending)
    }

    // Sort
    switch (sortBy) {
      case "popular":
        filtered.sort((a, b) => b.likes - a.likes)
        break
      case "discussed":
        filtered.sort((a, b) => b.comments - a.comments)
        break
      default:
        filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    }

    return filtered
  }, [searchQuery, selectedType, sortBy, activeTab])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    return formatDate(dateString)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">DAO News</h1>
              <p className="text-gray-600">
                Stay updated with the latest governance activities and community announcements
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="px-3 py-1">
                <Building2 className="w-4 h-4 mr-1" />
                Public Feed
              </Badge>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Proposals</p>
                    <p className="text-2xl font-bold text-blue-600">3</p>
                  </div>
                  <Vote className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Resolution Rate</p>
                    <p className="text-2xl font-bold text-green-600">89%</p>
                  </div>
                  <Gavel className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Treasury Value</p>
                    <p className="text-2xl font-bold text-green-600">$2.4M</p>
                  </div>
                  <Coins className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Community</p>
                    <p className="text-2xl font-bold text-purple-600">10K+</p>
                  </div>
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search news, proposals, disputes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="proposal">Proposals</SelectItem>
                <SelectItem value="dispute">Disputes</SelectItem>
                <SelectItem value="announcement">Announcements</SelectItem>
                <SelectItem value="treasury">Treasury</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="discussed">Most Discussed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-3 lg:w-96">
            <TabsTrigger value="all">All News</TabsTrigger>
            <TabsTrigger value="featured">Featured</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <div className="grid gap-6">
              {filteredNews.map((item) => {
                const TypeIcon = getTypeIcon(item.type)
                return (
                  <Card key={item.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg bg-gray-100 ${getTypeColor(item.type)}`}>
                            <TypeIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <Badge variant="outline" className="capitalize mb-1">
                              {item.type}
                            </Badge>
                            {item.status && (
                              <Badge className={`ml-2 ${getStatusColor(item.status)}`}>
                                {item.status === "under-review" ? "Under Review" : item.status}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {item.featured && (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              <Star className="w-3 h-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                          {item.trending && (
                            <Badge className="bg-red-100 text-red-800">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Trending
                            </Badge>
                          )}
                        </div>
                      </div>

                      <h2 className="text-xl font-semibold text-gray-900 mb-3 hover:text-blue-600 cursor-pointer">
                        {item.title}
                      </h2>

                      <p className="text-gray-600 mb-4 line-clamp-3">{item.content}</p>

                      {/* Metadata */}
                      {item.metadata && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            {item.metadata.proposalId && (
                              <div>
                                <span className="font-medium text-gray-700">Proposal ID:</span>
                                <span className="ml-2 text-blue-600">{item.metadata.proposalId}</span>
                              </div>
                            )}
                            {item.metadata.disputeId && (
                              <div>
                                <span className="font-medium text-gray-700">Dispute ID:</span>
                                <span className="ml-2 text-orange-600">{item.metadata.disputeId}</span>
                              </div>
                            )}
                            {item.metadata.amount && (
                              <div>
                                <span className="font-medium text-gray-700">Amount:</span>
                                <span className="ml-2 text-green-600">{item.metadata.amount}</span>
                              </div>
                            )}
                            {item.metadata.deadline && (
                              <div>
                                <span className="font-medium text-gray-700">Deadline:</span>
                                <span className="ml-2 text-red-600">{formatDate(item.metadata.deadline)}</span>
                              </div>
                            )}
                            {item.metadata.outcome && (
                              <div className="md:col-span-2">
                                <span className="font-medium text-gray-700">Outcome:</span>
                                <span className="ml-2 text-green-600">{item.metadata.outcome}</span>
                              </div>
                            )}
                            {item.metadata.arbitrator && (
                              <div>
                                <span className="font-medium text-gray-700">Arbitrator:</span>
                                <span className="ml-2 text-gray-900">{item.metadata.arbitrator}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {item.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Author and Stats */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={item.author.avatar || "/placeholder.svg"} alt={item.author.name} />
                            <AvatarFallback>{item.author.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center space-x-1">
                              <span className="text-sm font-medium text-gray-900">{item.author.name}</span>
                              {item.author.verified && <CheckCircle className="w-4 h-4 text-blue-500" />}
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <span>{item.author.role}</span>
                              <span>•</span>
                              <span>{formatTimeAgo(item.publishedAt)}</span>
                              <span>•</span>
                              <span>{item.readTime} min read</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Eye className="w-4 h-4" />
                              <span>{item.views}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Heart className="w-4 h-4" />
                              <span>{item.likes}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MessageCircle className="w-4 h-4" />
                              <span>{item.comments}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Bookmark className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Share2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {filteredNews.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No news found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Newsletter Signup */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-8 text-center">
            <Mail className="w-12 h-12 mx-auto mb-4 opacity-90" />
            <h3 className="text-2xl font-bold mb-2">Stay Updated</h3>
            <p className="text-blue-100 mb-6">Get the latest DAO news and governance updates delivered to your inbox</p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                placeholder="Enter your email"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/70"
              />
              <Button variant="secondary" className="bg-white text-blue-600 hover:bg-white/90">
                Subscribe
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
