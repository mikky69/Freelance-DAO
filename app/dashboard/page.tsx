"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DollarSign,
  Briefcase,
  Star,
  MessageSquare,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Send,
  FileText,
  Calendar,
  Loader2,
} from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import Link from "next/link"
import { PaymentSystem } from "@/components/payment-system"
import { useAuth } from "@/lib/auth-context"

interface DashboardStats {
  totalEarnings?: number;
  totalSpent?: number;
  activeJobs: number;
  completedJobs: number;
  successRate?: number;
  responseTime?: string;
  pendingProposals?: number;
  postedJobs?: number;
  rating: number;
  reviewCount: number;
}

interface Job {
  _id: string;
  title: string;
  client?: {
    fullname: string;
    avatar?: string;
  };
  freelancer?: {
    fullname: string;
    avatar?: string;
  };
  budget: {
    amount: number;
    currency: string;
  };
  status: string;
  progress: number;
  deadline?: string;
  milestones: {
    name: string;
    amount: number;
    completed: boolean;
  }[];
}

interface Proposal {
  _id: string;
  title: string;
  job: {
    title: string;
    client: {
      fullname: string;
      avatar?: string;
    };
  };
  budget: {
    amount: number;
    currency: string;
  };
  status: string;
  submittedAt: string;
  timeline: string;
  milestones: {
    name: string;
    amount: number;
    duration: string;
  }[];
}

