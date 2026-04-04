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
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Gavel, Plus, Search, Filter, Shield, AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useWatchContractEvent, useReadContract } from "wagmi"
import { txSubmittedToast, txSuccessToast, txErrorToast } from "@/components/tx-toast"
import DisputeDeployment from "@/base-smart-contracts/deployments/baseSepolia/FreelanceDAODisputeV2.json"

const contractAddress = DisputeDeployment.address as `0x${string}`
const contractAbi     = DisputeDeployment.abi
const BASE_SEPOLIA_CHAIN_ID = 84532

export default function DisputesPage() {
  const { isAuthenticated } = useAuth()
  const { isConnected, address } = useAccount()

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

  const { writeContract, data: txHash, error: writeError, isPending: isSubmitting, reset } = useWriteContract()
  const { isLoading: isTxLoading, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  // Tx toasts
  useEffect(() => { if (txHash) txSubmittedToast(txHash, "Dispute submission") }, [txHash])
  useEffect(() => { if (isTxSuccess && txHash) txSuccessToast(txHash, "Dispute submitted") }, [isTxSuccess, txHash])
  useEffect(() => {
    if (writeError) txErrorToast(writeError.message?.slice(0, 120) || "Error creating dispute", txHash)
  }, [writeError])

  useWatchContractEvent({
    address: contractAddress,
    abi: contractAbi,
    eventName: "DisputeCreated",
    chainId: BASE_SEPOLIA_CHAIN_ID,
    onLogs: (logs: any[]) => {
      if (logs?.length > 0) {
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
    query: { enabled: typeof window !== 'undefined' && !!contractAddress },
  })

  const disputes: any[] = Array.isArray(disputesData) ? disputesData : []

  const disputeStats = React.useMemo(() => {
    let pending = 0, resolved = 0, escalated = 0, totalValue = 0
    disputes.forEach((d) => {
      if (d.status === 0) pending++
      else if (d.status === 1) resolved++
      else if (d.status === 2) escalated++
      if (d.amount) totalValue += Number(d.amount)
    })
    return { total: disputes.length, pending, resolved, escalated, totalValue }
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
    if (!isConnected) { txErrorToast("Please connect your wallet."); return }
    if (!jobId || !freelancer || !title || !amount || !category || !description) {
      txErrorToast("Please fill in all fields."); return
    }
    try {
      writeContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: "createDispute",
        args: [BigInt(jobId), freelancer, title, BigInt(amount), category, description],
      })
    } catch (err: any) {
      txErrorToast(err?.message || "Error submitting dispute.")
    }
  }

  const filteredDisputes = React.useMemo(() => {
    return disputes.filter((dispute) => {
      const titleStr = String(dispute.title ?? "")
      const idStr    = String(dispute.id ?? "")
      const catStr   = String(dispute.category ?? "")
      const matchesSearch   = titleStr.toLowerCase().includes(searchQuery.toLowerCase()) || idStr.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "all" || catStr.toLowerCase() === selectedCategory
      const matchesTab      =
        selectedTab === "all" ||
        (selectedTab === "pending"   && dispute.status === 0) ||
        (selectedTab === "resolved"  && dispute.status === 1) ||
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
              Transparent, decentralized dispute resolution powered by our community
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              {[
                { label: "Total Disputes", value: disputeStats.total },
                { label: "Value in Dispute", value: `${(disputeStats.totalValue / 1e18).toFixed(4)} ETH` },
                { label: "Pending", value: disputeStats.pending },
                { label: "Resolved", value: disputeStats.resolved },
              ].map((s) => (
                <div key={s.label} className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <p className="text-3xl font-bold">{s.value}</p>
                  <p className="text-blue-200">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {isAuthenticated && !isConnected && (
          <Card className="mb-8 bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
            <CardContent className="p-6 flex items-center gap-4">
              <AlertCircle className="w-6 h-6 text-orange-500" />
              <div className="flex-1">
                <h3 className="font-semibold text-orange-900">Connect Your Wallet</h3>
                <p className="text-orange-700 text-sm">Connect your wallet to submit disputes.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input placeholder="Search disputes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <Dialog open={isSubmitModalOpen} onOpenChange={setIsSubmitModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg" disabled={!isConnected}>
                <Plus className="w-4 h-4 mr-2" />Submit Dispute
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center"><Gavel className="w-5 h-5 mr-2" />Submit a Dispute</DialogTitle>
                <DialogDescription>Recorded permanently on Base blockchain.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div><Label>Job ID *</Label><Input type="number" placeholder="Job ID" value={jobId} onChange={(e) => setJobId(e.target.value)} className="mt-1" /></div>
                <div><Label>Freelancer Address *</Label><Input placeholder="0x..." value={freelancer} onChange={(e) => setFreelancer(e.target.value)} className="mt-1" /></div>
                <div><Label>Title *</Label><Input placeholder="Dispute title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1" /></div>
                <div><Label>Amount (in Wei) *</Label><Input type="number" placeholder="Amount in Wei" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1" /></div>
                <div><Label>Category *</Label><Input placeholder="e.g. payment, quality, timeline" value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1" /></div>
                <div><Label>Description *</Label><Textarea placeholder="Detailed description..." value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 min-h-32" /></div>
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={() => setIsSubmitModalOpen(false)} className="flex-1" disabled={isSubmitting}>Cancel</Button>
                  <Button onClick={handleCreateDispute} disabled={isSubmitting || isTxLoading} className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600">
                    {(isSubmitting || isTxLoading) ? (
                      <div className="flex items-center"><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />Submitting...</div>
                    ) : "Submit to Blockchain"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs and List */}
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
                      <Badge variant="outline" className="ml-2">{String(dispute.disputeId)}</Badge>
                    </CardTitle>
                    <CardDescription>
                      Status: {dispute.status === 0 ? "Pending" : dispute.status === 1 ? "Resolved" : "Escalated"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span><strong>Client:</strong> {String(dispute.client).length > 10 ? `${String(dispute.client).slice(0,6)}...${String(dispute.client).slice(-4)}` : String(dispute.client)}</span>
                      <span><strong>Freelancer:</strong> {String(dispute.freelancer).length > 10 ? `${String(dispute.freelancer).slice(0,6)}...${String(dispute.freelancer).slice(-4)}` : String(dispute.freelancer)}</span>
                      <span><strong>Amount:</strong> {String(dispute.amount)} Wei</span>
                      <span><strong>Category:</strong> {dispute.category}</span>
                    </div>
                    <div><strong>Description:</strong> <p className="text-gray-700">{dispute.description}</p></div>
                    <div className="flex gap-6 text-sm">
                      <span><strong>Votes for Client:</strong> {String(dispute.votesForClient)}</span>
                      <span><strong>Votes for Freelancer:</strong> {String(dispute.votesForFreelancer)}</span>
                      <span><strong>Winner:</strong> {dispute.winner === "0x0000000000000000000000000000000000000000" ? "TBD" : `${String(dispute.winner).slice(0,6)}...${String(dispute.winner).slice(-4)}`}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredDisputes.length === 0 && (
                <Card className="text-center py-12">
                  <CardContent>
                    <Gavel className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Disputes Found</h3>
                    <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
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