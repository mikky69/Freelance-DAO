"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Users,
  Calendar,
  FileText,
  TrendingUp,
  MessageSquare,
  Share2,
  Bookmark,
  AlertTriangle,
  Wallet,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

export default function ProposalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated, isWalletConnected } = useAuth()
  const [isVoting, setIsVoting] = useState(false)

  const proposalId = Number.parseInt(params.id as string)

  // Mock proposal data - would come from API/blockchain
  const proposal = {
    id: proposalId,
    title: "Implement AI Agent Revenue Sharing Model",
    description:
      "This proposal establishes a comprehensive revenue sharing system for AI agents where creators receive 15% royalties from all transactions. The implementation includes smart contract deployment, automatic distribution mechanisms, transparent tracking systems, and dispute resolution processes.",
    fullDescription: `
## Overview
This proposal aims to create a fair and sustainable revenue sharing model for AI agents on the FreeLanceDAO platform. By implementing a 15% royalty system, we ensure that AI agent creators are properly compensated for their contributions while maintaining platform sustainability.

## Technical Implementation
- **Smart Contract Development**: Deploy new revenue sharing contracts on Solana
- **Automatic Distribution**: Implement real-time royalty distribution system
- **Tracking System**: Create transparent tracking for all revenue sharing transactions
- **Integration**: Seamlessly integrate with existing AI agent marketplace

## Benefits
1. **Creator Incentives**: Motivates high-quality AI agent development
2. **Platform Growth**: Attracts more talented developers to the ecosystem
3. **Transparency**: All transactions recorded on blockchain
4. **Sustainability**: Balanced approach that benefits all stakeholders

## Implementation Timeline
- **Phase 1** (Weeks 1-2): Smart contract development and testing
- **Phase 2** (Weeks 3-4): Integration with existing systems
- **Phase 3** (Weeks 5-6): Testing and security audits
- **Phase 4** (Weeks 7-8): Deployment and monitoring

## Budget Requirements
- Development: 50,000 USDC
- Security Audit: 15,000 USDC
- Testing & QA: 10,000 USDC
- **Total**: 75,000 USDC (from DAO treasury)
    `,
    type: "Major",
    status: "Active",
    category: "Tokenomics",
    votes: { yes: 1247, no: 234 },
    totalVotes: 1481,
    voteWeight: { yes: 12470, no: 2340 },
    timeLeft: "3 days",
    endDate: "2024-01-20T23:59:59Z",
    fee: "75 USDC",
    creator: {
      address: "0x1234...5678",
      name: "Alex Chen",
      avatar: "/placeholder.svg?height=40&width=40",
      reputation: 4.8,
      proposalsCreated: 12,
      isVerified: true,
    },
    created: "2024-01-15T10:30:00Z",
    documentLink: "https://docs.freelancedao.com/proposals/revenue-sharing-v2.pdf",
    tags: ["Revenue", "AI Agents", "Smart Contracts", "Tokenomics"],
    hasVoted: false,
    userVote: null,
    comments: 47,
    views: 2341,
    bookmarks: 156,
  }

  const userEligibility = {
    voteWeight: 15,
    stakedTokens: 1500,
  }

  const voteHistory = [
    {
      address: "0x9876...5432",
      name: "Sarah Johnson",
      vote: "yes",
      weight: 25,
      timestamp: "2024-01-16T14:22:00Z",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      address: "0x5555...7777",
      name: "Maria Rodriguez",
      vote: "yes",
      weight: 18,
      timestamp: "2024-01-16T12:15:00Z",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      address: "0x3333...9999",
      name: "David Kim",
      vote: "no",
      weight: 12,
      timestamp: "2024-01-16T09:45:00Z",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      address: "0x7777...1111",
      name: "Emma Wilson",
      vote: "yes",
      weight: 8,
      timestamp: "2024-01-15T16:30:00Z",
      avatar: "/placeholder.svg?height=32&width=32",
    },
  ]

  const handleVote = async (vote: "yes" | "no") => {
    if (!isWalletConnected) {
      toast.error("Please connect your Solana wallet to vote")
      return
    }

    setIsVoting(true)

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
      setIsVoting(false)
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Less than an hour ago"
    if (diffInHours < 24) return `${diffInHours} hours ago`
    return `${Math.floor(diffInHours / 24)} days ago`
  }

  if (!proposal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="text-center p-8">
          <CardContent>
            <AlertTriangle className="w-16 h-16 mx-auto text-slate-400 mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">Proposal Not Found</h3>
            <p className="text-slate-500 mb-4">The proposal you're looking for doesn't exist or has been removed.</p>
            <Link href="/dao/proposals">
              <Button>Back to Proposals</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-4">
            <Link href="/dao/proposals">
              <Button variant="ghost" className="text-white hover:bg-white/20 mr-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Proposals
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">Proposal #{proposal.id}</Badge>
              <Badge className={getStatusColor(proposal.status)}>
                {getStatusIcon(proposal.status)}
                <span className="ml-1">{proposal.status}</span>
              </Badge>
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">{proposal.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-blue-100">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Created {formatDate(proposal.created)}
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              {proposal.totalVotes} votes
            </div>
            <div className="flex items-center">
              <MessageSquare className="w-4 h-4 mr-2" />
              {proposal.comments} comments
            </div>
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              {proposal.views} views
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Proposal Details */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge
                        variant="outline"
                        className={
                          proposal.type === "Major"
                            ? "border-purple-300 text-purple-700 bg-purple-50"
                            : "border-blue-300 text-blue-700 bg-blue-50"
                        }
                      >
                        {proposal.type} Proposal
                      </Badge>
                      <Badge variant="outline">{proposal.category}</Badge>
                      <span className="text-sm text-slate-600">Fee: {proposal.fee}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {proposal.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    <Button variant="outline" size="sm">
                      <Bookmark className="w-4 h-4 mr-2" />
                      Bookmark
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-lg text-slate-700 mb-6">{proposal.description}</p>
                  <div className="whitespace-pre-wrap text-slate-600">{proposal.fullDescription}</div>
                </div>

                {proposal.documentLink && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-blue-600 mr-3" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-blue-900">Supporting Documentation</h4>
                        <p className="text-blue-700 text-sm">
                          Detailed technical specification and implementation plan
                        </p>
                      </div>
                      <a
                        href={proposal.documentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View Document
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Creator Information */}
            <Card>
              <CardHeader>
                <CardTitle>Proposal Creator</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={proposal.creator.avatar || "/placeholder.svg"} alt={proposal.creator.name} />
                    <AvatarFallback>{proposal.creator.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold text-lg">{proposal.creator.name}</h4>
                      {proposal.creator.isVerified && <CheckCircle className="w-5 h-5 text-blue-500" />}
                    </div>
                    <p className="text-slate-600 font-mono text-sm mb-2">{proposal.creator.address}</p>
                    <div className="flex items-center space-x-4 text-sm text-slate-600">
                      <span>Reputation: {proposal.creator.reputation}/5.0</span>
                      <span>Proposals Created: {proposal.creator.proposalsCreated}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Votes */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Votes</CardTitle>
                <CardDescription>Latest community votes on this proposal</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {voteHistory.map((vote, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={vote.avatar || "/placeholder.svg"} alt={vote.name} />
                        <AvatarFallback>{vote.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{vote.name}</span>
                          <span className="text-xs text-slate-500 font-mono">{vote.address}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-slate-600">
                          <Badge variant={vote.vote === "yes" ? "default" : "destructive"} className="text-xs">
                            {vote.vote.toUpperCase()}
                          </Badge>
                          <span>Weight: {vote.weight}</span>
                          <span>{formatTimeAgo(vote.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Voting Card */}
            <Card>
              <CardHeader>
                <CardTitle>Cast Your Vote</CardTitle>
                <CardDescription>
                  {proposal.status === "Active"
                    ? `Voting ends in ${proposal.timeLeft}`
                    : `Voting ended • ${proposal.status}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Vote Progress */}
                <div className="space-y-4 mb-6">
                  <div>
                    <div className="flex justify-between text-sm text-slate-600 mb-2">
                      <span>
                        Yes: {proposal.votes.yes} ({proposal.voteWeight.yes} weight)
                      </span>
                      <span>
                        {Math.round(
                          (proposal.voteWeight.yes / (proposal.voteWeight.yes + proposal.voteWeight.no)) * 100,
                        )}
                        %
                      </span>
                    </div>
                    <Progress
                      value={(proposal.voteWeight.yes / (proposal.voteWeight.yes + proposal.voteWeight.no)) * 100}
                      className="h-3"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm text-slate-600 mb-2">
                      <span>
                        No: {proposal.votes.no} ({proposal.voteWeight.no} weight)
                      </span>
                      <span>
                        {Math.round(
                          (proposal.voteWeight.no / (proposal.voteWeight.yes + proposal.voteWeight.no)) * 100,
                        )}
                        %
                      </span>
                    </div>
                    <Progress
                      value={(proposal.voteWeight.no / (proposal.voteWeight.yes + proposal.voteWeight.no)) * 100}
                      className="h-3 bg-red-100"
                    />
                  </div>
                  <div className="text-center text-sm text-slate-600 pt-2 border-t">
                    Total: {proposal.totalVotes} votes • {proposal.voteWeight.yes + proposal.voteWeight.no} weight
                  </div>
                </div>

                {/* Voting Buttons */}
                {proposal.status === "Active" && !proposal.hasVoted && isWalletConnected && (
                  <div className="space-y-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span>Your Vote Weight:</span>
                        <span className="font-semibold">{userEligibility.voteWeight}</span>
                      </div>
                      <div className="text-xs text-slate-600">
                        Based on {userEligibility.stakedTokens} staked $FLDAO tokens
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={() => handleVote("yes")}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={isVoting}
                      >
                        {isVoting ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        )}
                        Vote Yes
                      </Button>
                      <Button
                        onClick={() => handleVote("no")}
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                        disabled={isVoting}
                      >
                        {isVoting ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                        ) : (
                          <XCircle className="w-4 h-4 mr-2" />
                        )}
                        Vote No
                      </Button>
                    </div>
                    <div className="text-xs text-slate-500 text-center">
                      Small SOL gas fee required • Vote weight: {userEligibility.voteWeight}
                    </div>
                  </div>
                )}

                {proposal.status === "Active" && proposal.hasVoted && (
                  <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="w-8 h-8 mx-auto text-green-600 mb-2" />
                    <div className="font-semibold text-green-900">You voted {proposal.userVote?.toUpperCase()}</div>
                    <div className="text-sm text-green-700">Vote weight: {userEligibility.voteWeight}</div>
                  </div>
                )}

                {!isWalletConnected && (
                  <div className="text-center p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <AlertTriangle className="w-8 h-8 mx-auto text-orange-500 mb-2" />
                    <div className="font-semibold text-orange-900 mb-2">Connect Wallet to Vote</div>
                    <Button className="bg-orange-600 hover:bg-orange-700">
                      <Wallet className="w-4 h-4 mr-2" />
                      Connect Solana Wallet
                    </Button>
                  </div>
                )}

                {proposal.status !== "Active" && (
                  <div className="text-center p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <Clock className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                    <div className="font-semibold text-slate-600">Voting Ended</div>
                    <div className="text-sm text-slate-500">This proposal is no longer accepting votes</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Proposal Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Proposal Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Total Votes</span>
                  <span className="font-semibold">{proposal.totalVotes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Total Weight</span>
                  <span className="font-semibold">{proposal.voteWeight.yes + proposal.voteWeight.no}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Views</span>
                  <span className="font-semibold">{proposal.views}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Comments</span>
                  <span className="font-semibold">{proposal.comments}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Bookmarks</span>
                  <span className="font-semibold">{proposal.bookmarks}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Submission Fee</span>
                  <span className="font-semibold">{proposal.fee}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">End Date</span>
                  <span className="font-semibold text-sm">{formatDate(proposal.endDate)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
