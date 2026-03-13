'use client'

import { Button } from "@/components/ui/button"
import { Loader2, Shield } from "lucide-react"

export const PostJobActions = ({
  onSubmit,
  isSubmitting,
  isPending,
  isConfirming,
  budgetEth,
}: {
  onSubmit: () => void
  isSubmitting: boolean
  isPending: boolean       // wallet signing in progress
  isConfirming: boolean    // tx broadcast, waiting for block
  budgetEth: string
}) => {
  const busy = isSubmitting || isPending || isConfirming

  const label = () => {
    if (isPending) return (
      <>
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Waiting for signature…
      </>
    )
    if (isConfirming) return (
      <>
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Confirming on-chain…
      </>
    )
    if (isSubmitting) return (
      <>
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Posting Job…
      </>
    )
    return (
      <>
        <Shield className="w-4 h-4 mr-2" />
        Lock {budgetEth ? `${budgetEth} ETH` : 'ETH'} & Post Job
      </>
    )
  }

  return (
    <div className="pt-6">
      <Button
        type="submit"
        onClick={onSubmit}
        disabled={busy}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 text-base font-medium disabled:opacity-50"
      >
        {label()}
      </Button>
      <p className="text-xs text-slate-400 text-center mt-3">
        Your wallet will prompt you to sign the transaction. Gas fees apply.
      </p>
    </div>
  )
}
