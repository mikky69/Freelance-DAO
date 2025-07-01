"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import Link from "next/link"
import { PaymentSystem } from "@/components/payment-system"
import { useAuth } from "@/lib/auth-context"

function DashboardContent() {
  const { user } = useAuth()
  const [showNewProposal, setShowNewProposal] = useState(false)
  const [showViewProposal, setShowViewProposal] = useState(false)
  const [selectedProposal, setSelectedProposal] = useState<any>(null)
  const [proposalForm, setProposalForm] = useState({
    title: "",
    description: "",
    budget: "",
    timeline: "",
    milestones: "",
  })

  const proposals = [
    {
      id: "1",
      title: "E-commerce Website Development",
      client: "TechStartup Inc.",
      budget: "3,500 HBAR",
      status: "Under Review",
      submittedDate: "Dec 10, 2024",
      description: "Complete e-commerce platform with payment integration, user management, and admin dashboard.",
      timeline: "6-8 weeks",
      milestones: [
        { name: "Project Setup & Planning", amount: "700 HBAR", duration: "1 week" },
        { name: "Frontend Development", amount: "1,400 HBAR", duration: "3 weeks" },
        { name: "Backend & API Integration", amount: "1,050 HBAR", duration: "2 weeks" },
        { name: "Testing & Deployment", amount: "350 HBAR", duration: "1 week" },
      ],
    },
    {
      id: "2",
      title: "Mobile App UI Design",
      client: "DesignCorp",
      budget: "2,200 HBAR",
      status: "Accepted",
      submittedDate: "Dec 8, 2024",
      description: "Modern mobile app interface design with user-friendly navigation and responsive layouts.",
      timeline: "4 weeks",
      milestones: [
        { name: "Wireframes & User Flow", amount: "550 HBAR", duration: "1 week" },
        { name: "UI Design & Prototyping", amount: "1,100 HBAR", duration: "2 weeks" },
        { name: "Final Assets & Handoff", amount: "550 HBAR", duration: "1 week" },
      ],
    },
  ]

  const handleNewProposal = () => {
    if (!proposalForm.title || !proposalForm.description || !proposalForm.budget) {
      toast.error("Please fill in all required fields")
      return
    }

    // Simulate proposal submission
    toast.success("Proposal submitted successfully!")
    setShowNewProposal(false)
    setProposalForm({
      title: "",
      description: "",
      budget: "",
      timeline: "",
      milestones: "",
    })
  }

  const handleViewProposal = (proposal: any) => {
    setSelectedProposal(proposal)
    setShowViewProposal(true)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Dashboard</h1>
              <p className="text-slate-600">Welcome back, {user?.name}! Here's your freelance overview.</p>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/messages">
                <Button variant="outline" className="border-blue-200 text-blue-600">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Messages
                </Button>
              </Link>

              {/* New Proposal Button */}
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
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">12,450 HBAR</div>
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
              <div className="text-2xl font-bold text-slate-800">3</div>
              <p className="text-xs text-slate-500 mt-1">2 in progress, 1 pending</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Success Rate</CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">98%</div>
              <p className="text-xs text-slate-500 mt-1">47 completed jobs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Response Time</CardTitle>
              <Clock className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">2.3h</div>
              <p className="text-xs text-slate-500 mt-1">Average response time</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="active-jobs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="active-jobs">Active Jobs</TabsTrigger>
            <TabsTrigger value="proposals">Proposals</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="profile" className="hidden lg:block">
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active-jobs" className="space-y-6">
            <div className="grid gap-6">
              {[
                {
                  title: "E-commerce Website Development",
                  client: "TechStartup Inc.",
                  budget: "3,500 HBAR",
                  progress: 75,
                  status: "In Progress",
                  deadline: "Dec 15, 2024",
                  statusColor: "bg-blue-500",
                },
                {
                  title: "Mobile App UI Design",
                  client: "DesignCorp",
                  budget: "2,200 HBAR",
                  progress: 45,
                  status: "In Progress",
                  deadline: "Dec 20, 2024",
                  statusColor: "bg-blue-500",
                },
                {
                  title: "Smart Contract Audit",
                  client: "CryptoLabs",
                  budget: "4,800 HBAR",
                  progress: 0,
                  status: "Pending Start",
                  deadline: "Jan 5, 2025",
                  statusColor: "bg-yellow-500",
                },
              ].map((job, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-lg text-slate-800">{job.title}</CardTitle>
                        <CardDescription className="flex items-center mt-2">
                          <Avatar className="w-6 h-6 mr-2">
                            <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                              {job.client[0]}
                            </AvatarFallback>
                          </Avatar>
                          {job.client}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col md:items-end gap-2">
                        <Badge className={`${job.statusColor} text-white`}>{job.status}</Badge>
                        <span className="text-lg font-semibold text-green-600">{job.budget}</span>
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
                          Due: {job.deadline}
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
              ))}
            </div>
          </TabsContent>

          <TabsContent value="proposals" className="space-y-6">
            <div className="grid gap-6">
              {proposals.map((proposal, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-lg text-slate-800">{proposal.title}</CardTitle>
                        <CardDescription className="flex items-center mt-2">
                          <Avatar className="w-6 h-6 mr-2">
                            <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                              {proposal.client[0]}
                            </AvatarFallback>
                          </Avatar>
                          {proposal.client}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col md:items-end gap-2">
                        <Badge
                          variant="secondary"
                          className={
                            proposal.status === "Accepted"
                              ? "bg-green-100 text-green-700"
                              : proposal.status === "Under Review"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                          }
                        >
                          {proposal.status === "Under Review" ? (
                            <Clock className="w-4 h-4 mr-1" />
                          ) : proposal.status === "Accepted" ? (
                            <CheckCircle className="w-4 h-4 mr-1" />
                          ) : (
                            <AlertCircle className="w-4 h-4 mr-1" />
                          )}
                          <span>{proposal.status}</span>
                        </Badge>
                        <span className="text-lg font-semibold text-green-600">{proposal.budget}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <span className="text-sm text-slate-600">Submitted {proposal.submittedDate}</span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewProposal(proposal)}>
                          <FileText className="w-4 h-4 mr-1" />
                          View Proposal
                        </Button>
                        {proposal.status === "Accepted" && (
                          <PaymentSystem
                            recipientId={proposal.client}
                            recipientName={proposal.client}
                            projectTitle={proposal.title}
                            amount={Number.parseInt(proposal.budget.replace(/[^\d]/g, ""))}
                          />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="earnings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Earnings Overview</CardTitle>
                <CardDescription>Your earnings and payment history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">12,450</div>
                      <div className="text-sm text-green-700">Total HBAR Earned</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">2,300</div>
                      <div className="text-sm text-blue-700">Pending HBAR</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">47</div>
                      <div className="text-sm text-purple-700">Completed Jobs</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-slate-800">Recent Payments</h4>
                    {[
                      {
                        project: "E-commerce Website",
                        amount: "3,500 HBAR",
                        date: "Dec 10, 2024",
                        status: "Completed",
                      },
                      { project: "Logo Design", amount: "1,200 HBAR", date: "Dec 8, 2024", status: "Completed" },
                      { project: "Mobile App UI", amount: "2,800 HBAR", date: "Dec 5, 2024", status: "Completed" },
                    ].map((payment, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-slate-800">{payment.project}</div>
                          <div className="text-sm text-slate-600">{payment.date}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">{payment.amount}</div>
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            {payment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* View Proposal Modal */}
        <Dialog open={showViewProposal} onOpenChange={setShowViewProposal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Proposal Details</DialogTitle>
              <DialogDescription>Complete proposal information and project breakdown</DialogDescription>
            </DialogHeader>

            {selectedProposal && (
              <div className="space-y-6">
                {/* Proposal Header */}
                <Card>
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-xl text-slate-800">{selectedProposal.title}</CardTitle>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-slate-600">
                          <div className="flex items-center">
                            <Avatar className="w-6 h-6 mr-2">
                              <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                                {selectedProposal.client[0]}
                              </AvatarFallback>
                            </Avatar>
                            {selectedProposal.client}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            Submitted: {selectedProposal.submittedDate}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col md:items-end gap-2">
                        <Badge
                          className={
                            selectedProposal.status === "Accepted"
                              ? "bg-green-100 text-green-700"
                              : selectedProposal.status === "Under Review"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                          }
                        >
                          {selectedProposal.status}
                        </Badge>
                        <div className="text-2xl font-bold text-green-600">{selectedProposal.budget}</div>
                        <div className="text-sm text-slate-600">Total Project Value</div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Project Description */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Project Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-700 leading-relaxed">{selectedProposal.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <div className="text-sm text-slate-600 mb-1">Timeline</div>
                        <div className="font-semibold text-slate-800">{selectedProposal.timeline}</div>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <div className="text-sm text-slate-600 mb-1">Milestones</div>
                        <div className="font-semibold text-slate-800">{selectedProposal.milestones.length} phases</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Milestones Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Project Milestones</CardTitle>
                    <CardDescription>Detailed breakdown of project phases and payments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedProposal.milestones.map((milestone: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 border border-slate-200 rounded-lg"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                            </div>
                            <div>
                              <h4 className="font-medium text-slate-800">{milestone.name}</h4>
                              <p className="text-sm text-slate-600">Duration: {milestone.duration}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-green-600">{milestone.amount}</div>
                            <div className="text-xs text-slate-500">Payment</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setShowViewProposal(false)}>
                    Close
                  </Button>
                  <div className="space-x-2">
                    {selectedProposal.status === "Accepted" && (
                      <PaymentSystem
                        recipientId={selectedProposal.client}
                        recipientName={selectedProposal.client}
                        projectTitle={selectedProposal.title}
                        amount={Number.parseInt(selectedProposal.budget.replace(/[^\d]/g, ""))}
                      />
                    )}
                    <Button className="bg-blue-500 hover:bg-blue-600">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message Client
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <ProtectedRoute requireAuth={true}>
      <DashboardContent />
    </ProtectedRoute>
  )
}
