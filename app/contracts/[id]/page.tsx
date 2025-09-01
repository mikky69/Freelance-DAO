"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  FileText,
  CheckCircle,
  Clock,
  DollarSign,
  User,
  Calendar,
  Shield,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import { useParams } from "next/navigation"

interface Contract {
  _id: string;
  title: string;
  description: string;
  status: string;
  budget: {
    amount: number;
    currency: string;
  };
  milestones: {
    name: string;
    description: string;
    amount: number;
    duration: string;
    completed: boolean;
  }[];
  paymentTerms: {
    escrowAmount: number;
    releaseConditions: string;
    penaltyClause: string;
  };
  signatures: {
    client: {
      signed: boolean;
      signedAt?: string;
    };
    freelancer: {
      signed: boolean;
      signedAt?: string;
    };
  };
  escrow: {
    funded: boolean;
    fundedAt?: string;
    amount: number;
    currency: string;
  };
  job: {
    title: string;
    description: string;
    category: string;
    skills: string[];
    deadline?: string;
  };
  client: {
    fullname: string;
    email: string;
    avatar?: string;
  };
  freelancer: {
    fullname: string;
    email: string;
    avatar?: string;
  };
  proposal: {
    title: string;
    description: string;
    timeline: string;
  };
  createdAt: string;
  startDate?: string;
  endDate?: string;
}

