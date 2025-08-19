"use client"

import { useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Briefcase,
  Plus,
  Search,
  Calendar,
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  MoreHorizontal,
  MessageSquare,
  FileText,
  Star,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Play,
  Pause,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"

const projects = [
  {
    id: 1,
    title: "E-commerce Website Development",
    description:
      "Build a modern e-commerce platform with React, Node.js, and payment integration. Need responsive design and admin dashboard.",
    budget: 3500,
    currency: "HBAR",
    status: "active",
    priority: "high",
    category: "Web Development",
    skills: ["React", "Node.js", "MongoDB", "Stripe"],
    postedDate: "2024-12-01",
    deadline: "2024-12-30",
    proposals: 12,
    hired: 1,
    freelancer: {
      name: "Sarah Chen",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 4.9,
      completedJobs: 89,
    },
    progress: 65,
    milestones: [
      { name: "Project Setup", completed: true, amount: 700 },
      { name: "Frontend Development", completed: true, amount: 1400 },
      { name: "Backend Integration", completed: false, amount: 1050 },
      { name: "Testing & Deployment", completed: false, amount: 350 },
    ],
    lastActivity: "2 hours ago",
  },
  {
    id: 2,
    title: "Mobile App UI/UX Design",
    description:
      "Design a modern mobile app interface for a fitness tracking application. Need wireframes, prototypes, and final designs.",
    budget: 2200,
    currency: "HBAR",
    status: "in_review",
    priority: "medium",
    category: "Design",
    skills: ["Figma", "UI/UX", "Mobile Design", "Prototyping"],
    postedDate: "2024-11-28",
    deadline: "2024-12-20",
    proposals: 8,
    hired: 1,
    freelancer: {
      name: "Marcus Rodriguez",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 4.8,
      completedJobs: 67,
    },
    progress: 90,
    milestones: [
      { name: "Wireframes", completed: true, amount: 550 },
      { name: "UI Design", completed: true, amount: 1100 },
      { name: "Final Assets", completed: false, amount: 550 },
    ],
    lastActivity: "1 day ago",
  },
  {
    id: 3,
    title: "Smart Contract Development",
    description:
      "Develop and audit smart contracts for a DeFi lending protocol. Need security audit and deployment on Hedera network.",
    budget: 4800,
    currency: "HBAR",
    status: "completed",
    priority: "high",
    category: "Blockchain",
    skills: ["Solidity", "Web3", "DeFi", "Security Audit"],
    postedDate: "2024-11-15",
    deadline: "2024-12-15",
    proposals: 6,
    hired: 1,
    freelancer: {
      name: "James Thompson",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 4.8,
      completedJobs: 45,
    },
    progress: 100,
    milestones: [
      { name: "Contract Development", completed: true, amount: 2400 },
      { name: "Security Audit", completed: true, amount: 1440 },
      { name: "Deployment", completed: true, amount: 960 },
    ],
    lastActivity: "3 days ago",
  },
  {
    id: 4,
    title: "Content Writing for Tech Blog",
    description:
      "Write 10 high-quality blog posts about blockchain technology, DeFi, and Web3 trends. SEO optimized content required.",
    budget: 1200,
    currency: "HBAR",
    status: "draft",
    priority: "low",
    category: "Writing",
    skills: ["Content Writing", "SEO", "Blockchain", "Technical Writing"],
    postedDate: "2024-12-05",
    deadline: "2024-12-25",
    proposals: 0,
    hired: 0,
    freelancer: null,
    progress: 0,
    milestones: [
      { name: "Research & Outline", completed: false, amount: 300 },
      { name: "First 5 Articles", completed: false, amount: 450 },
      { name: "Final 5 Articles", completed: false, amount: 450 },
    ],
    lastActivity: "5 hours ago",
  },
  {
    id: 5,
    title: "Data Analytics Dashboard",
    description:
      "Create an interactive dashboard for business analytics using Python, React, and D3.js. Real-time data visualization needed.",
    budget: 3200,
    currency: "HBAR",
    status: "paused",
    priority: "medium",
    category: "Data Science",
    skills: ["Python", "React", "D3.js", "Data Visualization"],
    postedDate: "2024-11-20",
    deadline: "2024-12-28",
    proposals: 15,
    hired: 1,
    freelancer: {
      name: "Elena Volkov",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 4.9,
      completedJobs: 28,
    },
    progress: 35,
    milestones: [
      { name: "Data Pipeline", completed: true, amount: 800 },
      { name: "Backend API", completed: false, amount: 1200 },
      { name: "Frontend Dashboard", completed: false, amount: 800 },
      { name: "Testing & Optimization", completed: false, amount: 400 },
    ],
    lastActivity: "1 week ago",
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-blue-100 text-blue-700"
    case "completed":
      return "bg-green-100 text-green-700"
    case "in_review":
      return "bg-yellow-100 text-yellow-700"
    case "paused":
      return "bg-orange-100 text-orange-700"
    case "draft":
      return "bg-gray-100 text-gray-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "active":
      return <Play className="w-4 h-4" />
    case "completed":
      return <CheckCircle className="w-4 h-4" />
    case "in_review":
      return <Eye className="w-4 h-4" />
    case "paused":
      return <Pause className="w-4 h-4" />
    case "draft":
      return <FileText className="w-4 h-4" />
    default:
      return <FileText className="w-4 h-4" />
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-700"
    case "medium":
      return "bg-yellow-100 text-yellow-700"
    case "low":
      return "bg-green-100 text-green-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

function ProjectsContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const { user } = useAuth()

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.category.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || project.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const projectStats = {
    total: projects.length,
    active: projects.filter((p) => p.status === "active").length,
    completed: projects.filter((p) => p.status === "completed").length,
    draft: projects.filter((p) => p.status === "draft").length,
    totalBudget: projects.reduce((sum, p) => sum + p.budget, 0),
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center">
                <Briefcase className="w-8 h-8 mr-3 text-blue-500" />
                My Projects
              </h1>
              <p className="text-slate-600 mt-1">Manage and track all your project activities</p>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/post-job">
                <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Projects</CardTitle>
              <Briefcase className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{projectStats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Active</CardTitle>
              <Play className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{projectStats.active}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{projectStats.completed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Draft</CardTitle>
              <FileText className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{projectStats.draft}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{projectStats.totalBudget.toLocaleString()} HBAR</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="in_review">In Review</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Projects Grid */}
        <div className="grid gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <CardTitle className="text-lg text-slate-800 hover:text-blue-600 cursor-pointer">
                        {project.title}
                      </CardTitle>
                      <Badge className={getStatusColor(project.status)}>
                        {getStatusIcon(project.status)}
                        <span className="ml-1 capitalize">{project.status.replace("_", " ")}</span>
                      </Badge>
                      <Badge className={getPriorityColor(project.priority)}>{project.priority} priority</Badge>
                    </div>
                    <CardDescription className="text-slate-600 line-clamp-2 mb-3">
                      {project.description}
                    </CardDescription>
                    <div className="flex flex-wrap gap-2">
                      {project.skills.slice(0, 4).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {project.skills.length > 4 && (
                        <Badge variant="secondary" className="text-xs">
                          +{project.skills.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end gap-2">
                    <div className="text-2xl font-bold text-green-600">
                      {project.budget.toLocaleString()} {project.currency}
                    </div>
                    <div className="text-sm text-slate-500">Budget</div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setSelectedProject(project)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Project
                        </DropdownMenuItem>
                        {project.status === "paused" && (
                          <DropdownMenuItem>
                            <Play className="w-4 h-4 mr-2" />
                            Resume Project
                          </DropdownMenuItem>
                        )}
                        {project.status === "active" && (
                          <DropdownMenuItem>
                            <Pause className="w-4 h-4 mr-2" />
                            Pause Project
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Project
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {/* Progress */}
                  {project.progress > 0 && (
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-600">Progress</span>
                        <span className="text-slate-800 font-medium">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>
                  )}

                  {/* Project Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <div>
                        <div className="text-slate-600">Deadline</div>
                        <div className="font-medium text-slate-800">
                          {new Date(project.deadline).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-green-500" />
                      <div>
                        <div className="text-slate-600">Proposals</div>
                        <div className="font-medium text-slate-800">{project.proposals}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-purple-500" />
                      <div>
                        <div className="text-slate-600">Last Activity</div>
                        <div className="font-medium text-slate-800">{project.lastActivity}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-orange-500" />
                      <div>
                        <div className="text-slate-600">Category</div>
                        <div className="font-medium text-slate-800">{project.category}</div>
                      </div>
                    </div>
                  </div>

                  {/* Freelancer Info */}
                  {project.freelancer && (
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
                            {project.freelancer.name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-slate-800">{project.freelancer.name}</div>
                          <div className="flex items-center space-x-2 text-sm text-slate-600">
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            <span>{project.freelancer.rating}</span>
                            <span>•</span>
                            <span>{project.freelancer.completedJobs} jobs</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Link href="/messages">
                          <Button variant="outline" size="sm">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Message
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm" onClick={() => setSelectedProject(project)}>
                          View Details
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-800 mb-2">No projects found</h3>
            <p className="text-slate-600 mb-6">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Get started by posting your first project"}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <Link href="/post-job">
                <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Post Your First Project
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Project Details Modal */}
      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedProject && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <DialogTitle className="text-2xl mb-2">{selectedProject.title}</DialogTitle>
                    <div className="flex items-center space-x-3 mb-4">
                      <Badge className={getStatusColor(selectedProject.status)}>
                        {getStatusIcon(selectedProject.status)}
                        <span className="ml-1 capitalize">{selectedProject.status.replace("_", " ")}</span>
                      </Badge>
                      <Badge className={getPriorityColor(selectedProject.priority)}>
                        {selectedProject.priority} priority
                      </Badge>
                      <Badge variant="outline">{selectedProject.category}</Badge>
                    </div>
                    <DialogDescription className="text-base leading-relaxed">
                      {selectedProject.description}
                    </DialogDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      {selectedProject.budget.toLocaleString()} {selectedProject.currency}
                    </div>
                    <div className="text-sm text-slate-500">Total Budget</div>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-6">
                {/* Project Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{selectedProject.progress}%</div>
                    <div className="text-sm text-slate-600">Progress</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{selectedProject.proposals}</div>
                    <div className="text-sm text-slate-600">Proposals</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{selectedProject.hired}</div>
                    <div className="text-sm text-slate-600">Hired</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{selectedProject.milestones.length}</div>
                    <div className="text-sm text-slate-600">Milestones</div>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.skills.map((skill: string, index: number) => (
                      <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Milestones */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">Project Milestones</h3>
                  <div className="space-y-3">
                    {selectedProject.milestones.map((milestone: any, index: number) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          milestone.completed ? "bg-green-50 border-green-200" : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              milestone.completed ? "bg-green-500" : "bg-slate-300"
                            }`}
                          >
                            {milestone.completed ? (
                              <CheckCircle className="w-5 h-5 text-white" />
                            ) : (
                              <span className="text-white font-semibold text-sm">{index + 1}</span>
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-800">{milestone.name}</h4>
                            <p className="text-sm text-slate-600">{milestone.completed ? "Completed" : "Pending"}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">{milestone.amount} HBAR</div>
                          <div className="text-xs text-slate-500">Payment</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Freelancer Details */}
                {selectedProject.freelancer && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-3">Assigned Freelancer</h3>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                            {selectedProject.freelancer.name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium text-slate-800">{selectedProject.freelancer.name}</h4>
                          <div className="flex items-center space-x-3 text-sm text-slate-600">
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span>{selectedProject.freelancer.rating}</span>
                            </div>
                            <span>•</span>
                            <span>{selectedProject.freelancer.completedJobs} jobs completed</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link href="/messages">
                          <Button variant="outline" size="sm">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Message
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Project Timeline */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">Timeline</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <div className="text-sm text-slate-600 mb-1">Posted Date</div>
                      <div className="font-medium text-slate-800">
                        {new Date(selectedProject.postedDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <div className="text-sm text-slate-600 mb-1">Deadline</div>
                      <div className="font-medium text-slate-800">
                        {new Date(selectedProject.deadline).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-200">
                  <Button variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Project
                  </Button>
                  {selectedProject.status === "paused" && (
                    <Button className="bg-green-500 hover:bg-green-600">
                      <Play className="w-4 h-4 mr-2" />
                      Resume Project
                    </Button>
                  )}
                  {selectedProject.status === "active" && (
                    <Button variant="outline">
                      <Pause className="w-4 h-4 mr-2" />
                      Pause Project
                    </Button>
                  )}
                  {selectedProject.freelancer && (
                    <Link href="/messages">
                      <Button className="bg-blue-500 hover:bg-blue-600">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Contact Freelancer
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function ProjectsPage() {
  return (
    <ProtectedRoute requireAuth={true} requiredRole="client" requireCompleteProfile={true}>
      <ProjectsContent />
    </ProtectedRoute>
  )
}
