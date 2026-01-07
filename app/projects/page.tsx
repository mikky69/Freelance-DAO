"use client"

import { useState, useEffect, useCallback } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
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
  Loader2,
  X,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

// Types
interface Project {
  id: string;
  title: string;
  description: string;
  budget: number;
  currency: string;
  status: string;
  priority: string;
  category: string;
  skills: string[];
  postedDate: string;
  deadline?: string;
  proposals: number;
  hired: number;
  freelancer?: {
    name: string;
    avatar?: string;
    rating: number;
    completedJobs: number;
  } | null;
  progress: number;
  milestones: any[];
  lastActivity: string;
  client?: {
    name: string;
    avatar?: string;
    rating: number;
    verified: boolean;
  } | null;
}

interface ProjectStats {
  total: number;
  active: number;
  completed: number;
  draft: number;
  totalBudget: number;
}

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

// Edit Project Form Component
interface EditProjectFormProps {
  project: Project;
  onClose: () => void;
  onUpdate: () => void;
}

function EditProjectForm({ project, onClose, onUpdate }: EditProjectFormProps) {
  const [formData, setFormData] = useState({
    title: project.title,
    description: project.description,
    category: project.category,
    skills: project.skills,
    budgetMin: project.budget.toString(),
    budgetMax: '',
    duration: '',
    featured: project.status === 'featured',
    urgent: project.priority === 'high'
  })
  const [newSkill, setNewSkill] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }))
      setNewSkill('')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const token = localStorage.getItem('freelancedao_token')
      if (!token) {
        toast.error('Please log in to edit projects')
        return
      }

      const response = await fetch('/api/jobs', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          jobId: project.id,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          skills: formData.skills,
          budgetMin: parseFloat(formData.budgetMin),
          budgetMax: formData.budgetMax ? parseFloat(formData.budgetMax) : null,
          duration: formData.duration,
          featured: formData.featured,
          urgent: formData.urgent
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Project updated successfully')
        onUpdate()
      } else {
        toast.error(data.message || 'Failed to update project')
      }
    } catch (error) {
      console.error('Error updating project:', error)
      toast.error('An error occurred while updating the project')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="edit-title">Job Title *</Label>
        <Input
          id="edit-title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="e.g. Build a responsive website for my startup"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-description">Project Description *</Label>
        <Textarea
          id="edit-description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe your project in detail..."
          className="min-h-32"
          required
        />
        <p className="text-sm text-slate-500">
          Minimum 100 characters. ({formData.description.length}/100)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-category">Category *</Label>
        <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="web-development">Web Development</SelectItem>
            <SelectItem value="mobile-development">Mobile Development</SelectItem>
            <SelectItem value="design">Design & Creative</SelectItem>
            <SelectItem value="writing">Writing & Content</SelectItem>
            <SelectItem value="marketing">Marketing & Sales</SelectItem>
            <SelectItem value="blockchain">Blockchain & Web3</SelectItem>
            <SelectItem value="data">Data & Analytics</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <Label>Required Skills</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Add a skill (e.g. React, Design, Writing)"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
            className="flex-1"
          />
          <Button type="button" onClick={addSkill} variant="outline">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {formData.skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.skills.map((skill, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {skill}
                <button type="button" onClick={() => removeSkill(skill)} className="ml-1 hover:text-red-500">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-budget-min">Minimum Budget (HBAR) *</Label>
          <Input
            id="edit-budget-min"
            type="number"
            value={formData.budgetMin}
            onChange={(e) => setFormData(prev => ({ ...prev, budgetMin: e.target.value }))}
            placeholder="1000"
            required
            min="1"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-budget-max">Maximum Budget (HBAR)</Label>
          <Input
            id="edit-budget-max"
            type="number"
            value={formData.budgetMax}
            onChange={(e) => setFormData(prev => ({ ...prev, budgetMax: e.target.value }))}
            placeholder="5000"
            min="1"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="edit-featured"
            checked={formData.featured}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: !!checked }))}
          />
          <Label htmlFor="edit-featured">Featured (+100 HBAR)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="edit-urgent"
            checked={formData.urgent}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, urgent: !!checked }))}
          />
          <Label htmlFor="edit-urgent">Mark as urgent</Label>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-6">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Updating...
            </>
          ) : (
            'Update Project'
          )}
        </Button>
      </div>
    </form>
  )
}

function ProjectsContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [deletingProject, setDeletingProject] = useState<Project | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [projectStats, setProjectStats] = useState<ProjectStats>({
    total: 0,
    active: 0,
    completed: 0,
    draft: 0,
    totalBudget: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })
  const { user } = useAuth()

  // Fetch projects from API
  const fetchProjects = useCallback(async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      const token = localStorage.getItem('freelancedao_token')
      if (!token) {
        toast.error('Please log in to view projects')
        return
      }

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim())
      }

      const response = await fetch(`/api/projects?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch projects')
      }

      const data = await response.json()
      setProjects(data.projects || [])
      setProjectStats(data.stats || {
        total: 0,
        active: 0,
        completed: 0,
        draft: 0,
        totalBudget: 0,
      })
      setPagination(data.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
      })
    } catch (error) {
      console.error('Error fetching projects:', error)
      toast.error('Failed to load projects')
    } finally {
      setIsLoading(false)
    }
  }, [user, pagination.page, pagination.limit, statusFilter, searchQuery])

  // Load projects on component mount and when filters change
  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])
  
  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (user) {
        fetchProjects()
      }
    }, 500) // 500ms debounce
    
    return () => clearTimeout(timeoutId)
  }, [searchQuery, user, fetchProjects])

  // Delete project function
  const deleteProject = async (projectId: string) => {
    setIsDeleting(true)
    try {
      const token = localStorage.getItem('freelancedao_token')
      if (!token) {
        toast.error('Please log in to delete projects')
        return
      }

      const response = await fetch('/api/jobs', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ jobId: projectId })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Project deleted successfully')
        setDeletingProject(null)
        // Refresh the projects list
        fetchProjects()
      } else {
        toast.error(data.message || 'Failed to delete project')
      }
    } catch (error) {
      console.error('Error deleting project:', error)
      toast.error('An error occurred while deleting the project')
    } finally {
      setIsDeleting(false)
    }
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
          {isLoading ? (
            // Loading skeletons for stats
            Array.from({ length: 5 }).map((_, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
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
            </>
          )}
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
          {isLoading ? (
            // Loading skeletons for projects
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Skeleton className="h-6 w-64" />
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-20" />
                      </div>
                      <Skeleton className="h-4 w-full mb-3" />
                      <Skeleton className="h-4 w-3/4 mb-3" />
                      <div className="flex flex-wrap gap-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <Skeleton key={i} className="h-6 w-16" />
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col md:items-end gap-2">
                      <Skeleton className="h-8 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Skeleton className="h-2 w-full" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center space-x-2">
                          <Skeleton className="h-4 w-4" />
                          <div>
                            <Skeleton className="h-3 w-16 mb-1" />
                            <Skeleton className="h-4 w-12" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : projects.length === 0 ? (
            // Empty state
            <Card className="text-center py-12">
              <CardContent>
                <Briefcase className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">
                  {searchQuery || statusFilter !== 'all' ? 'No projects found' : 'No projects yet'}
                </h3>
                <p className="text-slate-500 mb-6">
                  {searchQuery || statusFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : user?.role === 'client'
                    ? 'Start by posting your first project'
                    : 'No projects assigned to you yet'}
                </p>
                {user?.role === 'client' && (
                  <Link href="/post-job">
                    <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Post Your First Project
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            projects.map((project) => (
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
                          {user?.role === 'client' && (
                            <DropdownMenuItem onClick={() => setEditingProject(project)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Project
                            </DropdownMenuItem>
                          )}
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
                          {user?.role === 'client' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => setDeletingProject(project)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Project
                              </DropdownMenuItem>
                            </>
                          )}
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
                            {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'Not set'}
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
                          <div className="font-medium text-slate-800">
                            {new Date(project.lastActivity).toLocaleDateString()}
                          </div>
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
            ))
          )}
        </div>
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
                {/* Contact Freelancer */}
                {selectedProject.freelancer && (
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {selectedProject.freelancer.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-slate-800">{selectedProject.freelancer.name}</div>
                        <div className="flex items-center space-x-2 text-sm text-slate-600">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span>{selectedProject.freelancer.rating}</span>
                          <span>•</span>
                          <span>{selectedProject.freelancer.completedJobs} completed jobs</span>
                        </div>
                      </div>
                    </div>
                    <Link href="/messages">
                      <Button className="bg-blue-500 hover:bg-blue-600">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Contact Freelancer
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingProject} onOpenChange={() => setDeletingProject(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingProject?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-6">
            <Button 
              variant="outline" 
              onClick={() => setDeletingProject(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deletingProject && deleteProject(deletingProject.id)}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Project'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={!!editingProject} onOpenChange={() => setEditingProject(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update your project details below.
            </DialogDescription>
          </DialogHeader>
          {editingProject && (
            <EditProjectForm 
              project={editingProject} 
              onClose={() => setEditingProject(null)}
              onUpdate={() => {
                setEditingProject(null)
                fetchProjects()
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function ProjectsPage() {
  return (
    <ProtectedRoute requireAuth={true} requireCompleteProfile={true}>
      <ProjectsContent />
    </ProtectedRoute>
  )
}
