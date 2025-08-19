"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  Lock,
  Unlock,
  FileText,
  Calendar,
  Briefcase,
  ArrowRight,
  ExternalLink,
} from "lucide-react"
import { useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"

export default function EscrowPage() {
  const [selectedEscrow, setSelectedEscrow] = useState(0)

  const escrowContracts = [
    {
      id: "ESC-001",
      project: "E-commerce Website Development",
      client: "TechStartup Inc.",
      freelancer: "Sarah Johnson",
      totalAmount: "3,500 HBAR",
      lockedAmount: "2,100 HBAR",
      releasedAmount: "1,400 HBAR",
      status: "Active",
      progress: 60,
      milestones: [
        { name: "Project Setup & Planning", amount: "700 HBAR", status: "Released", date: "Dec 1, 2024" },
        { name: "Homepage & Navigation", amount: "700 HBAR", status: "Released", date: "Dec 8, 2024" },
        { name: "Product Catalog", amount: "1,050 HBAR", status: "Locked", date: "Dec 15, 2024" },
        { name: "Shopping Cart & Checkout", amount: "1,050 HBAR", status: "Pending", date: "Dec 22, 2024" },
      ],
      contractAddress: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
      createdDate: "Nov 28, 2024",
      deadline: "Dec 30, 2024",
    },
    {
      id: "ESC-002",
      project: "Smart Contract Security Audit",
      client: "CryptoLabs",
      freelancer: "Mike Auditor",
      totalAmount: "4,800 HBAR",
      lockedAmount: "4,800 HBAR",
      releasedAmount: "0 HBAR",
      status: "Locked",
      progress: 25,
      milestones: [
        { name: "Initial Code Review", amount: "1,200 HBAR", status: "Locked", date: "Dec 10, 2024" },
        { name: "Vulnerability Assessment", amount: "1,800 HBAR", status: "Pending", date: "Dec 17, 2024" },
        { name: "Final Report & Recommendations", amount: "1,800 HBAR", status: "Pending", date: "Dec 24, 2024" },
      ],
      contractAddress: "0x8D4C0532925a3b8D4C0532925a3b8D4C0532925a",
      createdDate: "Dec 5, 2024",
      deadline: "Dec 25, 2024",
    },
    {
      id: "ESC-003",
      project: "Mobile App UI Design",
      client: "DesignCorp",
      freelancer: "Anna Designer",
      totalAmount: "2,200 HBAR",
      lockedAmount: "0 HBAR",
      releasedAmount: "2,200 HBAR",
      status: "Completed",
      progress: 100,
      milestones: [
        { name: "Wireframes & User Flow", amount: "550 HBAR", status: "Released", date: "Nov 20, 2024" },
        { name: "UI Design & Prototyping", amount: "1,100 HBAR", status: "Released", date: "Nov 27, 2024" },
        { name: "Final Assets & Handoff", amount: "550 HBAR", status: "Released", date: "Dec 3, 2024" },
      ],
      contractAddress: "0x925a3b8D4C0532925a3b8D4C0532925a3b8D4C05",
      createdDate: "Nov 15, 2024",
      deadline: "Dec 5, 2024",
    },
  ]

  const currentEscrow = escrowContracts[selectedEscrow]

  return (
    <ProtectedRoute requireAuth={true} requireWallet={true} requireCompleteProfile={true}>
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-200">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Smart Contract Escrow</h1>
                <p className="text-slate-600">Secure payments powered by Hedera Hashgraph</p>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  <Shield className="w-4 h-4 mr-1" />
                  Blockchain Secured
                </Badge>
                <Button className="bg-blue-500 hover:bg-blue-600">
                  <FileText className="w-4 h-4 mr-2" />
                  View Documentation
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Escrow List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-800">Your Escrow Contracts</h2>
            {escrowContracts.map((escrow, index) => (
              <Card
                key={escrow.id}
                className={`cursor-pointer transition-all ${
                  selectedEscrow === index ? "ring-2 ring-blue-500 border-blue-200" : "hover:shadow-md"
                }`}
                onClick={() => setSelectedEscrow(index)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variant="outline" className="mb-2 font-mono text-xs">
                        {escrow.id}
                      </Badge>
                      <CardTitle className="text-lg">{escrow.project}</CardTitle>
                    </div>
                    <Badge
                      className={
                        escrow.status === "Active"
                          ? "bg-blue-100 text-blue-700"
                          : escrow.status === "Completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                      }
                    >
                      {escrow.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Total Value:</span>
                      <span className="font-semibold text-green-600">{escrow.totalAmount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Progress:</span>
                      <span className="font-medium">{escrow.progress}%</span>
                    </div>
                    <Progress value={escrow.progress} className="h-2" />
                    <div className="flex items-center space-x-2 text-xs text-slate-500">
                      <Calendar className="w-3 h-3" />
                      <span>Due: {escrow.deadline}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Escrow Details */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="milestones">Milestones</TabsTrigger>
                <TabsTrigger value="contract">Contract</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Project Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Briefcase className="w-5 h-5 mr-2 text-blue-500" />
                      Project Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-slate-800 mb-2">{currentEscrow.project}</h4>
                          <div className="flex items-center space-x-2 text-sm text-slate-600">
                            <Badge variant="outline" className="font-mono">
                              {currentEscrow.id}
                            </Badge>
                            <span>•</span>
                            <span>Created {currentEscrow.createdDate}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm text-slate-600">Client</span>
                            <div className="flex items-center space-x-2 mt-1">
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                                  {currentEscrow.client[0]}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium">{currentEscrow.client}</span>
                            </div>
                          </div>
                          <div>
                            <span className="text-sm text-slate-600">Freelancer</span>
                            <div className="flex items-center space-x-2 mt-1">
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className="text-xs bg-green-100 text-green-600">
                                  {currentEscrow.freelancer[0]}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium">{currentEscrow.freelancer}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{currentEscrow.totalAmount}</div>
                            <div className="text-sm text-green-700">Total Value</div>
                          </div>
                          <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{currentEscrow.progress}%</div>
                            <div className="text-sm text-blue-700">Complete</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-yellow-50 rounded-lg">
                            <div className="text-lg font-semibold text-yellow-600">{currentEscrow.lockedAmount}</div>
                            <div className="text-xs text-yellow-700">Locked</div>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-lg font-semibold text-green-600">{currentEscrow.releasedAmount}</div>
                            <div className="text-xs text-green-700">Released</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Security Features */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="w-5 h-5 mr-2 text-green-500" />
                      Security Features
                    </CardTitle>
                    <CardDescription>How your funds are protected</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 border border-green-200 rounded-lg">
                        <Lock className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <h4 className="font-semibold text-slate-800 mb-1">Smart Contract Escrow</h4>
                        <p className="text-sm text-slate-600">Funds locked in tamper-proof smart contracts</p>
                      </div>
                      <div className="text-center p-4 border border-blue-200 rounded-lg">
                        <CheckCircle className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <h4 className="font-semibold text-slate-800 mb-1">Milestone-Based Release</h4>
                        <p className="text-sm text-slate-600">Payments released only when work is approved</p>
                      </div>
                      <div className="text-center p-4 border border-purple-200 rounded-lg">
                        <AlertTriangle className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                        <h4 className="font-semibold text-slate-800 mb-1">Dispute Protection</h4>
                        <p className="text-sm text-slate-600">Built-in dispute resolution mechanism</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="milestones" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-purple-500" />
                      Project Milestones
                    </CardTitle>
                    <CardDescription>Track progress and payment releases</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {currentEscrow.milestones.map((milestone, index) => (
                        <div key={index} className="flex items-center space-x-4 p-4 border border-slate-200 rounded-lg">
                          <div className="flex-shrink-0">
                            {milestone.status === "Released" ? (
                              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              </div>
                            ) : milestone.status === "Locked" ? (
                              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                                <Lock className="w-5 h-5 text-yellow-600" />
                              </div>
                            ) : (
                              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                                <Clock className="w-5 h-5 text-slate-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-800">{milestone.name}</h4>
                            <p className="text-sm text-slate-600">Due: {milestone.date}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-green-600">{milestone.amount}</div>
                            <Badge
                              variant="secondary"
                              className={
                                milestone.status === "Released"
                                  ? "bg-green-100 text-green-700"
                                  : milestone.status === "Locked"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-slate-100 text-slate-700"
                              }
                            >
                              {milestone.status}
                            </Badge>
                          </div>
                          {milestone.status === "Locked" && (
                            <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
                              <Unlock className="w-4 h-4 mr-1" />
                              Release
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="contract" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-blue-500" />
                      Smart Contract Details
                    </CardTitle>
                    <CardDescription>Blockchain contract information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        This escrow is secured by a smart contract on the Hedera Hashgraph network. All transactions are
                        immutable and transparent.
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-slate-700">Contract Address</span>
                          <div className="flex items-center space-x-2 mt-1">
                            <code className="text-sm bg-slate-100 px-2 py-1 rounded font-mono">
                              {currentEscrow.contractAddress}
                            </code>
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-slate-700">Network</span>
                          <p className="text-sm text-slate-600 mt-1">Hedera Hashgraph Mainnet</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-slate-700">Contract Type</span>
                          <p className="text-sm text-slate-600 mt-1">Milestone-based Escrow</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-slate-700">Created</span>
                          <p className="text-sm text-slate-600 mt-1">{currentEscrow.createdDate}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-slate-700">Status</span>
                          <Badge className="mt-1 bg-blue-100 text-blue-700">{currentEscrow.status}</Badge>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-slate-700">Gas Fees</span>
                          <p className="text-sm text-slate-600 mt-1">Covered by FreeLanceDAO</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button variant="outline">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View on Explorer
                      </Button>
                      <Button variant="outline">
                        <FileText className="w-4 h-4 mr-2" />
                        Download Contract
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-purple-500" />
                      Transaction History
                    </CardTitle>
                    <CardDescription>All escrow-related transactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        {
                          type: "Contract Created",
                          amount: currentEscrow.totalAmount,
                          date: currentEscrow.createdDate,
                          txHash: "0x1a2b3c4d5e6f...",
                          status: "Confirmed",
                        },
                        {
                          type: "Milestone Released",
                          amount: "700 HBAR",
                          date: "Dec 1, 2024",
                          txHash: "0x2b3c4d5e6f7a...",
                          status: "Confirmed",
                        },
                        {
                          type: "Milestone Released",
                          amount: "700 HBAR",
                          date: "Dec 8, 2024",
                          txHash: "0x3c4d5e6f7a8b...",
                          status: "Confirmed",
                        },
                      ].map((tx, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 border border-slate-200 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <ArrowRight className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-slate-800">{tx.type}</h4>
                              <p className="text-sm text-slate-600">{tx.date}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-green-600">{tx.amount}</div>
                            <div className="flex items-center space-x-2">
                              <Badge className="bg-green-100 text-green-700">{tx.status}</Badge>
                              <Button variant="ghost" size="sm">
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
