'use client'

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CreditCard, Loader2, Info } from "lucide-react"

export const PaymentModal = ({
  showPaymentModal,
  setShowPaymentModal,
  handlePaymentAndSubmit,
  isSubmitting,
  featured,
}: {
  showPaymentModal: boolean
  setShowPaymentModal: (v: boolean) => void
  handlePaymentAndSubmit: () => void
  isSubmitting: boolean
  featured?: boolean
}) => {
  const baseFee = 1
  const featuredFee = featured ? 5 : 0
  const total = baseFee + featuredFee

  return (
    <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2 text-blue-500" />
            Confirm Payment
          </DialogTitle>
          <DialogDescription>
            A small fee is required to publish your job listing.
          </DialogDescription>
        </DialogHeader>

        {/* Fee breakdown */}
        <div className="space-y-3 py-4">
          <div className="bg-slate-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Job posting fee</span>
              <span className="font-medium text-slate-800">${baseFee}.00</span>
            </div>
            {featured && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Featured listing</span>
                <span className="font-medium text-slate-800">+${featuredFee}.00</span>
              </div>
            )}
            <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-semibold">
              <span className="text-slate-800">Total</span>
              <span className="text-blue-600">${total}.00 USD</span>
            </div>
          </div>

          <div className="flex items-start gap-2 text-xs text-slate-500">
            <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-blue-400" />
            <p>Payment is processed securely via Paystack. You will be redirected to complete payment.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => setShowPaymentModal(false)}
            className="flex-1"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePaymentAndSubmit}
            disabled={isSubmitting}
            className="flex-1 bg-blue-500 hover:bg-blue-600"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay $${total}.00 via Paystack`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
