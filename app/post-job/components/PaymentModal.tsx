'use client'

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CreditCard, Loader2, Wallet } from "lucide-react"

export const PaymentModal = ({ showPaymentModal, setShowPaymentModal, selectedPaymentMethod, setSelectedPaymentMethod, handlePaymentAndSubmit, isSubmitting }: any) => {
  return (
    <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2 text-blue-500" />
            Choose Payment Method
          </DialogTitle>
          <DialogDescription>
            Choose how to complete posting: Crypto wallet or $1 fiat (Paystack)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <RadioGroup value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
            <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer">
              <RadioGroupItem value="crypto" id="crypto" />
              <Label htmlFor="crypto" className="flex-1 cursor-pointer">
                <div className="flex items-center">
                  <Wallet className="w-5 h-5 mr-2 text-green-500" />
                  <div>
                    <div className="font-medium">Crypto (Wallet)</div>
                    <div className="text-sm text-slate-500">Use your connected wallet</div>
                  </div>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer">
              <RadioGroupItem value="fiat" id="fiat" />
              <Label htmlFor="fiat" className="flex-1 cursor-pointer">
                <div className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-blue-500" />
                  <div>
                    <div className="font-medium">Fiat (Paystack)</div>
                    <div className="text-sm text-slate-500">Pay a $1 fee to post</div>
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => setShowPaymentModal(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handlePaymentAndSubmit}
            disabled={!selectedPaymentMethod || isSubmitting}
            className="flex-1 bg-blue-500 hover:bg-blue-600"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Continue with Payment'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
