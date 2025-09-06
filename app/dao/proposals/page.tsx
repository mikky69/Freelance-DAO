"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Vote,
  Plus,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Wallet,
  ExternalLink,
  Users,
  Coins,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

export default function ProposalsPage() {
  const { user, isAuthenticated, isWalletConnected } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTab, setSelectedTab] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [proposalType, setProposalType] = useState("light")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isVoting, setIsVoting] = useState<number | null>(null)

  // Mock user eligibility data - would come from Solana blockchain
  const userEligibility = {
    isPremiumMember: true,
    stakedTokens: 1500, // $FLDAO tokens staked
    walletBalance: {
      sol: 2.5,
      usdc: 250,
    },
    canCreateProposal: true,
    voteWeight: 15, // 1500 staked tokens = 15 vote weight (1:10 ratio)
  }

  const proposals = [
    {
      id: 1,
      title: "Implement AI Agent Revenue Sharing Model",
      description:
        "Establish a comprehensive revenue sharing system for AI agents where creators receive 15% royalties from all transactions. This proposal includes smart contract implementation, automatic distribution mechanisms, and transparent tracking systems.",
      type: "Major",
      status: "Active",
      category: "Tokenomics",
      votes: { yes: 1247, no: 234 },
      totalVotes: 1481,
      voteWeight: { yes: 12470, no: 2340 }, // Weighted votes
      timeLeft: "3 days",
      endDate: "2024-01-20T23:59:59Z",
      fee: "75 USDC",
      creator: "0x1234...5678",
      creatorName: "Alex Chen",
      created: "2024-01-15",
      documentLink: "https://docs.freelancedao.com/proposals/revenue-sharing-v2.pdf",
      tags: ["Revenue", "AI Agents", "Smart Contracts"],
      hasVoted: false,
      userVote: null,
    },
    {
      id: 2,
      title: "Update Platform UI/UX Design System",
      description:
        "Modernize the platform interface with improved accessibility features, mobile responsiveness, and updated design components following Material Design 3 principles.",
      type: "Light",
      status: "Passed",
      category: "Platform",
      votes: { yes: 892, no: 156 },
      totalVotes: 1048,
      voteWeight: { yes: 8920, no: 1560 },
      timeLeft: "Completed",
      endDate: "2024-01-12T23:59:59Z",
      fee: "10 USDC",
      creator: "0x9876...5432",
      creatorName: "Sarah Johnson",
      created: "2024-01-10",
      tags: ["UI/UX", "Accessibility", "Mobile"],
      hasVoted: true,
      userVote: "yes",
    },
    {
      id: 3,
      title: "Add Multi-language Support",
      description:
        "Implement comprehensive internationalization for Spanish, French, German, and Japanese languages. Includes translation of all UI elements, documentation, and smart contract interactions.",
      type: "Major",
      status: "Active",
      category: "Platform",
      votes: { yes: 567, no: 123 },
      totalVotes: 690,
      voteWeight: { yes: 5670, no: 1230 },
      timeLeft: "5 days",
      endDate: "2024-01-22T23:59:59Z",
      fee: "50 USDC",
      creator: "0x5555...7777",
      creatorName: "Maria Rodriguez",
      created: "2024-01-12",
      documentLink: "https://docs.freelancedao.com/proposals/i18n-implementation.pdf",
      tags: ["Internationalization", "Languages", "Global"],
      hasVoted: false,
      userVote: null,
    },
    {
      id: 4,
      title: "Increase Staking Rewards APY",
      description:
        "Proposal to increase staking rewards from 12.5% to 15% APY for single asset staking to remain competitive with other DeFi platforms.",
      type: "Major",
      status: "Failed",
      category: "Tokenomics",
      votes: { yes: 234, no: 567 },
      totalVotes: 801,
      voteWeight: { yes: 2340, no: 5670 },
      timeLeft: "Completed",
      endDate: "2024-01-10T23:59:59Z",
      fee: "50 USDC",
      creator: "0x3333...9999",
      creatorName: "David Kim",
      created: "2024-01-08",
      tags: ["Staking", "APY", "Rewards"],
      hasVoted: true,
      userVote: "no",
    },
    {
      id: 5,
      title: "Bug Fix: Mobile Wallet Connection",
      description:
        "Fix critical bug preventing mobile wallet connections on iOS devices when using Safari browser. Affects approximately 15% of mobile users.",
      type: "Light",
      status: "Active",
      category: "Bug Fix",
      votes: { yes: 445, no: 23 },
      totalVotes: 468,
      voteWeight: { yes: 4450, no: 230 },
      timeLeft: "2 days",
      endDate: "2024-01-19T23:59:59Z",
      fee: "5 USDC",
      creator: "0x7777...1111",
      creatorName: "Emma Wilson",
      created: "2024-01-16",
      tags: ["Bug Fix", "Mobile", "Wallet"],
      hasVoted: false,
      userVote: null,
    },
  ]

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "Tokenomics", label: "Tokenomics" },
    { value: "Platform", label: "Platform" },
    { value: "Bug Fix", label: "Bug Fixes" },
    { value: "Governance", label: "Governance" },
    { value: "Security", label: "Security" },
  ]

  const filteredProposals = proposals.filter((proposal) => {
    const matchesSearch =
      proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesTab =
      selectedTab === "all" ||
      (selectedTab === "active" && proposal.status === "Active") ||
      (selectedTab === "passed" && proposal.status === "Passed") ||
      (selectedTab === "failed" && proposal.status === "Failed")

    const matchesCategory = selectedCategory === "all" || proposal.category === selectedCategory

    return matchesSearch && matchesTab && matchesCategory
  })

  const handleCreateProposal = async (formData: FormData) => {
    if (!isWalletConnected) {
      toast.error("Please connect your wallet to create a proposal")
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate wallet transaction for fee payment
      toast.info("Please authorize the transaction in your wallet...")
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulate blockchain confirmation
      toast.info("Transaction submitted to Solana blockchain...")
      await new Promise((resolve) => setTimeout(resolve, 3000))

      toast.success("Proposal created successfully! Transaction confirmed on Solana blockchain.")
      setIsCreateModalOpen(false)
    } catch (error) {
      toast.error("Failed to create proposal. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVote = async (proposalId: number, vote: "yes" | "no") => {
    if (!isWalletConnected) {
      toast.error("Please connect your wallet to vote")
      return
    }

    setIsVoting(proposalId)

    try {
      // Simulate SOL gas fee transaction
      toast.info("Please authorize the voting gas fee transaction (≈0.001 SOL)...")
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Simulate vote recording
      toast.info("Recording your vote on the blockchain...")
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast.success(
        `Vote cast successfully! Your ${vote.toUpperCase()} vote (weight: ${userEligibility.voteWeight}) has been recorded.`,
      )
    } catch (error) {
      toast.error("Failed to cast vote. Please try again.")
    } finally {
      setIsVoting(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 border-green-300"
      case "Passed":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "Failed":
        return "bg-red-100 text-red-800 border-red-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active":
        return <Clock className="w-4 h-4" />
      case "Passed":
        return <CheckCircle className="w-4 h-4" />
      case "Failed":
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    return type === "Major"
      ? "border-purple-300 text-purple-700 bg-purple-50"
      : "border-blue-300 text-blue-700 bg-blue-50"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">DAO Proposals</h1>
              <p className="text-blue-100 mb-4">Participate in governance and shape the future of FreeLanceDAO</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Your Vote Weight: {userEligibility.voteWeight}
                </div>
                <div className="flex items-center">
                  <Coins className="w-4 h-4 mr-2" />
                  Staked: {userEligibility.stakedTokens} $FLDAO
                </div>
                <div className="flex items-center">
                  <Wallet className="w-4 h-4 mr-2" />
                  Balance: {userEligibility.walletBalance.usdc} USDC
                </div>
              </div>
            </div>
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-blue-50"
                  disabled={!isAuthenticated || !isWalletConnected}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Proposal
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Proposal</DialogTitle>
                  <DialogDescription>
                    Submit a proposal for DAO consideration. Fees are required to prevent spam and go to the DAO
                    treasury.
                  </DialogDescription>
                </DialogHeader>

                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleCreateProposal(new FormData(e.currentTarget))
                  }}
                  className="space-y-6"
                >
                  {/* Eligibility Check */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-3">Eligibility Status</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center justify-between">
                        <span>Premium Member</span>
                        {userEligibility.isPremiumMember ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Staked $FLDAO</span>
                        <span className="font-medium">{userEligibility.stakedTokens}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>USDC Balance</span>
                        <span className="font-medium">{userEligibility.walletBalance.usdc}</span>
                      </div>
                    </div>
                    {userEligibility.canCreateProposal ? (
                      <div className="mt-3 flex items-center text-green-700">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        You are eligible to create proposals
                      </div>
                    ) : (
                      <div className="mt-3 flex items-center text-red-700">
                        <XCircle className="w-4 h-4 mr-2" />
                        You need to be a Premium Member, have staked tokens, or sufficient USDC balance
                      </div>
                    )}
                  </div>

                  {/* Proposal Type */}
                  <div>
                    <Label className="text-base font-semibold">Proposal Type</Label>
                    <RadioGroup value={proposalType} onValueChange={setProposalType} className="mt-2">
                      <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-blue-50">
                        <RadioGroupItem value="light" id="light" />
                        <Label htmlFor="light" className="flex-1 cursor-pointer">
                          <div className="font-medium">Light Proposal</div>
                          <div className="text-sm text-slate-600">
                            Minor upgrades, platform bug fixes, small feature suggestions
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            Simpler form • Lower fee • Faster processing
                          </div>
                        </Label>
                        <Badge variant="outline" className="bg-blue-50">
                          5-10 USDC
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-purple-50">
                        <RadioGroupItem value="major" id="major" />
                        <Label htmlFor="major" className="flex-1 cursor-pointer">
                          <div className="font-medium">Major Proposal</div>
                          <div className="text-sm text-slate-600">
                            Significant changes, tokenomics adjustments, major partnerships
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            Detailed form • Higher fee • Extended review period
                          </div>
                        </Label>
                        <Badge variant="outline" className="bg-purple-50">
                          50-100 USDC
                        </Badge>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Basic Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="title">Proposal Title *</Label>
                      <Input
                        id="title"
                        name="title"
                        placeholder="Enter a clear, descriptive title"
                        required
                        className="mt-1"
                        maxLength={100}
                      />
                    </div>

                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select name="category" required>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Tokenomics">Tokenomics</SelectItem>
                          <SelectItem value="Platform">Platform</SelectItem>
                          <SelectItem value="Bug Fix">Bug Fix</SelectItem>
                          <SelectItem value="Governance">Governance</SelectItem>
                          <SelectItem value="Security">Security</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="tags">Tags (comma-separated)</Label>
                      <Input id="tags" name="tags" placeholder="e.g., AI, Revenue, Smart Contracts" className="mt-1" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Detailed Description *</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Provide a comprehensive explanation of your proposal, including rationale, implementation details, and expected outcomes"
                      required
                      rows={proposalType === "major" ? 6 : 4}
                      className="mt-1"
                      maxLength={proposalType === "major" ? 2000 : 1000}
                    />
                    <div className="text-xs text-slate-500 mt-1">
                      {proposalType === "major" ? "Up to 2000 characters" : "Up to 1000 characters"}
                    </div>
                  </div>

                  {proposalType === "major" && (
                    <div>
                      <Label htmlFor="document">Supporting Document Link</Label>
                      <Input
                        id="document"
                        name="document"
                        type="url"
                        placeholder="https://docs.freelancedao.com/proposals/your-proposal.pdf"
                        className="mt-1"
                      />
                      <div className="text-xs text-slate-500 mt-1">
                        Link to whitepaper, detailed specification, or supporting documentation
                      </div>
                    </div>
                  )}

                  {/* Fee Display */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Proposal Submission Fee</span>
                      <span className="text-xl font-bold text-yellow-800">
                        {proposalType === "light" ? "10 USDC" : "75 USDC"}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600 space-y-1">
                      <p>• Fee helps prevent spam and ensures quality proposals</p>
                      <p>• Payment goes directly to DAO treasury</p>
                      <p>• Transaction will be processed on Solana blockchain</p>
                      <p>• You will be prompted to authorize payment in your wallet</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateModalOpen(false)}
                      className="flex-1"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting || !userEligibility.canCreateProposal}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating...
                        </>
                      ) : (
                        "Create Proposal"
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search proposals by title, description, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full lg:w-48">
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

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Proposals ({proposals.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({proposals.filter((p) => p.status === "Active").length})</TabsTrigger>
            <TabsTrigger value="passed">Passed ({proposals.filter((p) => p.status === "Passed").length})</TabsTrigger>
            <TabsTrigger value="failed">Failed ({proposals.filter((p) => p.status === "Failed").length})</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Wallet Connection Warning */}
        {isAuthenticated && !isWalletConnected && (
          <Card className="mb-8 bg-orange-50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertCircle className="w-6 h-6 text-orange-500 mr-3" />
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-900">Connect Your Wallet</h3>
                  <p className="text-orange-700">
                    Connect your wallet to vote on proposals and create new ones.
                    Voting requires a small gas fee to prevent bot activity.
                  </p>
                </div>
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Proposals List */}
        <div className="space-y-6">
          {filteredProposals.map((proposal) => (
            <Card key={proposal.id} className="shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <CardTitle className="text-xl">{proposal.title}</CardTitle>
                      <Badge variant="outline" className={getTypeColor(proposal.type)}>
                        {proposal.type}
                      </Badge>
                      <Badge className={getStatusColor(proposal.status)}>
                        {getStatusIcon(proposal.status)}
                        <span className="ml-1">{proposal.status}</span>
                      </Badge>
                      {proposal.hasVoted && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Voted {proposal.userVote?.toUpperCase()}
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-base mb-3">{proposal.description}</CardDescription>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {proposal.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-sm text-slate-600 space-y-1">
                      <div>Fee: {proposal.fee}</div>
                      <div>Category: {proposal.category}</div>
                      <div>{proposal.status === "Active" ? `${proposal.timeLeft} left` : proposal.timeLeft}</div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Voting Progress */}
                  <div>
                    <div className="flex justify-between text-sm text-slate-600 mb-2">
                      <span>
                        Yes: {proposal.votes.yes} votes ({proposal.voteWeight.yes} weight) •{" "}
                        {Math.round(
                          (proposal.voteWeight.yes / (proposal.voteWeight.yes + proposal.voteWeight.no)) * 100,
                        )}
                        %
                      </span>
                      <span>
                        No: {proposal.votes.no} votes ({proposal.voteWeight.no} weight) •{" "}
                        {Math.round(
                          (proposal.voteWeight.no / (proposal.voteWeight.yes + proposal.voteWeight.no)) * 100,
                        )}
                        %
                      </span>
                    </div>
                    <Progress
                      value={(proposal.voteWeight.yes / (proposal.voteWeight.yes + proposal.voteWeight.no)) * 100}
                      className="h-3"
                    />
                    <div className="text-center text-sm text-slate-600 mt-2">
                      Total: {proposal.totalVotes} votes • {proposal.voteWeight.yes + proposal.voteWeight.no} weight
                    </div>
                  </div>

                  {/* Proposal Meta */}
                  <div className="flex items-center justify-between text-sm text-slate-600 border-t pt-3">
                    <div className="flex items-center space-x-4">
                      <span>Created: {proposal.created}</span>
                      <span>By: {proposal.creatorName}</span>
                      <span className="font-mono text-xs">{proposal.creator}</span>
                    </div>
                    {proposal.documentLink && (
                      <a
                        href={proposal.documentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Document
                      </a>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Link href={`/dao/proposals/${proposal.id}`} className="flex-1">
                      <Button variant="outline" className="w-full bg-transparent">
                        View Details
                      </Button>
                    </Link>
                    {proposal.status === "Active" && !proposal.hasVoted && (
                      <>
                        <Button
                          onClick={() => handleVote(proposal.id, "yes")}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          disabled={!isWalletConnected || isVoting === proposal.id}
                        >
                          {isVoting === proposal.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          ) : (
                            <CheckCircle className="w-4 h-4 mr-2" />
                          )}
                          Vote Yes
                        </Button>
                        <Button
                          onClick={() => handleVote(proposal.id, "no")}
                          variant="outline"
                          className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                          disabled={!isWalletConnected || isVoting === proposal.id}
                        >
                          {isVoting === proposal.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                          ) : (
                            <XCircle className="w-4 h-4 mr-2" />
                          )}
                          Vote No
                        </Button>
                      </>
                    )}
                    {proposal.status === "Active" && proposal.hasVoted && (
                      <div className="flex-1 flex items-center justify-center text-sm text-slate-600 bg-slate-50 rounded-md py-2">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                        You voted {proposal.userVote?.toUpperCase()} (Weight: {userEligibility.voteWeight})
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProposals.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Vote className="w-16 h-16 mx-auto text-slate-400 mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">No Proposals Found</h3>
              <p className="text-slate-500 mb-4">
                {searchTerm || selectedCategory !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Be the first to create a proposal for the DAO!"}
              </p>
              {isWalletConnected && (
                <Button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Proposal
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
