"use client"

import React, { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useWatchContractEvent } from "wagmi"
import proposalContractDeployment from "../../../hedera-deployments/hedera-proposal-testnet.json"
import proposalContractABI from "../../../hedera-frontend-abi/FreeLanceDAOProposalContract.json"
import stakingContractDeployment from "../../../hedera-deployments/hedera-staking-testnet.json"
import stakingContractABI from "../../../hedera-frontend-abi/FreeLanceDAOStaking.json"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Plus } from "lucide-react"

function formatDeadline(deadline: number) {
  // deadline is seconds since epoch
  const now = Math.floor(Date.now() / 1000)
  let diff = deadline - now
  if (diff <= 0) return "Expired"
  const days = Math.floor(diff / (60 * 60 * 24))
  diff -= days * 60 * 60 * 24
  const hours = Math.floor(diff / (60 * 60))
  diff -= hours * 60 * 60
  const minutes = Math.floor(diff / 60)
  return `${days}d ${hours}h ${minutes}m`
}

export default function ProposalsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTab, setSelectedTab] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [proposalType, setProposalType] = useState("light")
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isVoting, setIsVoting] = useState<number | null>(null)

  // Mock user eligibility and will be replaced later
  const userEligibility = {
    stakedHbar: 1500,
    canCreateProposal: true,
    voteWeight: 15,
  }
  const categories = [
    { value: "all", label: "All Categories" },
    { value: "Tokenomics", label: "Tokenomics" },
    { value: "Platform", label: "Platform" },
    { value: "Bug Fix", label: "Bug Fixes" },
    { value: "Governance", label: "Governance" },
    { value: "Security", label: "Security" },
  ]

  // Contract details
  const contractAddress = proposalContractDeployment.FreeLanceDAOProposal.evmAddress
  const contractAbi = proposalContractABI.abi

  // Staking contract details
  const stakingAddress = stakingContractDeployment.FreeLanceDAOStaking.evmAddress
  const stakingAbi = stakingContractABI.abi

  // wagmi hooks
  const { isConnected } = useAccount()
  const { writeContract, data: txData, error: writeError, isPending: isWritePending, reset } = useWriteContract()
  const txHash = typeof txData === 'object' && txData !== null && 'hash' in txData ? (txData as any).hash : undefined
  const { isLoading: isTxLoading, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  useEffect(() => {
    if (writeError) {
      toast.error(writeError.message || "Contract write error")
    }
  }, [writeError])

  // Read proposals from contract
  const { data: proposalsData, isLoading: isProposalsLoading, refetch: refetchProposals } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: contractAbi,
    functionName: "getAllProposals",
    chainId: 296,
    query: {
      enabled: typeof window !== 'undefined' && !!contractAddress
    }
  })
  
  // Only log on client side to avoid build errors
  if (typeof window !== 'undefined') {
    console.log("Proposals data from contract:", proposalsData)
  }

  useWatchContractEvent({
    address: contractAddress as `0x${string}`,
    abi: contractAbi,
    eventName: "ProposalCreated",
    chainId: 296,
    onLogs: () => {
      toast.success("Proposal created successfully!")
      setIsCreateModalOpen(false)
      setTitle("")
      setProposalType("")
      setCategory("")
      setDescription("")
      setTags([])
      reset()
      refetchProposals()
    },
  })

  // Transform proposalsData into array of proposal objects
  const proposals: any[] = React.useMemo(() => {
    if (!proposalsData || !Array.isArray(proposalsData) || proposalsData.length === 0) return []
    return proposalsData.map((p: any) => ({
      id: p.id,
      proposer: p.proposer,
      title: p.title,
      proposalType: p.proposalType,
      category: p.category,
      description: p.description,
      yesVotes: Number(p.yesVotes), //will be fixed when contract is updated. currently not in contract
      noVotes: Number(p.noVotes), //will be fixed when contract is updated. currently not in contract
      tags: p.tags,
      deadline: p.deadline,
      finalized: p.finalized,
      feePaid: Number(p.feePaid) / 1e8,
      participation: Number(p.participation) / 1e8,
    }))
  }, [proposalsData])

  const filteredProposals = proposals.filter((proposal) => {
    const matchesSearch =
      proposal.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (proposal.tags && proposal.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    const matchesTab =
      selectedTab === "all" ||
      (selectedTab === "active" && !proposal.finalized) ||
      (selectedTab === "passed" && proposal.finalized && proposal.participation > 0) ||
      (selectedTab === "failed" && proposal.finalized && proposal.participation === 0)
    const matchesCategory = selectedCategory === "all" || proposal.category === selectedCategory
    return matchesSearch && matchesTab && matchesCategory
  })

  // Voting logic
  const { address } = useAccount()
  const { data: userStakeData, refetch: refetchStake } = useReadContract({
    address: stakingAddress as `0x${string}`,
    abi: stakingAbi,
    functionName: "stakes",
    args: [address],
    chainId: 296,
    // enabled: !!address,
  })
  const handleVote = async (proposalId: number, support: boolean) => {
    if (!isConnected) {
      toast.error("Please connect your wallet to vote.")
      return
    }
    // Check user's stake before voting
    await refetchStake();
    const stakeAmount = (userStakeData as [number] | undefined)?.[0] ?? 0
    if (!stakeAmount || Number(stakeAmount) === 0) {
      toast.error("You must stake tokens before you can vote on proposals.")
      return
    }
    setIsVoting(proposalId)
    try {
      writeContract({
        address: contractAddress as `0x${string}`,
        abi: contractAbi,
        functionName: "vote",
        args: [proposalId, support],
      })
      toast.info("Vote submitted. Awaiting confirmation...")
    } catch (err: any) {
      toast.error(err?.message || "Error submitting vote.")
    } finally {
      setIsVoting(null)
      console.log("Refetching proposals after vote...")
      refetchProposals()
    }
  }

  const handleCreateProposal = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet.")
      return
    }
    if (!title || !proposalType || !category || !description) {
      toast.error("Please fill in all fields.")
      return
    }
    setIsSubmitting(true)
    try {
      const value = proposalType === "light" ? 5 * 1e18 : 10 * 1e18 // HBAR
      writeContract({
        address: contractAddress as `0x${string}`,
        abi: contractAbi,
        functionName: "createProposal",
        args: [title, proposalType, category, description, tags],
        value: BigInt(value),
      })
    } catch (err: any) {
      toast.error(err?.message || "Error submitting proposal.")
    } finally {
      setIsSubmitting(false)
    }
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
                  {/* Replace with actual vote weight from contract if needed */}
                  Your Vote Weight: {userEligibility.voteWeight}
                </div>
                <div className="flex items-center">
                  Staked: {userEligibility.stakedHbar} $HBAR
                </div>
              </div>
            </div>
            {/* Create Proposal Modal Trigger */}
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50"
              onClick={() => setIsCreateModalOpen(true)}
              disabled={!isConnected}
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Proposal
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Input
              placeholder="Search proposals by title, description, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="w-full lg:w-48 border rounded px-2 py-1"
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>{category.label}</option>
            ))}
          </select>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Proposals ({proposals.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({proposals.filter((p) => !p.finalized).length})</TabsTrigger>
            <TabsTrigger value="passed">Passed ({proposals.filter((p) => p.finalized && p.participation > 0).length})</TabsTrigger>
            <TabsTrigger value="failed">Failed ({proposals.filter((p) => p.finalized && p.participation === 0).length})</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Wallet Connection Warning */}
        {!isConnected && (
          <Card className="mb-8 bg-orange-50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-900">Connect Your Wallet</h3>
                  <p className="text-orange-700">
                    Connect your wallet to vote on proposals and create new ones.
                    Voting requires a small gas fee to prevent bot activity.
                  </p>
                </div>
                <Button className="bg-orange-600 hover:bg-orange-700">
                  Connect Wallet
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Proposals List */}
        <div className="space-y-6">
          {isProposalsLoading ? (
            <div>Loading proposals...</div>
          ) : filteredProposals.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <h3 className="text-xl font-semibold text-slate-600 mb-2">No Proposals Found</h3>
                <p className="text-slate-500 mb-4">
                  {searchTerm || selectedCategory !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "Be the first to create a proposal for the DAO!"}
                </p>
                {isConnected && (
                  <Button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                    Create First Proposal
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredProposals.map((proposal) => (
              <Card key={proposal.id} className="shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <CardTitle className="text-xl capitalize">{proposal.title}</CardTitle>
                        <Badge variant="outline" className={proposal.proposalType === "Major" ? "border-purple-300 text-purple-700 bg-purple-50" : "border-blue-300 text-blue-700 bg-blue-50"}>
                          {proposal.proposalType}
                        </Badge>
                        <Badge className={proposal.finalized ? "bg-blue-100 text-blue-800 border-blue-300" : "bg-green-100 text-green-800 border-green-300"}>
                          {proposal.finalized ? "Finalized" : "Active"}
                        </Badge>
                      </div>
                      <div className="text-base mb-3">{proposal.description}</div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {proposal.tags && proposal.tags.map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-sm text-slate-600 space-y-1">
                        <div>Fee: {proposal.feePaid} HBAR</div>
                        <div>Category: {proposal.category}</div>
                        <div>{proposal.finalized ? "Completed" : formatDeadline(Number(proposal.deadline))} left</div>
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
                          Vote weight: {proposal.participation}
                        </span>
                      </div>
                    </div>
                    {/* Proposal Meta */}
                    <div className="flex items-center justify-between text-sm text-slate-600 border-t pt-3">
                      <div className="flex items-center space-x-4">
                        <span>By: {proposal.proposer}</span>
                      </div>
                    </div>
                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      {/* View Details button placeholder */}
                      <Button variant="outline" className=" bg-transparent max-w-sm w-full">
                        View Details
                      </Button>
                      {!proposal.finalized && (
                        <>
                          <Button
                            onClick={() => handleVote(proposal.id, true)}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            disabled={!isConnected || isVoting === proposal.id}
                          >
                            Vote Yes
                          </Button>
                          <Button
                            onClick={() => handleVote(proposal.id, false)}
                            variant="outline"
                            className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                            disabled={!isConnected || isVoting === proposal.id}
                          >
                            Vote No
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Modal for creating proposal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 w-full max-w-3xl">
              <h2 className="text-xl font-bold mb-4">Create Proposal</h2>
              {/* Eligibility Check */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-blue-900 mb-3">Eligibility Status</h4>
                {userEligibility.canCreateProposal ? (
                  <div className="mt-3 flex items-center text-green-700">
                    <span className="mr-2">✔</span>
                    You are eligible to create proposals
                  </div>
                ) : (
                  <div className="mt-3 flex items-center text-red-700">
                    <span className="mr-2">✖</span>
                    You need to stake HBAR to create proposals
                  </div>
                )}
              </div>
              {/* Proposal Type Selection (Radio) */}
              <div className="mb-4">
                <label className="text-base font-semibold mb-2 block">Proposal Type</label>
                <div className="flex gap-4 mt-2">
                  <label className={`flex items-center space-x-2 p-4 border rounded-lg flex-1 cursor-pointer ${proposalType === "light" ? "bg-blue-50 border-blue-300" : ""}`}>
                    <input type="radio" name="proposalType" value="light" checked={proposalType === "light"} onChange={() => setProposalType("light")} className="accent-blue-600" />
                    <div className="flex-1">
                      <div className="font-medium">Light Proposal</div>
                      <div className="text-sm text-slate-600">Minor upgrades, bug fixes, small features</div>
                      <div className="text-xs text-slate-500 mt-1">Simpler form • Lower fee • Faster processing</div>
                      <span className="mt-2 block font-bold">5-10 HBAR</span>
                    </div>
                  </label>
                  <label className={`flex items-center space-x-2 p-4 border rounded-lg flex-1 cursor-pointer ${proposalType === "major" ? "bg-purple-50 border-purple-300" : ""}`}>
                    <input type="radio" name="proposalType" value="major" checked={proposalType === "major"} onChange={() => setProposalType("major")} className="accent-purple-600" />
                    <div className="flex-1">
                      <div className="font-medium">Major Proposal</div>
                      <div className="text-sm text-slate-600">Significant changes, tokenomics, partnerships</div>
                      <div className="text-xs text-slate-500 mt-1">Detailed form • Higher fee • Extended review</div>
                      <span className="mt-2 block font-bold">10 HBAR</span>
                    </div>
                  </label>
                </div>
              </div>
              {/* Proposal Form */}
              <Input className="w-full mb-2" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
              <div className="mb-2">
                <label className="text-sm font-semibold mb-1 block">Category</label>
                <select className="w-full border rounded px-2 py-1" value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="">Select category</option>
                  {categories.filter(c => c.value !== "all").map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <textarea className="w-full mb-2 p-2 border rounded" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
              <div className="mb-2">
                <label className="text-sm font-semibold mb-1 block">Tags (comma separated)</label>
                <Input className="w-full" placeholder="e.g., AI, Revenue, Smart Contracts" value={tags.join(", ")} onChange={e => setTags(e.target.value.split(",").map(t => t.trim()))} />
              </div>
              {/* Fee Display */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Proposal Submission Fee</span>
                  <span className="text-xl font-bold text-yellow-800">
                    {proposalType === "light" ? "5 HBAR" : "10 HBAR"}
                  </span>
                </div>
                <div className="text-sm text-slate-600 space-y-1">
                  <p>• Fee helps prevent spam and ensures quality proposals</p>
                  <p>• Payment goes directly to DAO treasury</p>
                  <p>• Transaction will be processed on Hedera blockchain</p>
                  <p>• You will be prompted to authorize payment in your wallet</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button className="flex-1 bg-gray-300 px-4 py-2 rounded" onClick={() => setIsCreateModalOpen(false)} disabled={isSubmitting}>Cancel</Button>
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded" onClick={handleCreateProposal} disabled={isSubmitting || !userEligibility.canCreateProposal}>
                  {isSubmitting ? "Creating..." : "Create Proposal"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
