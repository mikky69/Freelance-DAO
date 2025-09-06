"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Gavel,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Users,
  FileText,
  MessageSquare,
  ExternalLink,
  Upload,
  X,
  Shield,
  Scale,
  Eye,
  DollarSign,
  Calendar,
  User,
  Bot,
  Building2,
  Award,
  AlertCircle,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

export default function DisputesPage() {
  const { user, isAuthenticated, isWalletConnected } = useAuth()
  const [selectedTab, setSelectedTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  // Form state
  const [disputeForm, setDisputeForm] = useState({
    title: "",
    client: "",
    freelancer: "",
    aiAgent: "",
    category: "",
    amount: "",
    description: "",
  })

  // Mock dispute data
  const disputes = [
    {
      id: "DSP-2024-001",
      title: "Payment not released after project completion",
      category: "Payment",
      status: "Under Investigation",
      priority: "High",
      amount: 2500,
      submittedBy: "Sarah Chen",
      submittedDate: "2024-01-20",
      parties: {
        client: "TechCorp Inc.",
        freelancer: "Sarah Chen",
        aiAgent: null,
      },
      arbitrators: [
        { name: "Dr. Michael Rodriguez", avatar: "/placeholder.svg", reputation: 98 },
        { name: "Lisa Thompson", avatar: "/placeholder.svg", reputation: 95 },
        { name: "James Wilson", avatar: "/placeholder.svg", reputation: 92 },
      ],
      evidence: {
        files: 3,
        messages: 12,
      },
      blockchainTx: "5KJp7z8X9mN2qR4vW1sT3uY6bH8cD9eF2gA5iL7oP3mQ1nR8vX4",
      description: "Project was completed according to specifications but client refuses to release escrow payment.",
    },
    {
      id: "DSP-2024-002",
      title: "AI Agent delivered subpar code quality",
      category: "Quality",
      status: "Resolved",
      priority: "Medium",
      amount: 1200,
      submittedBy: "Marcus Johnson",
      submittedDate: "2024-01-18",
      parties: {
        client: "Marcus Johnson",
        freelancer: null,
        aiAgent: "CodeMaster AI",
      },
      arbitrators: [
        { name: "Dr. Emily Zhang", avatar: "/placeholder.svg", reputation: 97 },
        { name: "Robert Kim", avatar: "/placeholder.svg", reputation: 94 },
      ],
      evidence: {
        files: 5,
        messages: 8,
      },
      blockchainTx: "8mN2qR4vW1sT3uY6bH8cD9eF2gA5iL7oP3mQ1nR8vX4z5KJp7",
      description:
        "AI agent provided code that failed basic testing requirements and contained security vulnerabilities.",
      resolution: "Partial refund of 60% issued to client. AI agent performance rating adjusted.",
    },
    {
      id: "DSP-2024-003",
      title: "Scope creep without additional compensation",
      category: "Scope",
      status: "In Mediation",
      priority: "Medium",
      amount: 3200,
      submittedBy: "Alex Rivera",
      submittedDate: "2024-01-22",
      parties: {
        client: "StartupXYZ",
        freelancer: "Alex Rivera",
        aiAgent: null,
      },
      arbitrators: [
        { name: "Dr. Michael Rodriguez", avatar: "/placeholder.svg", reputation: 98 },
        { name: "Sarah Mitchell", avatar: "/placeholder.svg", reputation: 96 },
      ],
      evidence: {
        files: 7,
        messages: 25,
      },
      blockchainTx: null,
      description:
        "Client requested significant additional features beyond original scope without agreeing to additional payment.",
    },
    {
      id: "DSP-2024-004",
      title: "Missed deadline due to unclear requirements",
      category: "Timeline",
      status: "Escalated",
      priority: "Critical",
      amount: 4500,
      submittedBy: "Jennifer Walsh",
      submittedDate: "2024-01-19",
      parties: {
        client: "Enterprise Solutions Ltd",
        freelancer: "Jennifer Walsh",
        aiAgent: null,
      },
      arbitrators: [
        { name: "Dr. Emily Zhang", avatar: "/placeholder.svg", reputation: 97 },
        { name: "Lisa Thompson", avatar: "/placeholder.svg", reputation: 95 },
        { name: "Robert Kim", avatar: "/placeholder.svg", reputation: 94 },
      ],
      evidence: {
        files: 12,
        messages: 45,
      },
      blockchainTx: null,
      description: "Project deadline missed due to constantly changing and unclear requirements from client side.",
    },
  ]

  const disputeStats = {
    total: 156,
    pending: 23,
    resolved: 125,
    escalated: 8,
    totalValue: 2300000,
    avgResolutionTime: 3.2,
    satisfactionRate: 94,
  }

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "payment", label: "Payment" },
    { value: "quality", label: "Quality" },
    { value: "scope", label: "Scope" },
    { value: "timeline", label: "Timeline" },
    { value: "ip-rights", label: "IP Rights" },
    { value: "ai-agent", label: "AI Agent" },
    { value: "other", label: "Other" },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending Review":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Under Investigation":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "In Mediation":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "Resolved":
        return "bg-green-100 text-green-800 border-green-200"
      case "Escalated":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "border-l-red-500"
      case "High":
        return "border-l-orange-500"
      case "Medium":
        return "border-l-yellow-500"
      case "Low":
        return "border-l-green-500"
      default:
        return "border-l-gray-300"
    }
  }

  const handleSubmitDispute = async () => {
    setIsSubmitting(true)

    try {
      // Simulate form validation
      if (!disputeForm.title || !disputeForm.description || !disputeForm.category) {
        throw new Error("Please fill in all required fields")
      }

      // Simulate blockchain transaction
      await new Promise((resolve) => setTimeout(resolve, 3000))

      const disputeId = `DSP-2024-${String(disputes.length + 1).padStart(3, "0")}`

      toast.success(
        <div className="flex flex-col space-y-2">
          <div className="font-semibold">Dispute Submitted Successfully! ⚖️</div>
          <div className="text-sm">Dispute ID: {disputeId}</div>
          <div className="text-xs text-muted-foreground">All parties have been notified</div>
        </div>,
      )

      // Reset form
      setDisputeForm({
        title: "",
        client: "",
        freelancer: "",
        aiAgent: "",
        category: "",
        amount: "",
        description: "",
      })
      setUploadedFiles([])
      setIsSubmitModalOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit dispute")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setUploadedFiles((prev) => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const filteredDisputes = disputes.filter((dispute) => {
    const matchesSearch =
      dispute.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || dispute.category.toLowerCase() === selectedCategory
    const matchesTab =
      selectedTab === "all" ||
      (selectedTab === "pending" &&
        ["Pending Review", "Under Investigation", "In Mediation"].includes(dispute.status)) ||
      (selectedTab === "resolved" && dispute.status === "Resolved") ||
      (selectedTab === "escalated" && dispute.status === "Escalated")

    return matchesSearch && matchesCategory && matchesTab
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <Gavel className="w-16 h-16 mr-4" />
              <h1 className="text-5xl font-bold">DAO Disputes</h1>
            </div>
            <p className="text-xl mb-8 text-blue-100">
              Transparent, decentralized dispute resolution powered by our community of experts
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <p className="text-3xl font-bold">{disputeStats.total}</p>
                <p className="text-blue-200">Total Disputes</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <p className="text-3xl font-bold">${(disputeStats.totalValue / 1000000).toFixed(1)}M</p>
                <p className="text-blue-200">Value Resolved</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <p className="text-3xl font-bold">{disputeStats.avgResolutionTime}</p>
                <p className="text-blue-200">Avg Days</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <p className="text-3xl font-bold">{disputeStats.satisfactionRate}%</p>
                <p className="text-blue-200">Satisfaction</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Wallet Connection Warning */}
        {isAuthenticated && !isWalletConnected && (
          <Card className="mb-8 bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertCircle className="w-6 h-6 text-orange-500 mr-3" />
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-900">Connect Your Wallet</h3>
                  <p className="text-orange-700">
                    Connect your wallet to submit disputes and participate in resolution.
                  </p>
                </div>
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Shield className="w-4 h-4 mr-2" />
                  Connect Wallet
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search disputes by ID or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Dialog open={isSubmitModalOpen} onOpenChange={setIsSubmitModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg" disabled={!isWalletConnected}>
                <Plus className="w-4 h-4 mr-2" />
                Submit Dispute
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Gavel className="w-5 h-5 mr-2" />
                  Submit a Dispute
                </DialogTitle>
                <DialogDescription>
                  Provide detailed information about your dispute. All parties will be notified and high-ranking DAO
                  members will review your case.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Dispute Title *</Label>
                    <Input
                      id="title"
                      placeholder="Brief summary of the dispute"
                      value={disputeForm.title}
                      onChange={(e) => setDisputeForm({ ...disputeForm, title: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={disputeForm.category}
                        onValueChange={(value) => setDisputeForm({ ...disputeForm, category: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="payment">Payment</SelectItem>
                          <SelectItem value="quality">Quality</SelectItem>
                          <SelectItem value="scope">Scope</SelectItem>
                          <SelectItem value="timeline">Timeline</SelectItem>
                          <SelectItem value="ip-rights">IP Rights</SelectItem>
                          <SelectItem value="ai-agent">AI Agent</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="amount">Disputed Amount (HBAR)</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        value={disputeForm.amount}
                        onChange={(e) => setDisputeForm({ ...disputeForm, amount: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Parties Involved */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Parties Involved</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="client">Client</Label>
                      <Input
                        id="client"
                        placeholder="Client name or ID"
                        value={disputeForm.client}
                        onChange={(e) => setDisputeForm({ ...disputeForm, client: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="freelancer">Freelancer</Label>
                      <Input
                        id="freelancer"
                        placeholder="Freelancer name or ID"
                        value={disputeForm.freelancer}
                        onChange={(e) => setDisputeForm({ ...disputeForm, freelancer: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="aiAgent">AI Agent (if applicable)</Label>
                      <Input
                        id="aiAgent"
                        placeholder="AI Agent name or ID"
                        value={disputeForm.aiAgent}
                        onChange={(e) => setDisputeForm({ ...disputeForm, aiAgent: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Detailed Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide a comprehensive explanation of the dispute, including timeline, expectations, and what went wrong..."
                    value={disputeForm.description}
                    onChange={(e) => setDisputeForm({ ...disputeForm, description: e.target.value })}
                    className="mt-1 min-h-32"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Be as detailed as possible. Include relevant dates, communications, and specific issues.
                  </p>
                </div>

                {/* File Upload */}
                <div>
                  <Label>Supporting Evidence</Label>
                  <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Upload screenshots, contracts, communications, or other relevant files
                    </p>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <Button type="button" variant="outline" size="sm">
                        Choose Files
                      </Button>
                    </Label>
                  </div>

                  {/* Uploaded Files */}
                  {uploadedFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium text-gray-700">Uploaded Files:</p>
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center">
                            <FileText className="w-4 h-4 text-gray-500 mr-2" />
                            <span className="text-sm text-gray-700">{file.name}</span>
                            <span className="text-xs text-gray-500 ml-2">({(file.size / 1024).toFixed(1)} KB)</span>
                          </div>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(index)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* What Happens Next */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">What Happens Next?</h4>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Your dispute will be assigned a unique ID and logged on the blockchain</li>
                    <li>All parties involved will receive notifications</li>
                    <li>High-ranking DAO members will be selected as arbitrators</li>
                    <li>Arbitrators will review evidence and facilitate resolution</li>
                    <li>Final judgment will be recorded on-chain and automatically executed</li>
                  </ol>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsSubmitModalOpen(false)}
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitDispute}
                    disabled={isSubmitting || !disputeForm.title || !disputeForm.description || !disputeForm.category}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </div>
                    ) : (
                      "Submit Dispute"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-4 lg:w-96">
            <TabsTrigger value="all">All ({disputeStats.total})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({disputeStats.pending})</TabsTrigger>
            <TabsTrigger value="resolved">Resolved ({disputeStats.resolved})</TabsTrigger>
            <TabsTrigger value="escalated">Escalated ({disputeStats.escalated})</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="mt-6">
            <div className="space-y-6">
              {filteredDisputes.map((dispute) => (
                <Card
                  key={dispute.id}
                  className={`shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 ${getPriorityColor(dispute.priority)}`}
                >
                  <CardHeader>
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-lg">{dispute.title}</CardTitle>
                          <Badge className={`${getStatusColor(dispute.status)} border`}>{dispute.status}</Badge>
                          <Badge variant="outline" className="text-xs">
                            {dispute.priority}
                          </Badge>
                        </div>
                        <CardDescription className="flex items-center gap-4 text-sm">
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {dispute.submittedDate}
                          </span>
                          <span className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {dispute.submittedBy}
                          </span>
                          <span className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            {dispute.amount.toLocaleString()} HBAR
                          </span>
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {dispute.id}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {dispute.category}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Description */}
                      <p className="text-gray-700 text-sm leading-relaxed">{dispute.description}</p>

                      {/* Parties Involved */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          Parties Involved
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          {dispute.parties.client && (
                            <div className="flex items-center">
                              <Building2 className="w-4 h-4 text-blue-600 mr-2" />
                              <div>
                                <p className="font-medium">Client</p>
                                <p className="text-gray-600">{dispute.parties.client}</p>
                              </div>
                            </div>
                          )}
                          {dispute.parties.freelancer && (
                            <div className="flex items-center">
                              <User className="w-4 h-4 text-green-600 mr-2" />
                              <div>
                                <p className="font-medium">Freelancer</p>
                                <p className="text-gray-600">{dispute.parties.freelancer}</p>
                              </div>
                            </div>
                          )}
                          {dispute.parties.aiAgent && (
                            <div className="flex items-center">
                              <Bot className="w-4 h-4 text-purple-600 mr-2" />
                              <div>
                                <p className="font-medium">AI Agent</p>
                                <p className="text-gray-600">{dispute.parties.aiAgent}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Arbitrators */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                        <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                          <Scale className="w-4 h-4 mr-1" />
                          Assigned Arbitrators
                        </h4>
                        <div className="flex flex-wrap gap-3">
                          {dispute.arbitrators.map((arbitrator, index) => (
                            <div key={index} className="flex items-center bg-white rounded-lg p-2 shadow-sm">
                              <Avatar className="w-8 h-8 mr-2">
                                <AvatarImage src={arbitrator.avatar || "/placeholder.svg"} alt={arbitrator.name} />
                                <AvatarFallback>{arbitrator.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{arbitrator.name}</p>
                                <div className="flex items-center">
                                  <Award className="w-3 h-3 text-yellow-500 mr-1" />
                                  <span className="text-xs text-gray-600">{arbitrator.reputation}% rep</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Evidence & Actions */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <FileText className="w-4 h-4 mr-1" />
                            {dispute.evidence.files} files
                          </span>
                          <span className="flex items-center">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            {dispute.evidence.messages} messages
                          </span>
                          {dispute.blockchainTx && (
                            <span className="flex items-center">
                              <ExternalLink className="w-4 h-4 mr-1" />
                              <a
                                href={`https://hashscan.io/mainnet/transaction/${dispute.blockchainTx}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                View on Blockchain
                              </a>
                            </span>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Button>
                          {dispute.status !== "Resolved" && user?.role === "admin" && (
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                              <Gavel className="w-4 h-4 mr-1" />
                              Review Case
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Resolution (if resolved) */}
                      {dispute.resolution && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <h4 className="font-semibold text-green-900 mb-2 flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Resolution
                          </h4>
                          <p className="text-sm text-green-800">{dispute.resolution}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredDisputes.length === 0 && (
                <Card className="text-center py-12">
                  <CardContent>
                    <Gavel className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Disputes Found</h3>
                    <p className="text-gray-600 mb-4">
                      {searchQuery || selectedCategory !== "all"
                        ? "Try adjusting your search or filter criteria."
                        : "No disputes match the selected tab."}
                    </p>
                    {!searchQuery && selectedCategory === "all" && (
                      <Button
                        onClick={() => setIsSubmitModalOpen(true)}
                        disabled={!isWalletConnected}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Submit First Dispute
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
