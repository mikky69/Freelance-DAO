"use client"

import { toast } from "sonner"
import { ExternalLink, CheckCircle, Loader2, XCircle } from "lucide-react"

const BASESCAN_TX = "https://sepolia.basescan.org/tx"

function TxLink({ hash }: { hash: string }) {
  return (
    <a
      href={`${BASESCAN_TX}/${hash}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 mt-1 text-xs font-medium underline underline-offset-2 opacity-80 hover:opacity-100 transition-opacity"
    >
      View transaction on Base blockchain <ExternalLink className="w-3 h-3" />
    </a>
  )
}

/** Show a "submitted" toast as soon as the tx hash is known */
export function txSubmittedToast(hash: string, label = "Transaction") {
  toast(
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-2 font-medium">
        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
        {label} submitted
      </div>
      <p className="text-xs text-slate-500">Waiting for confirmation on Base…</p>
      <TxLink hash={hash} />
    </div>,
    { duration: 8000, id: hash }
  )
}

/** Replace the submitted toast with a success toast */
export function txSuccessToast(hash: string, label = "Transaction") {
  toast(
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-2 font-medium">
        <CheckCircle className="w-4 h-4 text-green-500" />
        {label} confirmed!
      </div>
      <TxLink hash={hash} />
    </div>,
    { duration: 10000, id: hash }
  )
}

/** Show an error toast — still link to the hash if available */
export function txErrorToast(message: string, hash?: string) {
  toast(
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-2 font-medium text-red-600">
        <XCircle className="w-4 h-4" />
        Transaction failed
      </div>
      <p className="text-xs text-slate-500 line-clamp-2">{message}</p>
      {hash && <TxLink hash={hash} />}
    </div>,
    { duration: 10000 }
  )
}