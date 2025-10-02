"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, FileText, AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"

interface PendingContract {
  _id: string;
  title: string;
  status: string;
  budget: {
    amount: number;
    currency: string;
  };
  createdAt: string;
}

export function ContractNotification() {
  const { user } = useAuth()
  const [pendingContracts, setPendingContracts] = useState<PendingContract[]>([])
  const [dismissed, setDismissed] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchPendingContracts = async () => {
      if (!user) {
        setLoading(false)
        return
      }
      
      try {
        const token = localStorage.getItem('freelancedao_token')
        if (!token) return
        
        let status = ''
        if (user.role === 'client') {
          status = 'pending_client_signature'
        } else if (user.role === 'freelancer') {
          status = 'pending_freelancer_signature'
        } else {
          setLoading(false)
          return
        }
        
        const response = await fetch(`/api/contracts?status=${status}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
        
        if (response.ok) {
          const data = await response.json()
          setPendingContracts(data.contracts || [])
        }
      } catch (error) {
        console.error('Error fetching pending contracts:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchPendingContracts()
    
    // Check every 30 seconds for new pending contracts
    const interval = setInterval(fetchPendingContracts, 30000)
    
    return () => clearInterval(interval)
  }, [user])
  
  useEffect(() => {
    // Load dismissed contracts from localStorage
    const dismissedFromStorage = localStorage.getItem('dismissed_contract_notifications')
    if (dismissedFromStorage) {
      setDismissed(JSON.parse(dismissedFromStorage))
    }
  }, [])
  
  const handleDismiss = (contractId: string) => {
    const newDismissed = [...dismissed, contractId]
    setDismissed(newDismissed)
    localStorage.setItem('dismissed_contract_notifications', JSON.stringify(newDismissed))
  }
  
  const handleDismissAll = () => {
    const allIds = pendingContracts.map(contract => contract._id)
    setDismissed(prev => {
      const newDismissed = [...prev, ...allIds]
      localStorage.setItem('dismissed_contract_notifications', JSON.stringify(newDismissed))
      return newDismissed
    })
  }
  
  if (loading || !user || (user.role !== 'client' && user.role !== 'freelancer')) {
    return null
  }
  
  const visibleContracts = pendingContracts.filter(contract => 
    !dismissed.includes(contract._id)
  )
  
  if (visibleContracts.length === 0) {
    return null
  }
  
  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm space-y-2">
      {visibleContracts.map((contract) => (
        <Card key={contract._id} className="border-orange-200 bg-orange-50 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-orange-800 text-sm">
                    {user?.role === 'client' ? 'Contract Awaiting Signature' : 'Contract Ready to Sign'}
                  </h4>
                  <p className="text-orange-700 text-xs mt-1">
                    {contract.title}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDismiss(contract._id)}
                className="h-6 w-6 p-0 text-orange-600 hover:text-orange-800 hover:bg-orange-100"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center justify-between mb-3">
              <Badge className="bg-orange-100 text-orange-800 text-xs">
                {contract.budget.amount} {contract.budget.currency}
              </Badge>
              <span className="text-xs text-orange-600">
                {new Date(contract.createdAt).toLocaleDateString()}
              </span>
            </div>
            
            <div className="flex gap-2">
              <Link href={`/contracts/${contract._id}`} className="flex-1">
                <Button size="sm" className="w-full bg-orange-600 hover:bg-orange-700 text-white text-xs">
                  <FileText className="w-3 h-3 mr-1" />
                  Sign Contract
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {visibleContracts.length > 1 && (
        <div className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismissAll}
            className="text-xs text-orange-600 hover:text-orange-800"
          >
            Dismiss All
          </Button>
        </div>
      )}
    </div>
  )
}