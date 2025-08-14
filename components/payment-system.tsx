"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, Shield, Clock, CheckCircle, Send, Receipt, Wallet, ExternalLink } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { hederaClient } from "@/lib/hedera-client"

interface PaymentProps {
  recipientId: string
  recipientName: string
  projectTitle: string
  amount?: number
  milestoneId?: string
  onPaymentComplete?: (transactionId: string) => void
}

export function PaymentSystem({
  recipientId,
  recipientName,
  projectTitle,
  amount: initialAmount,
  milestoneId,
  onPaymentComplete,
}: PaymentProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [amount, setAmount] = useState(initialAmount?.toString() || "")
  const [memo, setMemo] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "escrow">("wallet")

  const handlePayment = async () => {
    if (!amount || Number.parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    setIsProcessing(true)

    try {
      if (paymentMethod === "escrow" && milestoneId) {
        // Release milestone payment through smart contract
        const result = await hederaClient.releaseMilestonePayment(
          "0.0.123456", // contract ID
          milestoneId,
          Number.parseFloat(amount),
        )

        if (result.success) {
          toast.success("Milestone payment released successfully!")
          onPaymentComplete?.(result.transactionId)
        } else {
          toast.error(result.error || "Payment failed")
        }
      } else {
        // Direct wallet payment
        await new Promise((resolve) => setTimeout(resolve, 2000))
        const transactionId = `0.0.${Math.floor(Math.random() * 1000000)}@${Date.now()}`

        toast.success("Payment sent successfully!")
        onPaymentComplete?.(transactionId)
      }

      setIsOpen(false)
      setAmount("")
      setMemo("")
    } catch (error) {
      toast.error("Payment failed. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const estimatedFees = Number.parseFloat(amount || "0") * 0.001 // 0.1% fee

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-500 hover:bg-green-600">
          <DollarSign className="w-4 h-4 mr-2" />
          Send Payment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Send Payment</DialogTitle>
          <DialogDescription>
            Send secure payment to {recipientName} for "{projectTitle}"
          </DialogDescription>
        </DialogHeader>

        <Tabs value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as "wallet" | "escrow")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="wallet">Direct Payment</TabsTrigger>
            <TabsTrigger value="escrow">Escrow Release</TabsTrigger>
          </TabsList>

          <TabsContent value="wallet" className="space-y-6">
            <Alert>
              <Wallet className="h-4 w-4" />
              <AlertDescription>
                Direct payment will be sent immediately from your wallet to the recipient.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount (HBAR)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-lg"
                />
              </div>

              <div>
                <Label htmlFor="memo">Memo (Optional)</Label>
                <Input
                  id="memo"
                  placeholder="Payment description"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                />
              </div>

              {/* Payment Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Payment Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Recipient:</span>
                    <span className="font-medium">{recipientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Amount:</span>
                    <span className="font-medium">{amount || "0"} HBAR</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Network Fee:</span>
                    <span className="font-medium">{estimatedFees.toFixed(4)} HBAR</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold">Total:</span>
                    <span className="font-semibold">
                      {(Number.parseFloat(amount || "0") + estimatedFees).toFixed(4)} HBAR
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="escrow" className="space-y-6">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Release payment from escrow smart contract after milestone completion.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <Label htmlFor="escrow-amount">Release Amount (HBAR)</Label>
                <Input
                  id="escrow-amount"
                  type="number"
                  placeholder="Enter amount to release"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-lg"
                />
              </div>

              {/* Escrow Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Escrow Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Contract ID:</span>
                    <span className="font-mono text-sm">0.0.123456</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Available Balance:</span>
                    <span className="font-medium">2,500 HBAR</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Release Amount:</span>
                    <span className="font-medium">{amount || "0"} HBAR</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Remaining:</span>
                    <span className="font-medium">{(2500 - Number.parseFloat(amount || "0")).toFixed(2)} HBAR</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Security Features */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Shield className="w-5 h-5 mr-2 text-green-500" />
              Security Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-1" />
                <div className="text-xs text-green-700">Encrypted</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Clock className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                <div className="text-xs text-blue-700">Fast Settlement</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <Receipt className="w-6 h-6 text-purple-500 mx-auto mb-1" />
                <div className="text-xs text-purple-700">Immutable Record</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handlePayment}
            disabled={isProcessing || !amount || Number.parseFloat(amount) <= 0}
            className="bg-green-500 hover:bg-green-600"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Payment
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function PaymentHistory() {
  const [transactions] = useState([
    {
      id: "1",
      type: "sent",
      amount: "1,500",
      recipient: "John Developer",
      project: "Website Development",
      date: "2024-12-15",
      status: "completed",
      transactionId: "0.0.123456@1702656000",
    },
    {
      id: "2",
      type: "received",
      amount: "2,200",
      sender: "TechCorp Inc.",
      project: "Mobile App Design",
      date: "2024-12-14",
      status: "completed",
      transactionId: "0.0.789012@1702569600",
    },
    {
      id: "3",
      type: "escrow",
      amount: "3,000",
      project: "Smart Contract Audit",
      date: "2024-12-13",
      status: "locked",
      transactionId: "0.0.345678@1702483200",
    },
  ])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Receipt className="w-5 h-5 mr-2" />
          Payment History
        </CardTitle>
        <CardDescription>Your recent transactions and payments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.type === "sent" ? "bg-red-100" : tx.type === "received" ? "bg-green-100" : "bg-blue-100"
                  }`}
                >
                  {tx.type === "sent" ? (
                    <Send className="w-4 h-4 text-red-600" />
                  ) : tx.type === "received" ? (
                    <DollarSign className="w-4 h-4 text-green-600" />
                  ) : (
                    <Shield className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-slate-800">
                    {tx.type === "sent"
                      ? `Sent to ${tx.recipient}`
                      : tx.type === "received"
                        ? `Received from ${tx.sender}`
                        : "Escrow Contract"}
                  </div>
                  <div className="text-sm text-slate-600">{tx.project}</div>
                  <div className="text-xs text-slate-500">{tx.date}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`font-semibold ${tx.type === "sent" ? "text-red-600" : "text-green-600"}`}>
                  {tx.type === "sent" ? "-" : "+"}
                  {tx.amount} HBAR
                </div>
                <Badge
                  className={
                    tx.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : tx.status === "locked"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-yellow-100 text-yellow-700"
                  }
                >
                  {tx.status}
                </Badge>
                <div className="flex items-center mt-1">
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
  )
}