function ContractContent() {
  const { user } = useAuth()
  const params = useParams()
  const contractId = params.id as string
  
  const [contract, setContract] = useState<Contract | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [signing, setSigning] = useState(false)
  const [escrowing, setEscrowing] = useState(false)
  const [showSignDialog, setShowSignDialog] = useState(false)
  
  useEffect(() => {
    const fetchContract = async () => {
      try {
        const token = localStorage.getItem('freelancedao_token')
        if (!token) {
          setError('Please log in to view contract')
          return
        }
        
        const response = await fetch(`/api/contracts/${contractId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Failed to fetch contract')
        }
        
        const data = await response.json()
        setContract(data.contract)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load contract')
        console.error('Error fetching contract:', err)
      } finally {
        setLoading(false)
      }
    }
    
    if (contractId) {
      fetchContract()
    }
  }, [contractId])
  
  const handleSign = async () => {
    if (!contract) return
    
    setSigning(true)
    try {
      const token = localStorage.getItem('freelancedao_token')
      const response = await fetch(`/api/contracts/${contractId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'sign',
          signature: `Digital signature - ${new Date().toISOString()}`
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to sign contract')
      }
      
      const data = await response.json()
      toast.success('Contract signed successfully!')
      setShowSignDialog(false)
      
      // Refresh contract data
      window.location.reload()
    } catch (error) {
      console.error('Error signing contract:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to sign contract')
    } finally {
      setSigning(false)
    }
  }
  
  const handleEscrow = async () => {
    if (!contract) return
    
    setEscrowing(true)
    try {
      const token = localStorage.getItem('freelancedao_token')
      const response = await fetch(`/api/contracts/${contractId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'escrow' }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to escrow funds')
      }
      
      toast.success('Funds escrowed successfully!')
      
      // Refresh contract data
      window.location.reload()
    } catch (error) {
      console.error('Error escrowing funds:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to escrow funds')
    } finally {
      setEscrowing(false)
    }
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'pending_client_signature': return 'bg-yellow-500'
      case 'pending_freelancer_signature': return 'bg-blue-500'
      case 'pending_escrow': return 'bg-orange-500'
      case 'completed': return 'bg-green-600'
      case 'cancelled': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active'
      case 'pending_client_signature': return 'Pending Client Signature'
      case 'pending_freelancer_signature': return 'Pending Freelancer Signature'
      case 'pending_escrow': return 'Pending Escrow'
      case 'completed': return 'Completed'
      case 'cancelled': return 'Cancelled'
      default: return status
    }
  }
  
  const isClient = user?.role === 'client'
  const canClientSign = isClient && !contract?.signatures.client.signed
  const canClientEscrow = isClient && contract?.signatures.client.signed && !contract?.escrow.funded
  const canFreelancerSign = !isClient && contract?.signatures.client.signed && contract?.escrow.funded && !contract?.signatures.freelancer.signed
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600">Loading contract...</p>
        </div>
      </div>
    )
  }
  
  if (error || !contract) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Contract Not Found</h3>
            <p className="text-slate-600 mb-4">{error || 'The contract you are looking for does not exist.'}</p>
            <Button onClick={() => window.history.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-slate-800">Contract Agreement</h1>
            <Badge className={`${getStatusColor(contract.status)} text-white px-3 py-1`}>
              {getStatusText(contract.status)}
            </Badge>
          </div>
          <p className="text-slate-600">Review and manage your contract agreement</p>
        </div>
        
        {/* Status Alert */}
        {contract.status === 'pending_client_signature' && isClient && (
          <Alert className="mb-6 border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Please review and sign this contract to proceed. After signing, you'll need to escrow the funds.
            </AlertDescription>
          </Alert>
        )}
        
        {contract.status === 'pending_escrow' && isClient && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              Contract signed! Please escrow the funds to notify the freelancer for signing.
            </AlertDescription>
          </Alert>
        )}
        
        {contract.status === 'pending_freelancer_signature' && !isClient && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              The client has signed and escrowed funds. Please review and sign this contract to start working.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Contract Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contract Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Contract Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-800 mb-2">{contract.title}</h3>
                  <p className="text-slate-600">{contract.description}</p>
                </div>
                
                <Separator />
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-slate-700 mb-1">Total Budget</h4>
                    <p className="text-2xl font-bold text-green-600">
                      {contract.budget.amount} {contract.budget.currency}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-700 mb-1">Created</h4>
                    <p className="text-slate-600">
                      {new Date(contract.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Milestones */}
            <Card>
              <CardHeader>
                <CardTitle>Project Milestones</CardTitle>
                <CardDescription>Breakdown of work and payments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contract.milestones.map((milestone, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-slate-800">{milestone.name}</h4>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">
                            {milestone.amount} {contract.budget.currency}
                          </p>
                          <p className="text-sm text-slate-500">{milestone.duration}</p>
                        </div>
                      </div>
                      <p className="text-slate-600 text-sm">{milestone.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Payment Terms */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Payment Terms & Conditions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-slate-700 mb-2">Escrow Amount</h4>
                  <p className="text-lg font-semibold text-green-600">
                    {contract.paymentTerms.escrowAmount} {contract.budget.currency}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-slate-700 mb-2">Release Conditions</h4>
                  <p className="text-slate-600">{contract.paymentTerms.releaseConditions}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-slate-700 mb-2">Penalty Clause</h4>
                  <p className="text-slate-600">{contract.paymentTerms.penaltyClause}</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Parties */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Contract Parties
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={contract.client.avatar} />
                    <AvatarFallback>{contract.client.fullname.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{contract.client.fullname}</p>
                    <p className="text-sm text-slate-500">Client</p>
                  </div>
                  {contract.signatures.client.signed && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>
                
                <Separator />
                
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={contract.freelancer.avatar} />
                    <AvatarFallback>{contract.freelancer.fullname.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{contract.freelancer.fullname}</p>
                    <p className="text-sm text-slate-500">Freelancer</p>
                  </div>
                  {contract.signatures.freelancer.signed && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Escrow Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Escrow Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Amount:</span>
                    <span className="font-semibold">
                      {contract.escrow.amount} {contract.escrow.currency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Status:</span>
                    <Badge className={contract.escrow.funded ? 'bg-green-500' : 'bg-gray-500'}>
                      {contract.escrow.funded ? 'Funded' : 'Pending'}
                    </Badge>
                  </div>
                  {contract.escrow.fundedAt && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Funded:</span>
                      <span className="text-sm">
                        {new Date(contract.escrow.fundedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {canClientSign && (
                  <Dialog open={showSignDialog} onOpenChange={setShowSignDialog}>
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        <FileText className="w-4 h-4 mr-2" />
                        Sign Contract
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Sign Contract</DialogTitle>
                        <DialogDescription>
                          By signing this contract, you agree to all terms and conditions outlined above.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p className="text-sm text-slate-600">
                          This action will digitally sign the contract with your account credentials.
                        </p>
                        <div className="flex gap-2">
                          <Button 
                            onClick={handleSign} 
                            disabled={signing}
                            className="flex-1"
                          >
                            {signing ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4 mr-2" />
                            )}
                            {signing ? 'Signing...' : 'Confirm Signature'}
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setShowSignDialog(false)}
                            disabled={signing}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
                
                {canClientEscrow && (
                  <Button 
                    onClick={handleEscrow} 
                    disabled={escrowing}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {escrowing ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <DollarSign className="w-4 h-4 mr-2" />
                    )}
                    {escrowing ? 'Escrowing...' : 'Escrow Funds'}
                  </Button>
                )}
                
                {canFreelancerSign && (
                  <Dialog open={showSignDialog} onOpenChange={setShowSignDialog}>
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        <FileText className="w-4 h-4 mr-2" />
                        Sign Contract
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Sign Contract</DialogTitle>
                        <DialogDescription>
                          By signing this contract, you agree to all terms and conditions and commit to delivering the work as specified.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p className="text-sm text-slate-600">
                          The client has already signed and escrowed the funds. Signing this contract will make it active and you can start working.
                        </p>
                        <div className="flex gap-2">
                          <Button 
                            onClick={handleSign} 
                            disabled={signing}
                            className="flex-1"
                          >
                            {signing ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4 mr-2" />
                            )}
                            {signing ? 'Signing...' : 'Confirm Signature'}
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setShowSignDialog(false)}
                            disabled={signing}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
                
                {contract.status === 'active' && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Contract is active! Work can now begin.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ContractPage() {
  return (
    <ProtectedRoute 
      requireAuth={true}
      requireCompleteProfile={true}
    >
      <ContractContent />
    </ProtectedRoute>
  )
}