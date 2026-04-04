'use client'

import { Button } from "@/components/ui/button"
import { Loader2, Shield, Layers } from "lucide-react"
import type { JobType } from "../hooks/useBasePostJobForm"

export const PostJobActions = ({
  onSubmit,
  isSubmitting,
  isPending,
  isConfirming,
  budgetEth,
  jobType,
  milestoneTotalEth,
}: {
  onSubmit: () => void
  isSubmitting: boolean
  isPending: boolean
  isConfirming: boolean
  budgetEth: string
  jobType?: JobType
  milestoneTotalEth?: number
}) => {
  const busy = isSubmitting || isPending || isConfirming

  const displayAmount = jobType === "milestone"
    ? milestoneTotalEth && milestoneTotalEth > 0
      ? `${milestoneTotalEth.toFixed(6)} ETH`
      : "ETH"
    : budgetEth
      ? `${budgetEth} ETH`
      : "ETH"

  const Icon = jobType === "milestone" ? Layers : Shield

  const label = () => {
    if (isPending) return <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Waiting for signature...</>
    if (isConfirming) return <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Confirming on-chain...</>
    if (isSubmitting) return <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Posting Job...</>
    return <><Icon className="w-4 h-4 mr-2" />Lock {displayAmount} & Post Job</>
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