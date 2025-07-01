"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Bot,
  Search,
  Filter,
  Star,
  Clock,
  TrendingUp,
  Zap,
  Code,
  ImageIcon,
  MessageSquare,
  Handshake,
  Crown,
  Shield,
} from "lucide-react"
import { HireAgentModal } from "@/components/hire-agent-modal"
import { NegotiationModal } from "@/components/negotiation-modal"
import { RoyaltySystem } from "@/components/royalty-system"
import { useAuth } from "@/lib/auth-context"

interface AIAgent {
  id: string
  name: string
  description: string
  category: string
  basePrice: number
  pricingType: "fixed" | "usage" | "subscription"
  owner: {
    id: string
    name: string
    avatar: string
    verified: boolean
    rating: number
    responseTime: string
  }
  performance: {
    rating: number
    completionRate: number
    totalTasks: number
  }
  tags: string[]
  featured: boolean
  royaltyRate: number
}

export default function AIAgentsPage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null)
  const [isHireModalOpen, setIsHireModalOpen] = useState(false)
  const [isNegotiationModalOpen, setIsNegotiationModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("marketplace")

  const mockAgents: AIAgent[] = [
    {
      id: "1",
      name: "CodeMaster Pro",
      description:
        "Advanced AI agent specialized in full-stack development, code review, and debugging. Supports React, Node.js, Python, and more.",
      category: "Development",
      basePrice: 150,
      pricingType: "fixed",
      owner: {
        id: "owner1",
        name: "Alex Chen",
        avatar: "/images/ai-agent-avatar-1.png",
        verified: true,
        rating: 4.9,
        responseTime: "< 1 hour",
      },
      performance: {
        rating: 4.8,
        completionRate: 98,
        totalTasks: 245,
      },
      tags: ["React", "Node.js", "Python", "Full-Stack"],
      featured: true,
      royaltyRate: 15,
    },
    {
      id: "2",
      name: "ContentCraft AI",
      description:
        "Creative writing and content generation specialist. Perfect for blogs, marketing copy, and social media content.",
      category: "Content",
      basePrice: 75,
      pricingType: "usage",
      owner: {
        id: "owner2",
        name: "Sarah Johnson",
        avatar: "/images/ai-agent-avatar-2.png",
        verified: true,
        rating: 4.7,
        responseTime: "< 30 min",
      },
      performance: {
        rating: 4.6,
        completionRate: 95,
        totalTasks: 189,
      },
      tags: ["Writing", "Marketing", "SEO", "Social Media"],
      featured: true,
      royaltyRate: 12,
    },
    {
      id: "3",
      name: "DataViz Expert",
      description:
        "Specialized in data analysis, visualization, and business intelligence. Creates stunning charts and insights.",
      category: "Analytics",
      basePrice: 120,
      pricingType: "fixed",
      owner: {
        id: "owner3",
        name: "Mike Rodriguez",
        avatar: "/images/ai-agent-avatar-3.png",
        verified: false,
        rating: 4.5,
        responseTime: "< 2 hours",
      },
      performance: {
        rating: 4.4,
        completionRate: 92,
        totalTasks: 156,
      },
      tags: ["Data Analysis", "Visualization", "Python", "R"],
      featured: false,
      royaltyRate: 18,
    },
  ]

  const categories = [
    { value: "all", label: "All Categories", icon: Bot },
    { value: "Development", label: "Development", icon: Code },
    { value: "Content", label: "Content", icon: MessageSquare },
    { value: "Analytics", label: "Analytics", icon: TrendingUp },
    { value: "Design", label: "Design", icon: ImageIcon },
  ]

  const filteredAgents = mockAgents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === "all" || agent.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const featuredAgents = filteredAgents.filter((agent) => agent.featured)

  const handleHireAgent = (agent: AIAgent) => {
    setSelectedAgent(agent)
    setIsHireModalOpen(true)
  }

  const handleNegotiatePrice = (agent: AIAgent) => {
    setSelectedAgent(agent)
    setIsNegotiationModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">AI Agent Marketplace</h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Discover, hire, and negotiate with specialized AI agents. Fair pricing with built-in royalty protection
              for creators.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                <Bot className="w-5 h-5 mr-2" />
                Browse Agents
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 bg-transparent">
                <Crown className="w-5 h-5 mr-2" />
                View Royalty System
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
            <TabsTrigger value="royalties">Royalties</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="marketplace" className="space-y-8">
            {/* Search and Filters */}
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input
                      placeholder="Search AI agents, skills, or categories..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-12 text-lg"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full md:w-48 h-12">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          <div className="flex items-center">
                            <category.icon className="w-4 h-4 mr-2" />
                            {category.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button className="h-12 px-6">
                    <Filter className="w-5 h-5 mr-2" />
                    Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Featured Agents */}
            {featuredAgents.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                    <Star className="w-6 h-6 mr-2 text-yellow-500" />
                    Featured AI Agents
                  </h2>
                  <Badge className="bg-yellow-100 text-yellow-800">Premium</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredAgents.map((agent) => (
                    <Card
                      key={agent.id}
                      className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-yellow-200"
                    >
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-yellow-500 text-white">Featured</Badge>
                      </div>
                      <CardHeader className="pb-4">
                        <div className="flex items-start space-x-4">
                          <Avatar className="w-16 h-16">
                            <AvatarImage src={agent.owner.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              <Bot className="w-8 h-8" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <CardTitle className="text-xl mb-2">{agent.name}</CardTitle>
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge variant="outline">{agent.category}</Badge>
                              <Badge className="bg-purple-100 text-purple-700">{agent.royaltyRate}% Royalty</Badge>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-slate-600">
                              <div className="flex items-center">
                                <Star className="w-4 h-4 text-yellow-500 mr-1" />
                                {agent.performance.rating}
                              </div>
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {agent.owner.responseTime}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <CardDescription className="text-slate-600 line-clamp-3">{agent.description}</CardDescription>

                        <div className="flex flex-wrap gap-2">
                          {agent.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {agent.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{agent.tags.length - 3} more
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div>
                            <div className="text-2xl font-bold text-green-600">${agent.basePrice}</div>
                            <div className="text-xs text-slate-500 capitalize">{agent.pricingType} rate</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{agent.performance.completionRate}% Success</div>
                            <div className="text-xs text-slate-500">{agent.performance.totalTasks} tasks</div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={agent.owner.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{agent.owner.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-1">
                              <span className="font-medium text-sm">{agent.owner.name}</span>
                              {agent.owner.verified && <Shield className="w-4 h-4 text-green-500" />}
                            </div>
                            <div className="text-xs text-slate-500">Agent Owner</div>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleHireAgent(agent)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                          >
                            <Bot className="w-4 h-4 mr-2" />
                            Hire Now
                          </Button>
                          <Button onClick={() => handleNegotiatePrice(agent)} variant="outline" className="flex-1">
                            <Handshake className="w-4 h-4 mr-2" />
                            Negotiate
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* All Agents */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800">All AI Agents ({filteredAgents.length})</h2>
                <Select defaultValue="rating">
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAgents.map((agent) => (
                  <Card key={agent.id} className="shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="pb-4">
                      <div className="flex items-start space-x-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={agent.owner.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            <Bot className="w-8 h-8" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">{agent.name}</CardTitle>
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="outline">{agent.category}</Badge>
                            <Badge className="bg-purple-100 text-purple-700">{agent.royaltyRate}% Royalty</Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-slate-600">
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-500 mr-1" />
                              {agent.performance.rating}
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {agent.owner.responseTime}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <CardDescription className="text-slate-600 line-clamp-3">{agent.description}</CardDescription>

                      <div className="flex flex-wrap gap-2">
                        {agent.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {agent.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{agent.tags.length - 3} more
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <div className="text-2xl font-bold text-green-600">${agent.basePrice}</div>
                          <div className="text-xs text-slate-500 capitalize">{agent.pricingType} rate</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{agent.performance.completionRate}% Success</div>
                          <div className="text-xs text-slate-500">{agent.performance.totalTasks} tasks</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={agent.owner.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{agent.owner.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-1">
                            <span className="font-medium text-sm">{agent.owner.name}</span>
                            {agent.owner.verified && <Shield className="w-4 h-4 text-green-500" />}
                          </div>
                          <div className="text-xs text-slate-500">Agent Owner</div>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button onClick={() => handleHireAgent(agent)} className="flex-1 bg-blue-600 hover:bg-blue-700">
                          <Bot className="w-4 h-4 mr-2" />
                          Hire Now
                        </Button>
                        <Button onClick={() => handleNegotiatePrice(agent)} variant="outline" className="flex-1">
                          <Handshake className="w-4 h-4 mr-2" />
                          Negotiate
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="royalties">
            <RoyaltySystem userRole="creator" userId={user?.id || ""} />
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 mb-1">Total Agents</p>
                      <p className="text-3xl font-bold text-blue-600">{mockAgents.length}</p>
                    </div>
                    <Bot className="w-12 h-12 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 mb-1">Avg Rating</p>
                      <p className="text-3xl font-bold text-yellow-600">4.7</p>
                    </div>
                    <Star className="w-12 h-12 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 mb-1">Total Tasks</p>
                      <p className="text-3xl font-bold text-green-600">590</p>
                    </div>
                    <TrendingUp className="w-12 h-12 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 mb-1">Success Rate</p>
                      <p className="text-3xl font-bold text-purple-600">95%</p>
                    </div>
                    <Zap className="w-12 h-12 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <HireAgentModal
        agent={selectedAgent}
        isOpen={isHireModalOpen}
        onClose={() => {
          setIsHireModalOpen(false)
          setSelectedAgent(null)
        }}
      />

      <NegotiationModal
        agent={selectedAgent}
        isOpen={isNegotiationModalOpen}
        onClose={() => {
          setIsNegotiationModalOpen(false)
          setSelectedAgent(null)
        }}
      />
    </div>
  )
}
