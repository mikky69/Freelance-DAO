"use client"

import React, { useState, useEffect } from "react"
import { useAccount, usePublicClient } from "wagmi"
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useWatchContractEvent } from "wagmi"
import { parseEther } from "viem"
import ProposalsDeployment from "@/base-smart-contracts/deployments/baseSepolia/FreelanceDAOProposals.json"
import StakingDeployment   from "@/base-smart-contracts/deployments/baseSepolia/FreelanceDAOStaking.json"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { txSubmittedToast, txSuccessToast, txErrorToast } from "@/components/tx-toast"
import { Plus } from "lucide-react"

const contractAddress = ProposalsDeployment.address as `0x${string}`
const contractAbi     = ProposalsDeployment.abi
const stakingAddress  = StakingDeployment.address as `0x${string}`
const stakingAbi      = StakingDeployment.abi
const BASE_SEPOLIA_CHAIN_ID = 84532

const MINOR_FEE = parseEther("0.001")
const MAJOR_FEE = parseEther("0.005")

function formatDeadline(deadline: number) {
  const now = Math.floor(Date.now() / 1000)
  let diff = deadline - now
  if (diff <= 0) return "Finalized"
  const days = Math.floor(diff / 86400); diff -= days * 86400
  const hours = Math.floor(diff / 3600); diff -= hours * 3600
  const minutes = Math.floor(diff / 60)
  return `${days}d ${hours}h ${minutes}m left`
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

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "Tokenomics", label: "Tokenomics" },
    { value: "Platform", label: "Platform" },
    { value: "Bug Fix", label: "Bug Fixes" },
    { value: "Governance", label: "Governance" },
    { value: "Security", label: "Security" },
  ]

  const { isConnected, address } = useAccount()
  const publicClient = usePublicClient()
  const { writeContract, data: txHash, error: writeError, isPending: isWritePending, reset } = useWriteContract()
  const { isLoading: isTxLoading, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  // Tx toasts
  useEffect(() => { if (txHash) txSubmittedToast(txHash, "Transaction") }, [txHash])
  useEffect(() => { if (isTxSuccess && txHash) txSuccessToast(txHash, "Transaction") }, [isTxSuccess, txHash])
  useEffect(() => {
    if (writeError) txErrorToast(writeError.message?.slice(0, 120) || "Contract write error", txHash)
  }, [writeError, txHash])

  const { data: proposalsData, isLoading: isProposalsLoading, refetch: refetchProposals } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: "getAllProposals",
    chainId: BASE_SEPOLIA_CHAIN_ID,
    query: { enabled: typeof window !== 'undefined' && !!contractAddress },
  })

  useWatchContractEvent({
    address: contractAddress,
    abi: contractAbi,
    eventName: "ProposalCreated",
    chainId: BASE_SEPOLIA_CHAIN_ID,
    onLogs: () => {
      setIsCreateModalOpen(false)
      setTitle(""); setProposalType("light"); setCategory(""); setDescription(""); setTags([])
      reset()
      refetchProposals()
    },
  })

  const proposals: any[] = React.useMemo(() => {
    if (!proposalsData || !Array.isArray(proposalsData) || proposalsData.length === 0) return []
    return proposalsData.map((p: any) => ({
      id: p.id, proposer: p.proposer, title: p.title, proposalType: p.proposalType,
      category: p.category, description: p.description,
      yesVotes: Number(p.yesVotes ?? 0), noVotes: Number(p.noVotes ?? 0),
      tags: p.tags, deadline: p.deadline, finalized: p.finalized,
      feePaid: Number(p.feePaid ?? 0) / 1e18, participation: Number(p.participation ?? 0),
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

  const { data: userStakeData, refetch: refetchStake } = useReadContract({
    address: stakingAddress, abi: stakingAbi, functionName: "getStakedAmount",
    args: address ? [address] : undefined,
    chainId: BASE_SEPOLIA_CHAIN_ID,
    query: { enabled: !!address },
  })

  const handleVote = async (proposalId: number, support: boolean) => {
    if (!isConnected) { txErrorToast("Please connect your wallet to vote."); return }
    await refetchStake()
    const stakeAmount = userStakeData ? Number(userStakeData) : 0
    if (!stakeAmount || stakeAmount === 0) {
      txErrorToast("You must stake tokens before you can vote on proposals."); return
    }

    let hasVoted = false
    try {
      if (!publicClient || !address) { txErrorToast("Wallet not available."); return }
      const hv = await publicClient.readContract({
        address: contractAddress, abi: contractAbi, functionName: "hasVoted", args: [proposalId, address],
      }) as any
      hasVoted = !!hv
    } catch (e) { console.error("hasVoted read error", e) }

    if (hasVoted) { txErrorToast("You have already voted on this proposal."); return }

    let proposalDeadline = 0
    try {
      if (!publicClient) return
      const p = await publicClient.readContract({
        address: contractAddress, abi: contractAbi, functionName: "getProposal", args: [proposalId],
      }) as any
      proposalDeadline = Number(p?.deadline ?? p?.[8] ?? 0)
    } catch (e) { console.error("getProposal read error", e) }

    if (proposalDeadline && Math.floor(Date.now() / 1000) > proposalDeadline) {
      txErrorToast("Voting period has ended for this proposal."); return
    }

    setIsVoting(proposalId)
    try {
      writeContract({ address: contractAddress, abi: contractAbi, functionName: "vote", args: [proposalId, support] })
    } catch (err: any) {
      txErrorToast(err?.message || "Error submitting vote.")
    } finally {
      setIsVoting(null)
      refetchProposals()
    }
  }

  const handleCreateProposal = async () => {
    if (!isConnected) { txErrorToast("Please connect your wallet."); return }
    if (!title || !proposalType || !category || !description) { txErrorToast("Please fill in all fields."); return }
    setIsSubmitting(true)
    try {
      const fee = proposalType === "light" ? MINOR_FEE : MAJOR_FEE
      writeContract({
        address: contractAddress, abi: contractAbi, functionName: "createProposal",
        args: [title, proposalType, category, description, tags],
        value: fee,
      })
    } catch (err: any) {
      txErrorToast(err?.message || "Error submitting proposal.")
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
              <div className="text-sm">On Base Sepolia · {proposals.length} proposal{proposals.length !== 1 ? "s" : ""}</div>
            </div>
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50" onClick={() => setIsCreateModalOpen(true)} disabled={!isConnected}>
              <Plus className="w-5 h-5 mr-2" />Create Proposal
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Input placeholder="Search proposals..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-4" />
          </div>
          <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="w-full lg:w-48 border rounded px-2 py-2">
            {categories.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
          </select>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({proposals.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({proposals.filter(p => !p.finalized).length})</TabsTrigger>
            <TabsTrigger value="passed">Passed ({proposals.filter(p => p.finalized && p.participation > 0).length})</TabsTrigger>
            <TabsTrigger value="failed">Failed ({proposals.filter(p => p.finalized && p.participation === 0).length})</TabsTrigger>
          </TabsList>
        </Tabs>

        {!isConnected && (
          <Card className="mb-8 bg-orange-50 border-orange-200">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-orange-900">Connect Your Wallet</h3>
                <p className="text-orange-700 text-sm">Connect your wallet to vote and create proposals.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Proposals List */}
        <div className="space-y-6">
          {isProposalsLoading ? (
            <div className="text-center py-12 text-slate-500">Loading proposals...</div>
          ) : filteredProposals.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <h3 className="text-xl font-semibold text-slate-600 mb-2">No Proposals Found</h3>
                <p className="text-slate-500 mb-4">
                  {searchTerm || selectedCategory !== "all" ? "Try adjusting your filters." : "Be the first to create a proposal!"}
                </p>
                {isConnected && <Button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">Create First Proposal</Button>}
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
                        <Badge variant="outline" className={proposal.proposalType === "major" ? "border-purple-300 text-purple-700 bg-purple-50" : "border-blue-300 text-blue-700 bg-blue-50"}>
                          {proposal.proposalType}
                        </Badge>
                        <Badge className={proposal.finalized ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}>
                          {proposal.finalized ? "Finalized" : "Active"}
                        </Badge>
                      </div>
                      <div className="text-base mb-3">{proposal.description}</div>
                      <div className="flex flex-wrap gap-2">
                        {proposal.tags?.map((tag: string) => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}
                      </div>
                    </div>
                    <div className="text-right ml-4 text-sm text-slate-600 space-y-1">
                      <div>Fee: {proposal.feePaid.toFixed(4)} ETH</div>
                      <div>Category: {proposal.category}</div>
                      <div>{proposal.finalized ? "Completed" : formatDeadline(Number(proposal.deadline))}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-slate-600 border-t pt-3 mb-3">
                    <span>By: {String(proposal.proposer).length > 10 ? `${String(proposal.proposer).slice(0,6)}...${String(proposal.proposer).slice(-4)}` : proposal.proposer}</span>
                    <span className="flex gap-4">
                      <span className="text-green-600 font-medium">Yes: {proposal.yesVotes}</span>
                      <span className="text-red-500 font-medium">No: {proposal.noVotes}</span>
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" className="max-w-sm w-full">View Details</Button>
                    {!proposal.finalized && (
                      <>
                        <Button onClick={() => handleVote(proposal.id, true)} className="flex-1 bg-green-600 hover:bg-green-700" disabled={!isConnected || isVoting === proposal.id}>
                          {isVoting === proposal.id ? "Submitting..." : "Vote Yes"}
                        </Button>
                        <Button onClick={() => handleVote(proposal.id, false)} variant="outline" className="flex-1 border-red-300 text-red-600 hover:bg-red-50" disabled={!isConnected || isVoting === proposal.id}>
                          Vote No
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Create Proposal Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Create Proposal</h2>
              <div className="mb-4">
                <label className="text-base font-semibold mb-2 block">Proposal Type</label>
                <div className="flex gap-4 mt-2">
                  {[
                    { value: "light", label: "Minor Proposal", desc: "Bug fixes, small features", fee: "0.001 ETH" },
                    { value: "major", label: "Major Proposal", desc: "Significant changes, tokenomics", fee: "0.005 ETH" },
                  ].map((opt) => (
                    <label key={opt.value} className={`flex items-center space-x-2 p-4 border rounded-lg flex-1 cursor-pointer ${proposalType === opt.value ? "bg-blue-50 border-blue-300" : ""}`}>
                      <input type="radio" name="proposalType" value={opt.value} checked={proposalType === opt.value} onChange={() => setProposalType(opt.value)} />
                      <div className="flex-1">
                        <div className="font-medium">{opt.label}</div>
                        <div className="text-sm text-slate-500">{opt.desc}</div>
                        <span className="mt-1 block font-bold text-sm">{opt.fee}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <Input className="w-full mb-2" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
              <div className="mb-2">
                <label className="text-sm font-semibold mb-1 block">Category</label>
                <select className="w-full border rounded px-2 py-2" value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="">Select category</option>
                  {categories.filter(c => c.value !== "all").map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <textarea className="w-full mb-2 p-2 border rounded" placeholder="Description" rows={4} value={description} onChange={e => setDescription(e.target.value)} />
              <div className="mb-4">
                <label className="text-sm font-semibold mb-1 block">Tags (comma separated)</label>
                <Input placeholder="e.g., Governance, Security" value={tags.join(", ")} onChange={e => setTags(e.target.value.split(",").map(t => t.trim()))} />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm text-slate-600">
                <p className="font-medium text-blue-900">Fee: {proposalType === "light" ? "0.001" : "0.005"} ETH — goes to DAO treasury</p>
              </div>
              <div className="flex gap-3">
                <Button className="flex-1" variant="outline" onClick={() => setIsCreateModalOpen(false)} disabled={isSubmitting}>Cancel</Button>
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleCreateProposal} disabled={isSubmitting || !isConnected}>
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