function DashboardContent() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showNewProposal, setShowNewProposal] = useState(false);
  const [showViewProposal, setShowViewProposal] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [proposalForm, setProposalForm] = useState({
    jobId: "",
    title: "",
    description: "",
    budget: "",
    timeline: "",
    milestones: "",
  });

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fix: Use the correct token key that matches auth-context
        const token = localStorage.getItem('freelancedao_token');
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        };
        
        // Fetch stats
        const statsResponse = await fetch('/api/dashboard/stats', { headers });
        if (!statsResponse.ok) throw new Error('Failed to fetch stats');
        const statsData = await statsResponse.json();
        setStats(statsData.stats);
        
        // Fetch active jobs
        const jobsResponse = await fetch('/api/dashboard/jobs?status=in_progress', { headers });
        if (!jobsResponse.ok) throw new Error('Failed to fetch jobs');
        const jobsData = await jobsResponse.json();
        setJobs(jobsData.jobs);
        
        // Fetch proposals (for freelancers)
        if (user?.role === 'freelancer') {
          const proposalsResponse = await fetch('/api/dashboard/proposals', { headers });
          if (!proposalsResponse.ok) throw new Error('Failed to fetch proposals');
          const proposalsData = await proposalsResponse.json();
          setProposals(proposalsData.proposals);
        }
      } catch (err) {
        setError('Failed to load dashboard data. Please try again.');
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const handleNewProposal = async () => {
    if (!proposalForm.title || !proposalForm.description || !proposalForm.budget) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      // Fix: Use the correct token key
      const token = localStorage.getItem('freelancedao_token');
      const response = await fetch('/api/dashboard/proposals', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId: proposalForm.jobId,
          title: proposalForm.title,
          description: proposalForm.description,
          budget: {
            amount: parseFloat(proposalForm.budget),
            currency: 'HBAR',
          },
          timeline: proposalForm.timeline,
          milestones: proposalForm.milestones ? proposalForm.milestones.split(',').map(m => ({
            name: m.trim(),
            amount: 0,
            duration: '1 week',
          })) : [],
        }),
      });
      
      if (!response.ok) throw new Error('Failed to submit proposal');
      
      toast.success("Proposal submitted successfully!");
      setShowNewProposal(false);
      setProposalForm({
        jobId: "",
        title: "",
        description: "",
        budget: "",
        timeline: "",
        milestones: "",
      });
      
      // Refresh proposals
      window.location.reload();
    } catch (err) {
      toast.error("Failed to submit proposal. Please try again.");
      console.error('Error submitting proposal:', err);
    }
  };

  const handleViewProposal = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setShowViewProposal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Dashboard</h1>
              <p className="text-slate-600">Welcome back, {user?.name}! Here's your {user?.role} overview.</p>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/messages">
                <Button variant="outline" className="border-blue-200 text-blue-600">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Messages
                </Button>
              </Link>

              {user?.role === 'freelancer' && (
                <Dialog open={showNewProposal} onOpenChange={setShowNewProposal}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-500 hover:bg-blue-600">
                      <Plus className="w-4 h-4 mr-2" />
                      New Proposal
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create New Proposal</DialogTitle>
                      <DialogDescription>Submit a detailed proposal for a project opportunity</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="proposal-title">Project Title *</Label>
                          <Input
                            id="proposal-title"
                            placeholder="Enter project title"
                            value={proposalForm.title}
                            onChange={(e) => setProposalForm((prev) => ({ ...prev, title: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="proposal-budget">Budget (HBAR) *</Label>
                          <Input
                            id="proposal-budget"
                            type="number"
                            placeholder="Enter your bid"
                            value={proposalForm.budget}
                            onChange={(e) => setProposalForm((prev) => ({ ...prev, budget: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="proposal-description">Project Description *</Label>
                        <Textarea
                          id="proposal-description"
                          placeholder="Describe the project scope, deliverables, and your approach..."
                          rows={6}
                          value={proposalForm.description}
                          onChange={(e) => setProposalForm((prev) => ({ ...prev, description: e.target.value }))}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="proposal-timeline">Timeline</Label>
                          <Input
                            id="proposal-timeline"
                            placeholder="e.g., 4-6 weeks"
                            value={proposalForm.timeline}
                            onChange={(e) => setProposalForm((prev) => ({ ...prev, timeline: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="proposal-milestones">Milestones</Label>
                          <Input
                            id="proposal-milestones"
                            placeholder="Number of milestones"
                            value={proposalForm.milestones}
                            onChange={(e) => setProposalForm((prev) => ({ ...prev, milestones: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end space-x-4">
                        <Button variant="outline" onClick={() => setShowNewProposal(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleNewProposal} className="bg-blue-500 hover:bg-blue-600">
                          <Send className="w-4 h-4 mr-2" />
                          Submit Proposal
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                {user?.role === 'freelancer' ? 'Total Earnings' : 'Total Spent'}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">
                {stats?.totalEarnings || stats?.totalSpent || 0} HBAR
              </div>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Active Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{stats?.activeJobs || 0}</div>
              <p className="text-xs text-slate-500 mt-1">
                {stats?.completedJobs || 0} completed total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                {user?.role === 'freelancer' ? 'Success Rate' : 'Rating'}
              </CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">
                {user?.role === 'freelancer' ? `${stats?.successRate || 0}%` : `${stats?.rating || 0}/5`}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {stats?.reviewCount || 0} reviews
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                {user?.role === 'freelancer' ? 'Response Time' : 'Posted Jobs'}
              </CardTitle>
              <Clock className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">
                {user?.role === 'freelancer' ? stats?.responseTime || '24h' : stats?.postedJobs || 0}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {user?.role === 'freelancer' ? 'Average response time' : 'Total jobs posted'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="active-jobs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="active-jobs">Active Jobs</TabsTrigger>
            {user?.role === 'freelancer' && <TabsTrigger value="proposals">Proposals</TabsTrigger>}
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="profile" className="hidden lg:block">
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active-jobs" className="space-y-6">
            <div className="grid gap-6">
              {jobs.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Briefcase className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                    <p className="text-slate-600">No active jobs found</p>
                    <p className="text-sm text-slate-500 mt-2">
                      {user?.role === 'freelancer' 
                        ? 'Apply for jobs to see them here' 
                        : 'Post a job to get started'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                jobs.map((job) => (
                  <Card key={job._id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-lg text-slate-800">{job.title}</CardTitle>
                          <CardDescription className="flex items-center mt-2">
                            <Avatar className="w-6 h-6 mr-2">
                              <AvatarImage src={job.client?.avatar || job.freelancer?.avatar} />
                              <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                                {(job.client?.fullname || job.freelancer?.fullname)?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            {job.client?.fullname || job.freelancer?.fullname}
                          </CardDescription>
                        </div>
                        <div className="flex flex-col md:items-end gap-2">
                          <Badge className={`${
                            job.status === 'in_progress' ? 'bg-blue-500' : 
                            job.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'
                          } text-white`}>
                            {job.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                          <span className="text-lg font-semibold text-green-600">
                            {job.budget.amount} {job.budget.currency}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-600">Progress</span>
                            <span className="text-slate-800 font-medium">{job.progress}%</span>
                          </div>
                          <Progress value={job.progress} className="h-2" />
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                          <div className="flex items-center text-sm text-slate-600">
                            <Clock className="w-4 h-4 mr-1" />
                            Due: {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'No deadline'}
                          </div>
                          <div className="flex gap-2">
                            <Link href="/messages">
                              <Button variant="outline" size="sm">
                                <MessageSquare className="w-4 h-4 mr-1" />
                                Message
                              </Button>
                            </Link>
                            <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {user?.role === 'freelancer' && (
            <TabsContent value="proposals" className="space-y-6">
              <div className="grid gap-6">
                {proposals.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                      <p className="text-slate-600">No proposals found</p>
                      <p className="text-sm text-slate-500 mt-2">
                        Submit proposals to jobs to see them here
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  proposals.map((proposal) => (
                    <Card key={proposal._id} className="hover:shadow-lg transition-shadow cursor-pointer"
                          onClick={() => handleViewProposal(proposal)}>
                      <CardHeader>
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1">
                            <CardTitle className="text-lg text-slate-800">{proposal.title}</CardTitle>
                            <CardDescription className="mt-2">
                              Job: {proposal.job.title}
                            </CardDescription>
                          </div>
                          <div className="flex flex-col md:items-end gap-2">
                            <Badge className={`${
                              proposal.status === 'pending' ? 'bg-yellow-500' :
                              proposal.status === 'accepted' ? 'bg-green-500' :
                              proposal.status === 'rejected' ? 'bg-red-500' : 'bg-gray-500'
                            } text-white`}>
                              {proposal.status.replace(/\b\w/g, l => l.toUpperCase())}
                            </Badge>
                            <span className="text-lg font-semibold text-green-600">
                              {proposal.budget.amount} {proposal.budget.currency}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-slate-600">
                          <span>Submitted: {new Date(proposal.submittedAt).toLocaleDateString()}</span>
                          <span>Timeline: {proposal.timeline}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          )}

          {/* ... existing earnings and profile tabs ... */}
        </Tabs>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute requireAuth={true}>
      <DashboardContent />
    </ProtectedRoute>
  );
}
