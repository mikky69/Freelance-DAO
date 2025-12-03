"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, CreditCard, Wallet } from "lucide-react"
import { toast } from "sonner"

interface PaymentModalProps {
    isOpen: boolean
    onClose: () => void
    amount: number
    currency: string
    contractId: string
}

export function PaymentModal({ isOpen, onClose, amount, currency, contractId }: PaymentModalProps) {
    const [isLoading, setIsLoading] = useState(false)

    const handlePaystackPayment = async () => {
        setIsLoading(true)
        try {
            const token = localStorage.getItem('freelancedao_token')
            const response = await fetch('/api/payments/initialize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    contractId,
                    amount
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Failed to initialize payment')
            }

            // Redirect to Paystack
            window.location.href = data.authorization_url
        } catch (error) {
            console.error('Payment initialization error:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to initialize payment')
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Fund Escrow</DialogTitle>
                    <DialogDescription>
                        Choose your preferred payment method to fund the escrow.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="fiat" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="fiat">Fiat (Paystack)</TabsTrigger>
                        <TabsTrigger value="crypto">Crypto</TabsTrigger>
                    </TabsList>

                    <TabsContent value="fiat" className="space-y-4 py-4">
                        <div className="bg-slate-50 p-4 rounded-lg border">
                            <div className="flex justify-between mb-2">
                                <span className="text-sm text-slate-500">Amount to Pay</span>
                                <span className="font-medium">{amount} {currency}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Gateway</span>
                                <span className="font-medium">Paystack</span>
                            </div>
                            <div className="mt-4 text-xs text-slate-500">
                                You will be redirected to Paystack to complete the payment in NGN.
                            </div>
                        </div>

                        <Button
                            className="w-full"
                            onClick={handlePaystackPayment}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    Pay with Paystack
                                </>
                            )}
                        </Button>
                    </TabsContent>

                    <TabsContent value="crypto" className="space-y-4 py-4">
                        <div className="bg-slate-50 p-4 rounded-lg border">
                            <div className="flex justify-between mb-2">
                                <span className="text-sm text-slate-500">Amount to Pay</span>
                                <span className="font-medium">{amount} {currency}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Network</span>
                                <span className="font-medium">Hedera (HBAR)</span>
                            </div>
                        </div>

                        <Button className="w-full" variant="outline" disabled>
                            <Wallet className="mr-2 h-4 w-4" />
                            Crypto Payment (Coming Soon)
                        </Button>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
