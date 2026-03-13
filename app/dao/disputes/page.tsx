"use client"

import React from "react"
import { useState, useEffect } from "react"
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
import {
  Gavel,
  Plus,
  Search,
  Filter,
  Shield,
  AlertCircle,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useWatchContractEvent, useReadContract } from "wagmi"
import DisputeDeployment from "@/base-smart-contracts/deployments/baseSepolia/FreelanceDAODisputeV2.json"

const contractAddress = DisputeDeployment.address as `0x${string}`
const contractAbi     = DisputeDeployment.abi
const BASE_SEPOLIA_CHAIN_ID = 84532

export default function DisputesPage() {
  const { user, isAuthenticated } = useAuth()
  const { isConnected, address } = useAccount()

  if (address) {
    console.log("Connected address:", address)
  }

  const [selectedTab, setSelectedTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)

  const [jobId, setJobId] = useState("")
  const [freelancer, setFreelancer] = useState("")
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")

  const { writeContract, data: txData, error: writeError, isPending: isSubmitting, reset } = useWriteContract()

  const txHash = typeof txData === 'object' && txData !== null && 'hash' in txData
    ? (txData as any).hash
    : undefined

  const { isLoading: isTxLoading } = useWaitForTransactionReceipt({ hash: txHash })

  useEffect(() => {
    if (writeError) {
      toast.error(writeError.message || "Error creating dispute")
      console.error("error:", writeError)
    }
  }, [writeError])

  useWatchContractEvent({
    address: contractAddress,
    abi: contractAbi,
    eventName: "DisputeCreated",
    chainId: BASE_SEPOLIA_CHAIN_ID,
    onLogs: (logs: any[]) => {
      if (logs && logs.length > 0) {
        toast.success("Dispute created successfully!")
        setIsSubmitModalOpen(false)
        setJobId(""); setFreelancer(""); setTitle(""); setAmount(""); setCategory(""); setDescription("")
        reset()
        refetchDisputes()
      }
    },
  })

  const { data: disputesData, isLoading: isDisputesLoading, refetch: refetchDisputes } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: "getAllDisputes",
    chainId: BASE_SEPOLIA_CHAIN_ID,
    query: {
      enabled: typeof window !== 'undefined' && !!contractAddress,
    },
  })

  const disputes: any[] = Array.isArray(disputesData) ? disputesData : []

  const disputeStats = React.useMemo(() => {
    const total = disputes.length
    let pending = 0, resolved = 0, escalated = 0, totalValue = 0
    disputes.forEach((d) => {
      if (d.status === 0 || d.status === "0") pending++
      else if (d.status === 1 || d.status === "1") resolved++
      else if (d.status === 2 || d.status === "2") escalated++
      if (d.amount) totalValue += Number(d.amount)
    })
    return { total, pending, resolved, escalated, totalValue, avgResolutionTime: 0, satisfactionRate: 0 }
  }, [disputes])

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "payment", label: "Payment" },
    { value: "quality", label: "Quality" },
    { value: "scope", label: "Scope" },
    { value: "timeline", label: "Timeline" },
    { value: "ip-rights", label: "IP Rights" },
    { value: "other", label: "Other" },
  ]

  const handleCreateDispute = async () => {
    if (!isConnected) { toast.error("Please connect your wallet."); return }
    if (!jobId || !freelancer || !title || !amount || !category || !description) {
      toast.error("Please fill in all fields."); return
    }
    try {
      writeContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: "createDispute",
        args: [BigInt(jobId), freelancer, title, BigInt(amount), category, description],
      })
      setTimeout(() => toast.success("Dispute submitted successfully!"), 5000)
    } catch (err: any) {
      toast.error(err?.message || "Error submitting dispute.")
    }
  }

  const filteredDisputes = React.useMemo(() => {
    return disputes.filter((dispute) => {
      const titleStr = typeof dispute.title === "string" ? dispute.title : String(dispute.title ?? "")
      const idStr = typeof dispute.id === "string" ? dispute.id : String(dispute.id ?? "")
      const matchesSearch =
        titleStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        idStr.toLowerCase().includes(searchQuery.toLowerCase())
      const categoryStr = typeof dispute.category === "string" ? dispute.category : String(dispute.category ?? "")
      const matchesCategory = selectedCategory === "all" || categoryStr.toLowerCase() === selectedCategory
      const matchesTab =
        selectedTab === "all" ||
        (selectedTab === "pending" && dispute.status === 0) ||
        (selectedTab === "resolved" && dispute.status === 1) ||
        (selectedTab === "escalated" && dispute.status === 2)
      return matchesSearch && matchesCategory && matchesTab
    })
  }, [disputes, searchQuery, selectedCategory, selectedTab])

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
                <p className="text-3xl font-bold">${(disputeStats.totalValue / 1e18).toFixed(2)} ETH</p>
                <p className="text-blue-200">Value in Dispute</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <p className="text-3xl font-bold">{disputeStats.pending}</p>
                <p className="text-blue-200">Pending</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <p className="text-3xl font-bold">{disputeStats.resolved}</p>
                <p className="text-blue-200">Resolved</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Wallet Connection Warning */}
        {isAuthenticated && !isConnected && (
          <Card className="mb-8 bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertCircle className="w-6 h-6 text-orange-500 mr-3" />
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-900">Connect Your Wallet</h3>
                  <p className="text-orange-700">Connect your wallet to submit disputes and participate in resolution.</p>
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
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Dialog open={isSubmitModalOpen} onOpenChange={setIsSubmitModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg" disabled={!isConnected}>
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
                  Provide the job ID and details. This will be recorded on Base blockchain.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div>
                  <Label htmlFor="jobId">Job ID *</Label>
                  <Input id="jobId" type="number" placeholder="Enter the job ID" value={jobId} onChange={(e) => setJobId(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="freelancer">Freelancer Address *</Label>
                  <Input id="freelancer" placeholder="0x..." value={freelancer} onChange={(e) => setFreelancer(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input id="title" placeholder="Dispute title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="amount">Amount (in Wei) *</Label>
                  <Input id="amount" type="number" placeholder="Amount in Wei" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Input id="category" placeholder="e.g. payment, quality, timeline" value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea id="description" placeholder="Provide a detailed description..." value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 min-h-32" />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsSubmitModalOpen(false)} className="flex-1" disabled={isSubmitting}>Cancel</Button>
                  <Button onClick={handleCreateDispute} disabled={isSubmitting || isTxLoading} className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600">
                    {(isSubmitting || isTxLoading) ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </div>
                    ) : "Submit Dispute to Blockchain"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs and Dispute List */}
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
                <Card key={dispute.disputeId} className="shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-blue-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gavel className="w-5 h-5 text-blue-600" />
                      {dispute.title}
                      <Badge variant="outline" className="ml-2">{dispute.disputeId}</Badge>
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-500">
                      Status: <span className="font-mono">
                        {dispute.status === 0 ? "Pending" : dispute.status === 1 ? "Resolved" : "Escalated"}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span><strong>Client:</strong> {typeof dispute.client === 'string' && dispute.client.length > 10 ? `${dispute.client.slice(0, 6)}...${dispute.client.slice(-4)}` : dispute.client}</span>
                      <span><strong>Freelancer:</strong> {typeof dispute.freelancer === 'string' && dispute.freelancer.length > 10 ? `${dispute.freelancer.slice(0, 6)}...${dispute.freelancer.slice(-4)}` : dispute.freelancer}</span>
                      <span><strong>Amount:</strong> {dispute.amount?.toString()} Wei</span>
                      <span><strong>Category:</strong> {dispute.category}</span>
                    </div>
                    <div className="mt-2">
                      <strong>Description:</strong>
                      <div className="text-gray-700 whitespace-pre-line">{dispute.description}</div>
                    </div>
                    <div className="flex gap-6 mt-2 text-sm">
                      <span><strong>Votes for Client:</strong> {dispute.votesForClient?.toString()}</span>
                      <span><strong>Votes for Freelancer:</strong> {dispute.votesForFreelancer?.toString()}</span>
                      <span><strong>Winner:</strong> {
                        dispute.winner === "0x0000000000000000000000000000000000000000"
                          ? "TBD"
                          : typeof dispute.winner === 'string' && dispute.winner.length > 10
                            ? `${dispute.winner.slice(0, 6)}...${dispute.winner.slice(-4)}`
                            : dispute.winner
                      }</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredDisputes.length === 0 && (
                <Card className="text-center py-12">
                  <CardContent>
                    <Gavel className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Disputes Found</h3>
                    <p className="text-gray-600">
                      {searchQuery || selectedCategory !== "all"
                        ? "Try adjusting your search or filter criteria."
                        : "No disputes match the selected tab."}
                    </p>
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
