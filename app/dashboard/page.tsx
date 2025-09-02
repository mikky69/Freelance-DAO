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
  Download,
  Eye,
} from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import Link from "next/link"
import { PaymentSystem } from "@/components/payment-system"
import { useAuth } from "@/lib/auth-context"
import { generateContractPDF } from "@/lib/pdf-generator"

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
  description: string;
  job: {
    _id: string;
    title: string;
    client: {
      fullname: string;
      avatar?: string;
    };
  };
  freelancer?: {
    fullname: string;
    avatar?: string;
    rating?: number;
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
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [downloadingContract, setDownloadingContract] = useState(false);

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
        
        // Fetch proposals (for both freelancers and clients)
        if (user?.role === 'freelancer' || user?.role === 'client') {
          const proposalsResponse = await fetch('/api/proposals', { headers });
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

  // Separate function to fetch proposals
  const fetchProposals = async () => {
    try {
      const token = localStorage.getItem('freelancedao_token');
      if (!token) return;
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      
      if (user?.role === 'freelancer' || user?.role === 'client') {
        const proposalsResponse = await fetch('/api/proposals', { headers });
        if (proposalsResponse.ok) {
          const proposalsData = await proposalsResponse.json();
          setProposals(proposalsData.proposals);
        }
      }
    } catch (error) {
      console.error('Error fetching proposals:', error);
    }
  };

  // Separate function to fetch jobs
  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('freelancedao_token');
      if (!token) return;
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      
      const jobsResponse = await fetch('/api/dashboard/jobs?status=in_progress', { headers });
      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json();
        setJobs(jobsData.jobs);
      }
    } catch (error) {
       console.error('Error fetching jobs:', error);
     }
   };

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

  const handleProposalAction = async (proposalId: string, action: 'accepted' | 'rejected') => {
    try {
      const token = localStorage.getItem('freelancedao_token');
      if (!token) {
        toast.error('Please log in to manage proposals');
        return;
      }

      const response = await fetch(`/api/proposals/${proposalId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update proposal');
      }

      const data = await response.json();
      
      if (action === 'accepted') {
        // Create contract automatically
        const contractResponse = await fetch('/api/contracts', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ proposalId })
        });
        
        if (!contractResponse.ok) {
          const contractError = await contractResponse.json();
          throw new Error(contractError.message || 'Failed to create contract');
        }
        
        const contractData = await contractResponse.json();
        toast.success('Proposal accepted and contract created!');
        
        // Redirect to contract page
        window.location.href = `/contracts/${contractData.contractId}`;
        return;
      }
      
      toast.success(`Proposal ${action} successfully!`);
      
      // Refresh proposals and jobs to show updated status
      fetchProposals();
      fetchJobs();
    } catch (error) {
      console.error('Error updating proposal:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update proposal');
    }
  };
  
  const handleViewJobDetails = (job: Job) => {
    setSelectedJob(job)
    setShowJobDetails(true)
  }
  
  const handleDownloadContract = async (jobId: string) => {
    setDownloadingContract(true)
    try {
      const token = localStorage.getItem('freelancedao_token')
      if (!token) {
        toast.error('Please log in to download contract')
        return
      }
      
      // Find contract for this job
      const contractResponse = await fetch(`/api/contracts?jobId=${jobId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (!contractResponse.ok) {
        throw new Error('Contract not found')
      }
      
      const contractData = await contractResponse.json()
      const contract = contractData.contracts[0]
      
      if (!contract) {
        toast.error('No contract found for this job')
        return
      }
      
      // Generate and download contract PDF
      await generateContractPDF(contract)
      
      toast.success('Contract downloaded successfully!')
    } catch (error) {
      console.error('Error downloading contract:', error)
      toast.error('Failed to download contract')
    } finally {
      setDownloadingContract(false)
    }
  }

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
            {user?.role === 'freelancer' && <TabsTrigger value="proposals">My Proposals</TabsTrigger>}
            {user?.role === 'client' && <TabsTrigger value="proposals">Job Proposals</TabsTrigger>}
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
                            <Button 
                              size="sm" 
                              className="bg-blue-500 hover:bg-blue-600"
                              onClick={() => handleViewJobDetails(job)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
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
                        {user?.role === 'freelancer' 
                          ? 'Submit proposals to jobs to see them here'
                          : 'No proposals have been submitted to your jobs yet'
                        }
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  proposals.map((proposal) => (
                    <Card key={proposal._id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1">
                            <CardTitle className="text-lg text-slate-800">{proposal.title}</CardTitle>
                            <CardDescription className="mt-2">
                              {user?.role === 'freelancer' ? `Job: ${proposal.job.title}` : `Freelancer: ${proposal.freelancer?.fullname}`}
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
                        <div className="mb-4">
                          <p className="text-slate-700 text-sm leading-relaxed mb-3">
                            {proposal.description || 'No description available'}
                          </p>
                          <div className="flex items-center justify-between text-sm text-slate-600">
                            <span>Submitted: {new Date(proposal.submittedAt).toLocaleDateString()}</span>
                            <span>Timeline: {proposal.timeline}</span>
                          </div>
                        </div>
                        
                        {user?.role === 'client' && proposal.status === 'pending' && (
                          <div className="flex gap-2 pt-4 border-t">
                            <Button 
                              onClick={() => handleProposalAction(proposal._id, 'accepted')}
                              className="bg-green-500 hover:bg-green-600 text-white flex-1"
                            >
                              Accept Proposal
                            </Button>
                            <Button 
                              onClick={() => handleProposalAction(proposal._id, 'rejected')}
                              variant="outline" 
                              className="border-red-500 text-red-500 hover:bg-red-50 flex-1"
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                        
                        {user?.role === 'freelancer' && (
                          <Button 
                            onClick={() => handleViewProposal(proposal)}
                            variant="outline" 
                            className="w-full mt-4"
                          >
                            View Details
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          )}

          {user?.role === 'client' && (
            <TabsContent value="proposals" className="space-y-6">
              <div className="grid gap-6">
                {proposals.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                      <p className="text-slate-600">No proposals found</p>
                      <p className="text-sm text-slate-500 mt-2">
                        No proposals have been submitted to your jobs yet
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  proposals.map((proposal) => (
                    <Card key={proposal._id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1">
                            <CardTitle className="text-lg text-slate-800">{proposal.job.title}</CardTitle>
                            <CardDescription className="mt-2">
                              Freelancer: {proposal.freelancer?.fullname}
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
                        <div className="mb-4">
                          <p className="text-slate-700 text-sm leading-relaxed mb-3">
                            {proposal.description || 'No description available'}
                          </p>
                          <div className="flex items-center justify-between text-sm text-slate-600">
                            <span>Submitted: {new Date(proposal.submittedAt).toLocaleDateString()}</span>
                            <span>Timeline: {proposal.timeline}</span>
                          </div>
                        </div>
                        
                        {proposal.milestones && proposal.milestones.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-slate-700 mb-2">Proposed Milestones:</h4>
                            <div className="space-y-2">
                              {proposal.milestones.map((milestone, index) => (
                                <div key={index} className="flex justify-between items-center text-sm bg-slate-50 p-2 rounded">
                                  <span>{milestone.name}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-slate-600">{milestone.duration}</span>
                                    <span className="font-medium">{milestone.amount} {proposal.budget.currency}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {proposal.status === 'pending' && (
                          <div className="flex gap-2 pt-4 border-t">
                            <Button 
                              onClick={() => handleProposalAction(proposal._id, 'accepted')}
                              className="bg-green-500 hover:bg-green-600 text-white flex-1"
                            >
                              Accept Proposal
                            </Button>
                            <Button 
                              onClick={() => handleProposalAction(proposal._id, 'rejected')}
                              variant="outline" 
                              className="border-red-500 text-red-500 hover:bg-red-50 flex-1"
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                        
                        {proposal.status !== 'pending' && (
                          <Button 
                            onClick={() => handleViewProposal(proposal)}
                            variant="outline" 
                            className="w-full mt-4"
                          >
                            View Details
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          )}

          {/* ... existing earnings and profile tabs ... */}
        </Tabs>
        
        {/* Job Details Modal */}
        <Dialog open={showJobDetails} onOpenChange={setShowJobDetails}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Job Details
              </DialogTitle>
              <DialogDescription>
                Complete information about this job and contract
              </DialogDescription>
            </DialogHeader>
            
            {selectedJob && (
              <div className="space-y-6">
                {/* Job Overview */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">{selectedJob.title}</CardTitle>
                      <CardDescription>
                        {user?.role === 'client' ? `Freelancer: ${selectedJob.freelancer?.fullname}` : `Client: ${selectedJob.client?.fullname}`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Budget:</span>
                        <span className="font-semibold text-green-600">
                          {selectedJob.budget.amount} {selectedJob.budget.currency}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Status:</span>
                        <Badge className={`${
                          selectedJob.status === 'in_progress' ? 'bg-blue-500' : 
                          selectedJob.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'
                        } text-white`}>
                          {selectedJob.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Progress:</span>
                        <span className="font-medium">{selectedJob.progress}%</span>
                      </div>
                      {selectedJob.deadline && (
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Deadline:</span>
                          <span className="font-medium">
                            {new Date(selectedJob.deadline).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Progress Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Overall Progress</span>
                            <span>{selectedJob.progress}%</span>
                          </div>
                          <Progress value={selectedJob.progress} className="h-2" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="text-center p-3 bg-blue-50 rounded">
                            <div className="font-semibold text-blue-600">
                              {selectedJob.milestones.filter(m => m.completed).length}
                            </div>
                            <div className="text-slate-600">Completed</div>
                          </div>
                          <div className="text-center p-3 bg-slate-50 rounded">
                            <div className="font-semibold text-slate-600">
                              {selectedJob.milestones.length - selectedJob.milestones.filter(m => m.completed).length}
                            </div>
                            <div className="text-slate-600">Remaining</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Milestones */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Project Milestones</CardTitle>
                    <CardDescription>Track progress and payments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedJob.milestones.map((milestone, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {milestone.completed ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <Clock className="w-5 h-5 text-slate-400" />
                            )}
                            <div>
                              <h4 className="font-medium text-slate-800">{milestone.name}</h4>
                              <p className="text-sm text-slate-500">
                                {milestone.completed ? 'Completed' : 'In Progress'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600">
                              {milestone.amount} {selectedJob.budget.currency}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    onClick={() => handleDownloadContract(selectedJob._id)}
                    disabled={downloadingContract}
                    className="flex-1"
                  >
                    {downloadingContract ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    {downloadingContract ? 'Downloading...' : 'Download Contract'}
                  </Button>
                  
                  <Link href={`/contracts/${selectedJob._id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      <FileText className="w-4 h-4 mr-2" />
                      View Contract
                    </Button>
                  </Link>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setShowJobDetails(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute 
      requireAuth={true}
      requireCompleteProfile={true}
    >
      <DashboardContent />
    </ProtectedRoute>
  );
}
